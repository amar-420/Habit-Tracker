// ==========================================
// celebrate.js
// Fires a confetti burst + toast the moment a habit's
// current streak newly reaches a milestone (7 / 30 / 100 days)
// ==========================================

const MILESTONES = [7, 30, 100];
const MILESTONE_BADGES = { 7: "🥉 7-Day", 30: "🥈 30-Day", 100: "🥇 100-Day" };

function checkMilestone(habitId) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  const streak = calcHabitCurrentStreak(habit);
  MILESTONES.forEach(m => {
    if (streak === m && !hasCelebrated(habitId, m)) {
      markCelebrated(habitId, m);
      fireConfetti();
      showMilestoneToast(habit.name, m);
    }
  });
}

function fireConfetti(options = {}) {
  if (typeof confetti !== "function") return;
  confetti({
    particleCount: options.particleCount || 130,
    spread: options.spread || 85,
    origin: { y: 0.6 },
    colors: ["#8a6a4a", "#c98a4b", "#3a2f26", "#f0d9a0"]
  });
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "milestoneToast";
  toast.innerText = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

function showMilestoneToast(habitName, milestone) {
  showToast(`🎉 ${milestone}-day streak on "${habitName}"!`);
}

// Celebrates when ALL habits are checked off (100%) for a given day
function getDayCompletionPercent(dateKeyStr) {
  let totalBoxes = 0;
  let totalDone = 0;
  habits.forEach(habit => {
    const subTasks = getEffectiveSubTasks(habit);
    if (subTasks) {
      totalBoxes += subTasks.length;
      totalDone += getSubtaskData(habit.id, dateKeyStr, subTasks.length).filter(Boolean).length;
    } else {
      totalBoxes++;
      if (getHabitStatus(habit.id, dateKeyStr)) totalDone++;
    }
  });
  return totalBoxes > 0 ? Math.round((totalDone / totalBoxes) * 100) : 0;
}

function checkDayComplete(dateKeyStr) {
  if (getDayCompletionPercent(dateKeyStr) !== 100) return;

  const celebrationKey = `day-${dateKeyStr}`;
  if (hasCelebrated("__allHabits__", celebrationKey)) return;
  markCelebrated("__allHabits__", celebrationKey);

  const dateObj = new Date(dateKeyStr + "T00:00:00");
  const dateLabel = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  fireConfetti({ particleCount: 170, spread: 100 });
  showToast(`🎉 100% of habits completed on ${dateLabel}!`);
}
