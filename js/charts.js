// ==========================================
// charts.js
// Per-habit doughnut chart + per-habit yearly heatmap
// (used by the Analytics detail view for whichever habit is selected)
// ==========================================

let habitWeeklyChart = null;

function drawHabitChart(habit, week) {
  const canvas = document.getElementById("habitWeeklyChart");
  if (!canvas || typeof Chart === "undefined") return;

  const subTasks = getEffectiveSubTasks(habit);
  let completed = 0;
  let remaining = 0;

  week.forEach(date => {
    if (isFutureDate(date)) return;
    const key = dateKey(date);
    if (subTasks) {
      const doneCount = getSubtaskData(habit.id, key, subTasks.length).filter(Boolean).length;
      completed += doneCount;
      remaining += subTasks.length - doneCount;
    } else if (getHabitStatus(habit.id, key)) {
      completed++;
    } else {
      remaining++;
    }
  });

  if (habitWeeklyChart) habitWeeklyChart.destroy();

  const ctx = canvas.getContext("2d");
  habitWeeklyChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completed", "Remaining"],
      datasets: [{
        data: [completed, remaining],
        backgroundColor: ["#00B894", "#c9c9d6"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

// GitHub-style heatmap for a single habit over the last ~180 days
function drawHabitHeatmap(habit) {
  const container = document.getElementById("habitHeatmap");
  if (!container) return;

  const subTasks = getEffectiveSubTasks(habit);
  const today = new Date();
  const days = [];
  for (let i = 179; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }

  container.innerHTML = "";
  days.forEach(d => {
    const key = dateKey(d);
    const cell = document.createElement("div");
    cell.className = "heatCell";

    let done = false;
    if (subTasks) {
      const arr = getSubtaskData(habit.id, key, subTasks.length);
      const doneCount = arr.filter(Boolean).length;
      cell.title = `${key}: ${doneCount}/${subTasks.length}`;
      if (doneCount > 0) {
        const intensity = doneCount / subTasks.length;
        cell.style.background = `linear-gradient(135deg, rgba(108,92,231,${0.3 + intensity * 0.7}), rgba(0,184,148,${0.3 + intensity * 0.7}))`;
      }
    } else {
      done = getHabitStatus(habit.id, key);
      cell.title = `${key}: ${done ? "done" : "not done"}`;
      if (done) cell.style.background = "linear-gradient(135deg,#6C5CE7,#00B894)";
    }

    container.appendChild(cell);
  });
}
