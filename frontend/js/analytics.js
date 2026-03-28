const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "http://localhost:5500/smd_ai_ver2/frontend/index.html";
}

window.addEventListener("beforeunload", () => {
  console.log("PAGE IS RELOADING");
});

function gotoplatforms(){
  window.location.href = "./platforms.html";
}
function toggleDropdown() {
  const dm=document.getElementById("dropdownMenu");
  if(dm.style.display==='block')dm.style.display='none';
  else dm.style.display='block';
}

function getUsernameFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = token.split(".")[1];
  const decoded = JSON.parse(atob(payload));
  return decoded.username || decoded.sub;
}

document.addEventListener("DOMContentLoaded", () => {
  username = getUsernameFromToken();
  if (!username) {
    window.location.href = "http://localhost:5500/smd_ai_ver2/frontend/index.html";
    return;
  }
  username = username.charAt(0).toUpperCase() + username.slice(1);
  document.getElementById("userdisplay").textContent = `${username}`;
});

function logout() {
  localStorage.clear();
  window.location.href = "./index.html";
}

let selectplatform1;
function selectPlatform(element) {
  document.querySelectorAll('.platform-tile').forEach(tile => {
    tile.classList.remove('active');
  });
  element.classList.add('active');
  if (element.classList.contains("youtube")) { selectplatform1 = 'youtube'; }
  else if (element.classList.contains("github")) { selectplatform1 = 'github'; }
  else if (element.classList.contains("instagram")) { selectplatform1 = 'instagram'; }
  else if (element.classList.contains("facebook")) { selectplatform1 = 'facebook'; }
}

let ison=false;
async function analyze(event) {
  if (event) event.preventDefault();
  let input1;
  const platform = selectplatform1;
  let btn1; let loader;
  if(ison)return;
  ison=true;
  if (platform === 'youtube') {
    btn1 = document.getElementById("analyze_btn1");
    loader = document.getElementById("loader1");
  }
  else if (platform === 'github') {
    btn1 = document.getElementById("analyze_btn2");
    loader = document.getElementById("loader2");
  }
  else if (platform === 'instagram') {
    btn1 = document.getElementById("analyze_btn3");
    loader = document.getElementById("loader3");
  }
  else if (platform === 'facebook') {
    btn1 = document.getElementById("analyze_btn4");
    loader = document.getElementById("loader4");
  }
  try {
    btn1.disabled = true;
    loader.style.display = "block";

    fetch(`http://localhost:5000/api/active_account?platform=${platform}`, {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    }).then(res =>{
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.error || "Server Error") });
      }
      return res.json();
    }).then(data1 =>{
      // if (data1.status === "success") {
      //   input1=data1.username;
      // } 
      // else {return null;}
      //uncomment it is important code
    });
    input1 = 'microsoft'; //if you want to force run any user
    fetch(`http://localhost:5000/api/analyze/${platform}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({ input1 })
    }).then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.error || "Server Error") });
      }
      return res.json();
    }).then(data2 =>{
      loader.style.display = "none";
      btn1.disabled = false;
      if (data2.error) {
        alert(data2.error);
        return;
      }
      localStorage.setItem("analysis", JSON.stringify(data2));
      localStorage.setItem("platform", platform);
      window.location.href = "http://localhost:5500/smd_ai_ver2/frontend/dashboard.html";
    }).
    catch (err => {
      console.log(err);
      btn1.disabled = false;
      loader.style.display = "none";
      alert("Something went wrong. Please try again.");
    })
  }
  catch (err) {
    console.log(err);
    btn1.disabled = false;
    loader.style.display = "none";
    alert("Something went wrong. Please try again.");
  }
  finally{ison=false;};
}