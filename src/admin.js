if(!localStorage.getItem("auth-token")){
    window.location.replace("http://127.0.0.1:5500/html/login.html");
}
const logoutBtn = document.getElementById("logout");
logoutBtn.addEventListener("click",(e)=>{
  localStorage.removeItem("auth-token")
  if(localStorage.getItem("admin")){
    localStorage.removeItem("admin")
  }
})

const url = "http://localhost:5000/api/user/all";
var usersIds = []
fetch(url)
.then(res=>res.json())
.then(data =>{
    for(let i = 0; i < data.length; i++){
        const username = data[i].username;
        const todoListItem = document.getElementsByClassName('todo-list')[0];
        if(data[i].admin === false){
            todoListItem.innerHTML+=`<li>
            <div class='form-check'><label class='form-check-label'><input type='checkbox' id='button${i}'/> ${username} <i class='input-helper'>
            </i></label></div><i class='remove mdi mdi-close-circle-outline' id='delBtn${i}'></i>
            </li>`;
        }else{
            todoListItem.innerHTML+=`<li>
            <div class='form-check'><label class='form-check-label'><input type='checkbox' id='button${i}' checked /> ${username} <i class='input-helper'>
            </i></label></div><i class='remove mdi mdi-close-circle-outline' id='delBtn${i}'></i>
            </li>`;
        }
        usersIds.push(data[i]._id);
       

    }
    return data
})
.then(data=>{
    for(let i = 0; i < data.length; i++){
        const delBtn = document.getElementById(`delBtn${i}`)
        const adminBtn = document.getElementById(`button${i}`)

        delBtn.addEventListener("click",(e)=>{
            
            fetch(`http://localhost:5000/api/user/${usersIds[i]}`,{
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res=>res.json())
            .then(data=>{
                console.log("Deleted: ", data)
                delBtn.parentElement.remove()
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        })
        adminBtn.addEventListener("click",(e)=>{
    
            if(adminBtn.checked){
                fetch(`http://localhost:5000/api/user/admin/${usersIds[i]}`,{
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(res=>res.json())
                .then(data=>{
                    console.log("Admin: ", data)
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            }else{
                fetch(`http://localhost:5000/api/user/adminremove/${usersIds[i]}`,{
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(res=>res.json())
                .then(data=>{
                    console.log("User: ", data)
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            }
        })
    }
})
.catch((error) => {
    console.error('Error:', error);
});


