const token = localStorage.getItem("token");
const isOAuth = window.location.search.includes("status");

if (!token && !isOAuth) {
    window.location.href = "http://localhost:5500/smd_ai_ver2/frontend/index.html";
}


function getUsernameFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = token.split(".")[1];
  const decoded = JSON.parse(atob(payload));
  return decoded.username || decoded.sub;
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams(window.location.search);
  if (!token && !params.get("status")) {
    window.location.href = "http://localhost:5500/smd_ai_ver2/frontend/index.html";
    return;
  }
  let username = getUsernameFromToken();
  username = username.charAt(0).toUpperCase() + username.slice(1);
  document.getElementById("userdisplay").textContent = `${username}`;
  handleOAuthResult();
  loadConnections();
});

function logout() {
  localStorage.clear();
  window.location.href = "http://localhost:5500/smd_ai_ver2/frontend/index.html";
}

let selectplatform1;
function selectPlatform(element) {
    if(element.classList.contains("youtube")){
      selectplatform1='youtube';
    }
    else if(element.classList.contains("github")){
      selectplatform1='github';
    }
    else if(element.classList.contains("instagram")){
      selectplatform1='instagram';
    }
    else if(element.classList.contains("facebook")){
      selectplatform1='facebook';
    }
}

function startOAuth() {
    const inputV = document.getElementById("ip2").value;
    let platform=selectplatform1;
    if (!inputV) {
      alert("Please enter value");
      return;
    }
    const payload = {
      user_id: getUsernameFromToken(),
      input: inputV
    };
    const state = btoa(JSON.stringify(payload));
    window.location.href = `http://localhost:5000/auth/${platform}?state=${encodeURIComponent(state)}`;
}

function handleOAuthResult() {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const userinputvalue=params.get('input');
    const platform=params.get('platform');
    if (status === "success") {
      if(userinputvalue===params.get('username')){
        let input=params.get('username');
        if(platform==='youtube'){
          const conbtn1=document.getElementById("analyze_btn1c");
          const discbtn1=document.getElementById("analyze_btn1d");
          const userdiv=document.getElementById("alluserids1");
          conbtn1.disabled=true;
          discbtn1.disabled=false;
          userdiv.insertAdjacentHTML("beforeend", adduseriddiv(input));
        }
        else if(platform==='github'){
          console.log("insisde here");
          const conbtn1=document.getElementById("analyze_btn2c");
          const discbtn1=document.getElementById("analyze_btn2d");
          const userdiv=document.getElementById("alluserids2");
          conbtn1.disabled=true;
          discbtn1.disabled=false;
          userdiv.innerHTML+= adduseriddiv(input);
        }
        else if(platform==='instagram'){
          const conbtn1=document.getElementById("analyze_btn3c");
          const discbtn1=document.getElementById("analyze_btn3d");
          const userdiv=document.getElementById("alluserids3");
          conbtn1.disabled=true;
          discbtn1.disabled=false;
          userdiv.insertAdjacentHTML("beforeend", adduseriddiv(input));
        }
        else if(platform==='facebook'){
          const conbtn1=document.getElementById("analyze_btn4c");
          const discbtn1=document.getElementById("analyze_btn4d");
          const userdiv=document.getElementById("alluserids4");
          conbtn1.disabled=true;
          discbtn1.disabled=false;
          userdiv.insertAdjacentHTML("beforeend", adduseriddiv(input));
        }
      }
      else{
        if(userinputvalue===undefined)return;
        alert("Input value and username of account should match!!");
      }
    }
    return;
}

function adduseriddiv(platform, username, isActive) {
  return `
    <div class="userids ${isActive ? 'active-user' : ''}" data-platform="${platform}" data-username="${username}">
        <p>${username}</p>
        <div>
          <button onclick="selectUser('${platform}', '${username}')">
            ${isActive ? 'Active' : 'Select'}
          </button>
          <button onclick="deleteUser('${platform}', '${username}')">
            Delete
          </button>
        </div>
    </div>
  `;
}

function selectUser(platform, username) {
    fetch("http://localhost:5000/api/set_active", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token") 
        },
        body: JSON.stringify({ platform, username })
    })
    .then(() => loadConnections());
}

function deleteUser(platform, username) {
    fetch("http://localhost:5000/api/delete_connection", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token") 
        },
        body: JSON.stringify({ platform, username })
    })
    .then(() => loadConnections());
}

function getContainerId(platform) {
    return {
        youtube: "alluserids1",
        github: "alluserids2",
        instagram: "alluserids3",
        facebook: "alluserids4"
    }[platform];
}

function loadConnections() {
    fetch("http://localhost:5000/api/connections",{
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    })
    .then(res => res.json())
    .then(data => {
        Object.keys(data).forEach(platform => {
            const container = document.getElementById(getContainerId(platform));
            container.innerHTML = "";
            data[platform].forEach(obj => {
                container.innerHTML+=adduseriddiv(platform, obj.username, obj.active);
            });
            if(container.children.length > 0){
              let disbtn;
              if(platform==='youtube')disbtn=document.getElementById('analyze_btn1d');
              else if(platform==='github')disbtn=document.getElementById('analyze_btn2d');
              else if(platform==='instagram')disbtn=document.getElementById('analyze_btn3d');
              else if(platform==='facebook')disbtn=document.getElementById('analyze_btn4d');
              disbtn.disabled=!disbtn.disabled;
            }
        });
    });
}

function disconnectid(btn){
  const gparent=btn.parentElement.parentElement;
  let userdiv;
  let platform;
  if(gparent.classList.contains('youtube')){
    platform='youtube';
    userdiv=document.getElementById('alluserids1');
  }
  else if(gparent.classList.contains('github')){
    platform='github';
    userdiv=document.getElementById('alluserids2');
  }
  else if(gparent.classList.contains('instagram')){
    platform='instagram';
    userdiv=document.getElementById('alluserids3');
  }
  else if(gparent.classList.contains('facebook')){
    platform='facebook';
    userdiv=document.getElementById('alluserids4');
  };
  let username;
  for(const tile of userdiv.children){
    if(tile.classList.contains('active-user')){
      username = tile.querySelector('p').textContent;
      break;
    }
  }
  deleteUser(platform,username);
  return;
}

