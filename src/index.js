const video = document.getElementById('video')
let localStream;
var isWebcamOn = 0;
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(app)
function app(){
  document.querySelector(".start").addEventListener("click", startVideo);
  document.querySelector(".stop").addEventListener("click", stopVideo);
}
function stopVideo(){
  localStream.getVideoTracks()[0].stop();
  isWebcamOn = 0;
}
async function startVideo() {  
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
          video.srcObject = stream;
          video.addEventListener("loadeddata", () => resolve(), false);
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

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})


const logoutBtn = document.getElementById("logout");
logoutBtn.addEventListener("click",(e)=>{
  localStorage.removeItem("auth-token")
})

if(!localStorage.getItem("auth-token")){
  window.location.replace("http://127.0.0.1:5500/html/login.html");
}
