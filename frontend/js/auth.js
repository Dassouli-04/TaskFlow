const tokenKey = "taskflow_token";
const userKey = "taskflow_user";

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const message = document.getElementById("message");
const welcomeMessage = document.getElementById("welcomeMessage");

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await api.post("/auth/register", {
        fullName,
        email,
        password
      });

      localStorage.setItem(tokenKey, response.data.token);
      localStorage.setItem(userKey, JSON.stringify(response.data.user));

      window.location.href = "dashboard.html";
    } catch (error) {
      message.textContent =
        error.response?.data?.message || "Registration failed";
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await api.post("/auth/login", {
        email,
        password
      });

      localStorage.setItem(tokenKey, response.data.token);
      localStorage.setItem(userKey, JSON.stringify(response.data.user));

      window.location.href = "dashboard.html";
    } catch (error) {
      message.textContent =
        error.response?.data?.message || "Login failed";
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    window.location.href = "login.html";
  });
}

if (welcomeMessage) {
  const restoreSession = async () => {
    const token = localStorage.getItem(tokenKey);

    if (!token) {
      window.location.href = "login.html";
      return;
    }

    try {
      const response = await api.get("/auth/me");

      const user = response.data.user;

      localStorage.setItem(userKey, JSON.stringify(user));

      welcomeMessage.textContent = `Welcome, ${user.fullName}`;
    } catch (error) {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);

      window.location.href = "login.html";
    }
  };

  restoreSession();
}