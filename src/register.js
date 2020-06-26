const registerBtn = document.getElementById("registerBtn");

registerBtn.addEventListener("click", (e)=>{
    e.preventDefault();
    
    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("confirm").value;
    const email = document.getElementById("email").value;

    const data = {
        name,
        username,
        password,
        password2,
        email
    }
    url = "http://localhost:5000/register";
    console.log(data)
    console.log(JSON.stringify(data))
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
        console.log('Success:', data);
        alert("Success!");
        setTimeout(()=>{
            window.location.replace("http://127.0.0.1:5500/html/login.html");
        },1000)
    })
    .catch((error) => {
        alert("FAIL")
        console.error('Error:', error);
    });
})