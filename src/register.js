const registerBtn = document.getElementById("registerBtn");

registerBtn.addEventListener("click", (e)=>{
    e.preventDefault();
    defaultProp()

    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("confirm").value;
    const email = document.getElementById("email").value;

    if(password2 !== password){
        const text = document.createElement("p");
        text.textContent = "Password doesn't match";
        text.classList.add("wrong")
        const parent = document.getElementById("confirm").parentElement;
        parent.parentElement.parentElement.appendChild(text)
        parent.classList.add("animate__animated","animate__shakeX")
    }    

    const data = {
        name,
        username,
        password,
        password2,
        email
    }
    url = "https://face-expression-app.herokuapp.com/register";
    console.log(data);
    console.log(JSON.stringify(data))
    fetch(url, {
        method: 'POST',
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
            console.log('Success:', data);
            alert("Success!");
        }
    })
    .then(()=>{
        window.location.replace("http://127.0.0.1:5500/html/login.html");
    })
    .catch((error) => {
        // alert(error)
        console.log(error)
        
        Promise.resolve(error)
        .then((err)=>{
            console.log(err.username, err.email)
            if(err.username){
                const text = document.createElement("p");
                text.textContent = err.username;
                text.classList.add("wrong")
                const parent = document.getElementById("username").parentElement;
                parent.parentElement.parentElement.appendChild(text)
                parent.classList.add("animate__animated","animate__shakeX")
            }if(err.email){
                const text = document.createElement("p");
                text.textContent = err.email;
                text.classList.add("wrong")
                const parent = document.getElementById("email").parentElement;
                parent.parentElement.parentElement.appendChild(text)
                parent.classList.add("animate__animated","animate__shakeX")
            }
            // alert(err[Object.keys(err)[0]])
        })
    });
})

function defaultProp(){
    document.getElementById("username").parentElement.classList.remove("animate__shakeX")
    document.getElementById("email").parentElement.classList.remove("animate__shakeX")

    if(document.getElementsByClassName("wrong")[0] && document.getElementById("username").parentElement.parentElement.parentElement.children[2]){
        document.getElementById("username").parentElement.parentElement.parentElement.removeChild(document.getElementsByClassName("wrong")[0])
    }
    if(document.getElementsByClassName("wrong")[0] && document.getElementById("email").parentElement.parentElement.parentElement.children[2]){
        document.getElementById("email").parentElement.parentElement.parentElement.removeChild(document.getElementsByClassName("wrong")[0])
    }
    if(document.getElementsByClassName("wrong")[0] && document.getElementById("confirm").parentElement.parentElement.parentElement.children[2]){
        document.getElementById("confirm").parentElement.parentElement.parentElement.removeChild(document.getElementsByClassName("wrong")[0])
    }
}