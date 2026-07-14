// ==========================================
// analytics.js
// - updateAnalytics(): feeds the Dashboard cards (overall stats)
// - renderAnalyticsList() / renderAnalyticsDetail(): the Analytics tab,
//   which shows a list of habits first, then per-habit stats on tap
// ==========================================

function updateAnalytics() {
  const week = getWeekDates();

  let totalCompleted = 0;
  let totalBoxes = 0;

  habits.forEach(habit => {
    const subTasks = getEffectiveSubTasks(habit);
    week.forEach(date => {
      if (isFutureDate(date)) return; // don't count boxes that can't be done yet
      const key = dateKey(date);
      if (subTasks) {
        totalBoxes += subTasks.length;
        totalCompleted += getSubtaskData(habit.id, key, subTasks.length).filter(Boolean).length;
      } else {
        totalBoxes++;
        if (getHabitStatus(habit.id, key)) totalCompleted++;
      }
    });
  });

  document.getElementById("totalHabits").innerText = habits.length;

  const percent = totalBoxes > 0 ? Math.round((totalCompleted / totalBoxes) * 100) : 0;
  document.getElementById("completion").innerText = percent + "%";
  document.getElementById("currentStreak").innerText = calcCurrentStreak();
  document.getElementById("longestStreak").innerText = calcLongestStreak();
}

// ---------- Analytics tab: habit list ----------

let selectedAnalyticsHabitId = null;

function renderAnalyticsList() {
  const container = document.getElementById("habitAnalyticsList");
  if (!container) return;

  document.getElementById("analyticsListView").classList.remove("hidden");
  document.getElementById("analyticsDetailView").classList.add("hidden");
  selectedAnalyticsHabitId = null;

  if (habits.length === 0) {
    container.innerHTML = `<p style="color:var(--text-soft);">No habits yet. Add one from the Dashboard first.</p>`;
    return;
  }

  container.innerHTML = habits.map(habit => {
    const subTasks = getEffectiveSubTasks(habit);
    const icon = subTasks ? "🕌" : "✅";
    const streak = calcHabitCurrentStreak(habit);
    return `
      <div class="habitAnalyticsCard" data-habit="${habit.id}">
        <div class="habitCardIcon">${icon}</div>
        <div class="habitCardName">${escapeHtml(habit.name)}</div>
        <div class="habitCardStreak">🔥 ${streak}-day streak</div>
      </div>`;
  }).join("");

  container.querySelectorAll(".habitAnalyticsCard").forEach(card => {
    card.addEventListener("click", () => renderAnalyticsDetail(card.dataset.habit));
  });
}

// ---------- Analytics tab: single habit detail ----------

function renderAnalyticsDetail(habitId) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) {
    renderAnalyticsList();
    return;
  }
  selectedAnalyticsHabitId = habitId;

  document.getElementById("analyticsListView").classList.add("hidden");
  document.getElementById("analyticsDetailView").classList.remove("hidden");
  document.getElementById("analyticsHabitName").innerText = habit.name;

  const subTasks = getEffectiveSubTasks(habit);
  const week = getWeekDates();

  let totalBoxes = 0;
  let totalCompleted = 0;
  week.forEach(date => {
    if (isFutureDate(date)) return;
    const key = dateKey(date);
    if (subTasks) {
      totalBoxes += subTasks.length;
      totalCompleted += getSubtaskData(habit.id, key, subTasks.length).filter(Boolean).length;
    } else {
      totalBoxes++;
      if (getHabitStatus(habit.id, key)) totalCompleted++;
    }
  });

  const percent = totalBoxes > 0 ? Math.round((totalCompleted / totalBoxes) * 100) : 0;
  document.getElementById("habitCompletion").innerText = percent + "%";
  document.getElementById("habitProgressBar").style.width = percent + "%";
  document.getElementById("habitProgressText").innerText = percent + "% Completed";
  document.getElementById("habitCurrentStreak").innerText = calcHabitCurrentStreak(habit);
  document.getElementById("habitLongestStreak").innerText = calcHabitLongestStreak(habit);

  drawHabitChart(habit, week);
  drawHabitHeatmap(habit);
}