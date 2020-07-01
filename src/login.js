const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", (e)=>{
    e.preventDefault();
    defaultProp()

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    const data = {
        username,
        password
    }
    const url = "https://face-expression-app.herokuapp.com/login";
    console.log(data)
    fetch(url, {
        method: 'POST', 
        mode: 'cors', 
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
    .then(response => {
        if(response.ok){
            return response.json()
        }
        throw response.json()
    })
    .then(data => {
        if(data){
            console.log('Success:', data.data);
        }
        localStorage.setItem("auth-token",data.accessToken)
        if(data.data.admin === true){
            localStorage.setItem("admin",true)
        }
        return
    })
    .then(()=>{
        window.location.replace("http://127.0.0.1:5500/html/homepage.html");
    })

    .catch((error) => {
        Promise.resolve(error)
        .then((err)=>{
            console.log(err.username, err.password)
            if(err.username){
                const text = document.createElement("p");
                text.textContent = err.username;
                text.classList.add("wrong")
                const parent = document.getElementById("username").parentElement;
                parent.appendChild(text)
                parent.children[0].classList.add("animate__animated","animate__shakeX")
            }if(err.password){
                const text = document.createElement("p");
                text.textContent = err.password;
                text.classList.add("wrong")
                const parent = document.getElementById("password").parentElement;
                parent.appendChild(text)
                parent.children[0].classList.add("animate__animated","animate__shakeX")
            }
        });
    })
})

function defaultProp(){
    document.getElementById("username").classList.remove("animate__shakeX")
    document.getElementById("password").classList.remove("animate__shakeX")

    if(document.getElementsByClassName("wrong")[0] && document.getElementById("username").parentElement.children[1]){
        document.getElementById("username").parentElement.removeChild(document.getElementsByClassName("wrong")[0])
    }
    if(document.getElementsByClassName("wrong")[0] && document.getElementById("password").parentElement.children[1]){
        document.getElementById("password").parentElement.removeChild(document.getElementsByClassName("wrong")[0])
    }
}