// ==========================================
// theme.js
// ==========================================

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
    document.getElementById("themeBtn").innerText = "☀️";
  } else {
    document.body.classList.remove("dark");
    document.getElementById("themeBtn").innerText = "🌙";
  }
}

function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
  if (typeof drawCharts === "function") drawCharts();
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(saved);
}