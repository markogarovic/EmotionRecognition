const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", (e)=>{
    e.preventDefault();
    
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    const data = {
        username,
        password
    }
    url = "http://localhost:5000/login";
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
    .then(response => response.json())
    .then(data => {
        if(data){
            console.log('Success:', data.data);
        }
        localStorage.setItem("auth-token",data.accessToken)
        return
    })
    .then(()=>{
        window.location.replace("http://127.0.0.1:5500/index.html");
    })

    .catch((error) => {
        console.error('Error:', error);
    });
})