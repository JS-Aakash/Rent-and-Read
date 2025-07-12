document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("errorMsg");
    if (username === "deliver" && password === "123") {
        window.location.href = "delhome.html";
    }
    else if (username === "admin" && password === "123") {
        window.location.href = "admin.html";
    } else {
        errorMsg.textContent = "Invalid credentials.";
    }
});
