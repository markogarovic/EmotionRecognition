const video = document.getElementById('video');
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('../models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('../models'),
    faceapi.nets.faceExpressionNet.loadFromUri('../models'),
]).then(app)
function app(){
  document.querySelector(".start").addEventListener("click", startVideo);
  document.querySelector(".stop").addEventListener("click", stopVideo);
}
var timer;
function stopVideo(){
    localStream.getVideoTracks()[0].stop();
    isWebcamOn = 0;
    document.querySelector("#yt").load();
    document.querySelector("#yt").pause();
    clearInterval(timer);
    document.querySelector("#score").innerHTML = '0';

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
        var score = 0;
        timer = setInterval(function(){
          score += Math.floor(Math.random() * 10);
          document.querySelector("#score").innerHTML = score.toString();
        },100);
        document.querySelector("#yt").play();
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

video.addEventListener('play', ()=>{
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height}
    faceapi.matchDimensions(canvas, displaySize);
    var game = setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        if(detections[0].expressions['happy'] > 0.6)
        {
            document.querySelector("#yt").load();
            document.querySelector("#yt").pause();
            clearInterval(game);
            clearInterval(timer);
            document.querySelector(".modalScore").innerHTML = "Your score is " + document.querySelector("#score").innerHTML;
            $('#myModal').modal('show');
            var tryAgain = setInterval(async ()=> {
              const detections1 = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
              if(detections1[0].expressions['angry'] > 0.7){
                $('#myModal').modal('hide');
                clearInterval(tryAgain);
                clearInterval(timer);
                startVideo();
              }
            }, 100 );
        }
    }, 100)
})