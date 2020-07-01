if(!localStorage.getItem("auth-token")){
  window.location.replace("http://127.0.0.1:5500/html/login.html");
}
if(localStorage.getItem("admin")){
  const navbar = document.getElementById("navBar");
  navbar.innerHTML+='<a class="nav-item nav-link" href="./admin.html">Admin panel</a>  '
}

const logoutBtn = document.getElementById("logout");
logoutBtn.addEventListener("click",(e)=>{
  localStorage.removeItem("auth-token")
  if(localStorage.getItem("admin")){
    localStorage.removeItem("admin")
  }
})

let net;  
let localStream;
const webcamElement = document.getElementById("webcam");  
const classifierKNN = knnClassifier.create();
var currentState = 0;
var isWebcamOn = 0;
var NUM_CLASSES = 5;

let extractor;
let classifier;
let xs;
let ys;

var SAMPLE_BOX = {
	0: 0,
	1: 0,
	2: 0,
	3: 0
}
var CLASS_MAP = {
	0: "emotion-laugh",
	1: "emotion-sad",
	2: "emotion-wow",
	3: "emotion-angry"
}

async function setupWebcam() {  
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigatorAny.webkitGetUserMedia ||
      navigatorAny.mozGetUserMedia ||
      navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia(
        { video: true },
        stream => {
          localStream = stream;
          isWebcamOn = 1;
          webcamElement.srcObject = stream;
          webcamElement.addEventListener("loadeddata", () => resolve(), false);
        },
        error => reject()
      );
    } else {
      alert("Something wrong with webcam!");
		  isWebcamOn = 0;
      reject();
    }
  });
}
function stopWebcam(){
  localStream.getVideoTracks()[0].stop();
  isWebcamOn = 0;
  isPredicting = false;
  isPredictingKNN = false;
  console.log(isPredictingKNN);
  unhighlightTiles();
	
}
function unhighlightTiles(){
  var tile_plays = document.getElementsByClassName("emotion-box");
  for (var i = 0; i < tile_plays.length; i++) {
    if (tile_plays[i].classList.contains("highlight")) {
      tile_plays[i].classList.remove("highlight");
      console.log(tile_plays[i]);
    }
	}
}
function changeState(e){
  radio = e.target;
  if(currentState != radio.value){
    if(radio.value == 0){
      document.querySelector(".custom-classifier-container").classList.add("hidden");
      document.querySelector(".KNN-container").classList.remove("hidden");
      currentState = 0;
    }else{
      document.querySelector(".KNN-container").classList.add("hidden");
      document.querySelector(".custom-classifier-container").classList.remove("hidden");
      currentState = 1;
    }
  }
}
function highlightTile(classId) {
	var tile_play    = document.getElementById(CLASS_MAP[classId]);	

	unhighlightTiles();
  tile_play.classList.add("highlight");
}

function captureWebcam() {
	var video = document.getElementById("webcam");
  
	var canvas    = document.createElement("canvas");
	var context   = canvas.getContext('2d');
	canvas.width  = video.width;
	canvas.height = video.height;

	context.drawImage(video, 0, 0, video.width, video.height);
	tensor_image = preprocessImage(canvas);

	var canvasObj = {
    	canvasElement: canvas,
    	canvasTensor : tensor_image
  	};

	return canvasObj;
}
function captureSample(obj, label) {
	if (isWebcamOn == 1) {
		canvasObj = captureWebcam();
		canvas = canvasObj["canvasElement"];
		tensor_image = canvasObj["canvasTensor"];
	  
		var img    = obj.previousSibling.previousSibling.children[0];
  	img.src    = canvas.toDataURL();

		// add the sample to the training tensor
		addSampleToTensor(extractor.predict(tensor_image), label);

    SAMPLE_BOX[label] += 1;
    obj.nextSibling.nextSibling.innerHTML = SAMPLE_BOX[label] + " samples";
	
	} else {
		alert("Please turn on the webcam first!")
	}
}
function preprocessImage(img) {
	const tensor        = tf.browser.fromPixels(img).resizeNearestNeighbor([448, 448]);
	const croppedTensor = cropImage(tensor);
	const batchedTensor = croppedTensor.expandDims(0);
	
	return batchedTensor.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
}
function cropImage(img) {
	const size = Math.min(img.shape[0], img.shape[1]);
	const centerHeight = img.shape[0] / 2;
	const beginHeight = centerHeight - (size / 2);
	const centerWidth = img.shape[1] / 2;
	const beginWidth = centerWidth - (size / 2);
	return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
}
function addSampleToTensor(sample, label) {
	const y = tf.tidy(
		() => tf.oneHot(tf.tensor1d([label]).toInt(), NUM_CLASSES));
	if(xs == null) {
		xs = tf.keep(sample);
		ys = tf.keep(y);
	} else {
		const oldX = xs;
		xs = tf.keep(oldX.concat(sample, 0));
		const oldY = ys;
		ys = tf.keep(oldY.concat(y, 0));
		oldX.dispose();
		oldY.dispose();
		y.dispose();
	}
}

