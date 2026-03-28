function showRegister() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("register-form").style.display = "block";
}

function showLogin() {
  document.getElementById("register-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
}

/* REGISTER USER */
function register() {
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;
  
  fetch("http://localhost:5000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("Registration successful. Please login.");
      showLogin();
    } else {
      alert(data.error);
    }
  });
}

/* LOGIN USER */
function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  fetch("http://localhost:5000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.access_token) {
      console.log("inside auth file");
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", data.username);
      window.location.href = "./analytics.html";
    } else {
      alert(data.error);
    }
  });
}

