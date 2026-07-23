// ==========================================
// habits.js
// Habit CRUD + rendering the weekly matrix
// ==========================================

let habits = getHabits();

const PRAYER_NAMES = ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha"];
const PRAYER_KEYWORDS = ["namaz", "salah", "salat", "prayer"];

// Detects if a habit name refers to daily prayers, so it gets 5 sub-ticks
function detectSubTasks(name) {
  const lower = name.toLowerCase();
  if (PRAYER_KEYWORDS.some(k => lower.includes(k))) return PRAYER_NAMES;
  return null;
}

// Works for habits created before this feature existed too (matched by name)
function getEffectiveSubTasks(habit) {
  if (habit.subTasks && habit.subTasks.length) return habit.subTasks;
  return detectSubTasks(habit.name);
}

// A custom icon always wins; otherwise fall back to a sensible default by type
function getEffectiveIcon(habit) {
  if (habit.icon) return habit.icon;
  return getEffectiveSubTasks(habit) ? "🕌" : "✅";
}

function addHabit(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const habit = {
    id: "h_" + Date.now(),
    name: trimmed,
    createdAt: new Date().toISOString(),
    subTasks: detectSubTasks(trimmed)
  };
  habits.push(habit);
  saveHabits(habits);
  renderHabits();
}

function removeHabit(habitId) {
  habits = habits.filter(h => h.id !== habitId);
  deleteHabitData(habitId);
  renderHabits();
}

function buildTable(headEl, bodyEl) {
  const week = getWeekDates();

  // Header row
  let headHtml = "<tr><th>Habit</th>";
  week.forEach(date => {
    let cls = "";
    if (isToday(date)) cls = "today";
    else if (isFutureDate(date)) cls = "future";
    const label = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = date.getDate();
    headHtml += `<th class="${cls}">${label}<br>${dayNum}</th>`;
  });
  headHtml += "<th></th></tr>";
  headEl.innerHTML = headHtml;

  // Body rows
  let bodyHtml = "";
  habits.forEach(habit => {
    const subTasks = getEffectiveSubTasks(habit);
    bodyHtml += `<tr data-habit="${habit.id}"><td class="habitName">${getEffectiveIcon(habit)} ${escapeHtml(habit.name)}</td>`;
    week.forEach(date => {
      const key = dateKey(date);
      const future = isFutureDate(date);
      const todayCls = isToday(date) ? "today-col" : "";

      if (subTasks) {
        const arr = getSubtaskData(habit.id, key, subTasks.length);
        const doneCount = arr.filter(Boolean).length;
        let ticks = "";
        subTasks.forEach((label, i) => {
          const tickClasses = ["subtick", arr[i] ? "done" : "", future ? "future" : ""].join(" ").trim();
          ticks += `<span class="${tickClasses}" title="${label}" data-habit="${habit.id}" data-date="${key}" data-sub="${i}" data-subcount="${subTasks.length}" data-future="${future}"></span>`;
        });
        bodyHtml += `<td class="subtickCell ${todayCls}" title="${doneCount}/${subTasks.length} prayers"><div class="subtickWrapInner">${ticks}</div></td>`;
      } else {
        const done = getHabitStatus(habit.id, key);
        const classes = [
          "checkCell",
          future ? "future" : "",
          done ? "done" : "",
          todayCls
        ].join(" ").trim();
        const icon = done ? "✅" : "⬜";
        bodyHtml += `<td class="${classes}" data-habit="${habit.id}" data-date="${key}" data-future="${future}">${icon}</td>`;
      }
    });
    bodyHtml += `<td><button class="editHabitBtn" data-habit="${habit.id}">✏️</button><button class="deleteHabitBtn" data-habit="${habit.id}">🗑️</button></td></tr>`;
  });

  if (habits.length === 0) {
    bodyHtml = `<tr><td colspan="9" style="text-align:center;color:var(--text-soft);padding:20px;">No habits yet. Add your first habit above ✨</td></tr>`;
  }

  bodyEl.innerHTML = bodyHtml;

  // Bind checkbox clicks
  bodyEl.querySelectorAll(".checkCell").forEach(cell => {
    cell.addEventListener("click", () => {
      if (cell.dataset.future === "true") return; // can't check future days
      toggleHabitStatus(cell.dataset.habit, cell.dataset.date);
      renderHabits();
      checkMilestone(cell.dataset.habit);
      checkDayComplete(cell.dataset.date);
    });
  });

  // Bind sub-tick clicks (e.g. individual prayers)
  bodyEl.querySelectorAll(".subtick").forEach(tick => {
    tick.addEventListener("click", () => {
      if (tick.dataset.future === "true") return;
      toggleSubtask(
        tick.dataset.habit,
        tick.dataset.date,
        parseInt(tick.dataset.sub, 10),
        parseInt(tick.dataset.subcount, 10)
      );
      renderHabits();
      checkMilestone(tick.dataset.habit);
      checkDayComplete(tick.dataset.date);
    });
  });

  // Bind edit buttons
  bodyEl.querySelectorAll(".editHabitBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditHabitModal(btn.dataset.habit);
    });
  });

  // Bind delete buttons
  bodyEl.querySelectorAll(".deleteHabitBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeHabit(btn.dataset.habit);
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderHabits() {
  habits = getHabits();

  const headEl = document.getElementById("habitHead");
  const bodyEl = document.getElementById("habitBody");
  buildTable(headEl, bodyEl);

  document.getElementById("currentWeekLabel").innerText = getWeekLabel();
  document.getElementById("nextWeek").disabled = weekOffset >= 0;

  updateAnalytics();

  // Keep the analytics detail view live if it's currently open
  const detailView = document.getElementById("analyticsDetailView");
  if (detailView && !detailView.classList.contains("hidden") && selectedAnalyticsHabitId) {
    renderAnalyticsDetail(selectedAnalyticsHabitId);
  }
}