async function train() {
  
  var selectLearningRate = document.getElementById("emotion-learning-rate");
  const learningRate     = selectLearningRate.options[selectLearningRate.selectedIndex].value;

  var selectBatchSize    = document.getElementById("emotion-batch-size");
  const batchSizeFrac    = selectBatchSize.options[selectBatchSize.selectedIndex].value;

  var selectEpochs       = document.getElementById("emotion-epochs");
  const epochs           = selectEpochs.options[selectEpochs.selectedIndex].value;

  var selectHiddenUnits  = document.getElementById("emotion-hidden-units");
  const hiddenUnits      = selectHiddenUnits.options[selectHiddenUnits.selectedIndex].value;
   
  if(xs == null) {
    alert("Please add some samples before training!");
  } else {
    classifier = tf.sequential({
      layers: [
        tf.layers.flatten({inputShape: [7, 7, 256]}),
        tf.layers.dense({
          units: parseInt(hiddenUnits),
          activation: "relu",
          kernelInitializer: "varianceScaling",
          useBias: true
        }),
        tf.layers.dense({
          units: parseInt(NUM_CLASSES),
          kernelInitializer: "varianceScaling",
          useBias: false,
          activation: "softmax"
        })
      ]
    });
  const optimizer = tf.train.adam(learningRate);
  classifier.compile({optimizer: optimizer, loss: "categoricalCrossentropy"});

  const batchSize = Math.floor(xs.shape[0] * parseFloat(batchSizeFrac));
  if(!(batchSize > 0)) {
    alert("Please choose a non-zero fraction for batchSize!");
  }
  
  // create loss visualization
	var lossTextEle = document.getElementById("emotion-loss");
  if (typeof(lossTextEle) != 'undefined' && lossTextEle != null) {
    lossTextEle.innerHTML = "";
  } else {
          
    var lossText = document.createElement("P");
    lossText.setAttribute("id", "emotion-loss");
    lossText.classList.add('emotion-loss');
    document.getElementById("ccc").insertBefore(lossText, document.getElementById("ccc").children[1]);
    var lossTextEle = document.getElementById("emotion-loss");
  }

  classifier.fit(xs, ys, {
    batchSize,
    epochs: parseInt(epochs),
    callbacks: {
      onBatchEnd: async (batch, logs) => {
        lossTextEle.innerHTML = "Loss: " + logs.loss.toFixed(5);
        await tf.nextFrame();
      }
    }
      });
      
}
}



var isPredicting = false;
async function predictPlay() {
	isPredicting = true;
	
    while (isPredicting) {
      
      const predictedClass = tf.tidy(() => {
          canvasObj = captureWebcam();
          canvas = canvasObj["canvasElement"];
          const img = canvasObj["canvasTensor"];
          const features = extractor.predict(img);
          const predictions = classifier.predict(features);
          return predictions.as1D().argMax();
      });

      const classId = (await predictedClass.data())[0];
      predictedClass.dispose();
      highlightTile(classId);

      await tf.nextFrame();
      
    }
    unhighlightTiles();
}

