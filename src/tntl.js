if(!localStorage.getItem("auth-token")){
  window.location.replace("http://127.0.0.1:5500/html/login.html");
}
if(localStorage.getItem("admin")){
  const navbar = document.getElementById("navBar");
  navbar.innerHTML+='<a class="nav-item nav-link" href="./admin.html">Admin panel</a>  '
}
if(!localStorage.getItem("admin")){
  window.location.replace("http://127.0.0.1:5500/index.html");
}
const logoutBtn = document.getElementById("logout");
logoutBtn.addEventListener("click",(e)=>{
  localStorage.removeItem("auth-token")
  if(localStorage.getItem("admin")){
    localStorage.removeItem("admin")
  }
})
var isStart = false;
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
function stopVideo(isStop = false){
    if(isStop){
      document.querySelector(".modalScore").innerHTML = "Your score is " + document.querySelector("#score").innerHTML;
      document.querySelector("#tryAgain").innerHTML = "";
      $('#myModal').modal('show');
    }
    
    localStream.getVideoTracks()[0].stop();
    isWebcamOn = 0;
    document.querySelector("#yt").load();
    document.querySelector("#yt").pause();
    clearInterval(timer);
    document.querySelector("#score").innerHTML = '0';
    isStart = false;

}
async function startVideo() {
  if(!isStart){
    isStart = true;
    document.querySelector("#tryAgain").innerHTML = "Make angry face to try again!";
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
            document.querySelector("#close").addEventListener("click",function () {
              stopVideo(true);
              isStart = false;
              clearInterval(game);
            })
            $('#myModal').modal('show');
            var tryAgain = setInterval(async ()=> {
              const detections1 = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
              if(detections1[0].expressions['angry'] > 0.7){
                $('#myModal').modal('hide');
                clearInterval(tryAgain);
                clearInterval(timer);
                isStart = false;
                clearInterval(game);
                startVideo();
              }
            }, 100 );
        }
    }, 100)
})

