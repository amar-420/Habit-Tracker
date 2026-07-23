// ==========================================
// app.js
// App entry point: wires everything together
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // Header date
  document.getElementById("todayDate").innerText = getTodayLabel();

  // Footer year
  const footerYear = document.getElementById("footerYear");
  if (footerYear) footerYear.innerText = new Date().getFullYear();

  // Theme
  initTheme();
  document.getElementById("themeBtn").addEventListener("click", toggleTheme);

  // Week navigation (Dashboard)
  document.getElementById("prevWeek").addEventListener("click", goPrevWeek);
  document.getElementById("nextWeek").addEventListener("click", goNextWeek);

  // Month navigation (Calendar)
  document.getElementById("prevCalMonth").addEventListener("click", goPrevCalMonth);
  document.getElementById("nextCalMonth").addEventListener("click", goNextCalMonth);

  // Back button (Analytics detail -> list)
  document.getElementById("backToAnalyticsList").addEventListener("click", renderAnalyticsList);

  // Edit habit modal
  document.getElementById("saveHabitEditBtn").addEventListener("click", saveHabitEdit);
  document.getElementById("cancelHabitEditBtn").addEventListener("click", closeEditHabitModal);
  document.getElementById("editHabitModal").addEventListener("click", (e) => {
    if (e.target.id === "editHabitModal") closeEditHabitModal();
  });


  // Add habit
  const habitInput = document.getElementById("habitInput");
  document.getElementById("addHabitBtn").addEventListener("click", () => {
    addHabit(habitInput.value);
    habitInput.value = "";
  });
  habitInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addHabit(habitInput.value);
      habitInput.value = "";
    }
  });

  // Sidebar navigation (switch views)
  document.querySelectorAll(".navBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".navBtn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
      document.getElementById(btn.dataset.target).classList.remove("hidden");

      if (btn.dataset.target === "calendarSection") {
        renderCalendarView();
      }
      if (btn.dataset.target === "analyticsSection") {
        renderAnalyticsList();
      }
    });
  });

  // Settings: export / import / clear
  document.getElementById("exportBtn").addEventListener("click", exportBackup);
  document.getElementById("exportCsvBtn").addEventListener("click", exportCsv);
  document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importFile").click();
  });
  document.getElementById("importFile").addEventListener("change", (e) => {
    if (e.target.files[0]) restoreBackup(e.target.files[0]);
  });
  document.getElementById("clearAllBtn").addEventListener("click", () => {
    if (confirm("This will permanently delete all habits and progress. Continue?")) {
      clearAllData();
      location.reload();
    }
  });

  // Initial render
  renderHabits();
});