async function loadExtractor() {
	// load mobilenet from Google
	const mnet = await tf.loadLayersModel("https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json");

	// return the mobilenet model with 
	// internal activations from "conv_pw_13_relu" layer
	const feature_layer = mnet.getLayer("conv_pw_13_relu");

	// return mobilenet model with feature activations from specific layer
	extractor = tf.model({inputs: mnet.inputs, outputs: feature_layer.output});
}
var isPredictingKNN = false;
async function Predict () {
  isPredictingKNN = true;
  while(isPredictingKNN){
    console.log(isPredictingKNN);
    if (classifierKNN.getNumClasses() > 0) {
        // Get the activation from mobilenet from the webcam.
        const activation = net.infer(webcamElement, "conv_preds");
        // Get the most likely class and confidences from the classifier module.
        const result = await classifierKNN.predictClass(activation);

        const classes = ["happy", "sad", "suprised", "angry"];
        highlightTile(result.classIndex);
        document.getElementById("console").innerText = `
            prediction: ${classes[result.classIndex]}\n
            probability: ${result.confidences[result.classIndex]}
        `;
        tf.nextFrame();
      }
  }
  unhighlightTiles();
  /*
  Visak poslije izbrisat!
  setInterval(async () => {
      if (classifierKNN.getNumClasses() > 0) {
      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(webcamElement, "conv_preds");
      // Get the most likely class and confidences from the classifier module.
      const result = await classifierKNN.predictClass(activation);

      const classes = ["happy", "sad", "suprised", "angry"];
      highlightTile(result.classIndex);
      document.getElementById("console").innerText = `
          prediction: ${classes[result.classIndex]}\n
          probability: ${result.confidences[result.classIndex]}
      `;
      }

      tf.nextFrame();
  }, 1000);*/
}
function addExampleK(obj,classId){
  if (isWebcamOn == 1) {
  // Get the intermediate activation of MobileNet 'conv_preds' and pass that
  // to the KNN classifier.
  var video = document.getElementById("webcam");
	var canvas    = document.createElement("canvas");
	var context   = canvas.getContext('2d');
	canvas.width  = video.width;
  canvas.height = video.height;
  context.drawImage(video,0,0,video.width, video.height);
  var img    = obj.previousSibling.previousSibling.children[0];
  img.src    = canvas.toDataURL();
  const activation = net.infer(webcamElement, "conv_preds");
  SAMPLE_BOX[classId] += 1;
  obj.nextSibling.nextSibling.innerHTML = SAMPLE_BOX[classId] + " samples";
  // Pass the intermediate activation to the classifier.
  classifierKNN.addExample(activation, classId);
  }
}
async function app() {
  loadExtractor();
  // Load the model.
  net = await mobilenet.load();
  //await setupWebcam();
  // Reads an image from the webcam and associates it with a specific class
  // index.
  // When clicking a button, add an example for that class.
  document.querySelector("#class-laugh").addEventListener("click", (e) => addExampleK(e.target,0));
  document.querySelector("#class-sad").addEventListener("click", (e) => addExampleK(e.target,1));
  document.querySelector("#class-wow").addEventListener("click", (e) => addExampleK(e.target,2));
  document.querySelector("#class-angry").addEventListener("click", (e) => addExampleK(e.target,3));
  document.querySelectorAll(".stop").forEach(element => element.addEventListener("click", () => stopWebcam()));
  document.querySelectorAll(".start").forEach(element => element.addEventListener("click", () => setupWebcam()));
  document.querySelector("#predict").addEventListener("click", Predict);
  //document.querySelector("#train").addEventListener("click", () => train());
  
  document.querySelector("#train2").addEventListener("click", () => train());
  document.querySelector("#predict2").addEventListener("click", predictPlay);
  document.querySelector(".class-a").addEventListener("click",(e) => captureSample(e.target,0));
  document.querySelector(".class-b").addEventListener("click",(e) => captureSample(e.target,1));
  document.querySelector(".class-c").addEventListener("click",(e) => captureSample(e.target,2));
  document.querySelector(".class-d").addEventListener("click", (e) => captureSample(e.target,3));

}
document.querySelector(".classifier-select").addEventListener("click", changeState);
app(); 


