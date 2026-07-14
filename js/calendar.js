// ==========================================
// calendar.js
// Weekly (Mon-Sun) date logic
// ==========================================

let weekOffset = 0; // 0 = current week, -1 = last week, +1 = next week (locked)

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Returns the Monday of the current real week
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun, 1 = Mon ...
  const diff = day === 0 ? -6 : 1 - day; // shift so Monday is start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Returns array of 7 Date objects (Mon-Sun) for the given weekOffset
function getWeekDates() {
  const today = new Date();
  const monday = getStartOfWeek(today);
  monday.setDate(monday.getDate() + weekOffset * 7);
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(d);
  }
  return week;
}

function isToday(date) {
  const today = new Date();
  return dateKey(date) === dateKey(today);
}

function isFutureDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime() > today.getTime();
}

function goPrevWeek() {
  weekOffset -= 1;
  renderHabits();
}

function goNextWeek() {
  // Prevent navigating into future weeks beyond the current one
  if (weekOffset >= 0) return;
  weekOffset += 1;
  renderHabits();
}

function getWeekLabel() {
  const week = getWeekDates();
  const opts = { day: "numeric", month: "short" };
  const start = week[0].toLocaleDateString("en-US", opts);
  const end = week[6].toLocaleDateString("en-US", opts);
  return weekOffset === 0 ? `This Week (${start} - ${end})` : `${start} - ${end}`;
}

function getTodayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// ==========================================
// Month calendar view (separate from the weekly dashboard nav)
// ==========================================

let calMonthOffset = 0; // 0 = current month, negative = past months

function getCalendarMonthDate() {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + calMonthOffset);
  return d;
}

function getCalendarMonthLabel() {
  return getCalendarMonthDate().toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function goPrevCalMonth() {
  calMonthOffset -= 1;
  renderCalendarView();
}

function goNextCalMonth() {
  if (calMonthOffset >= 0) return; // can't browse into future months
  calMonthOffset += 1;
  renderCalendarView();
}

function dayCompletionForDate(date) {
  const key = dateKey(date);
  let totalBoxes = 0;
  let totalDone = 0;
  habits.forEach(habit => {
    const subTasks = getEffectiveSubTasks(habit);
    if (subTasks) {
      totalBoxes += subTasks.length;
      totalDone += getSubtaskData(habit.id, key, subTasks.length).filter(Boolean).length;
    } else {
      totalBoxes++;
      if (getHabitStatus(habit.id, key)) totalDone++;
    }
  });
  const percent = totalBoxes > 0 ? Math.round((totalDone / totalBoxes) * 100) : 0;
  return { totalBoxes, totalDone, percent };
}

function renderCalendarView() {
  const grid = document.getElementById("calendarGrid");
  if (!grid) return;

  const monthDate = getCalendarMonthDate();
  document.getElementById("calMonthLabel").innerText = getCalendarMonthLabel();
  document.getElementById("nextCalMonth").disabled = calMonthOffset >= 0;

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const startDay = firstOfMonth.getDay(); // 0 = Sun
  const leadingBlanks = startDay === 0 ? 6 : startDay - 1; // Monday-start grid

  let html = "";
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach(l => {
    html += `<div class="calWeekday">${l}</div>`;
  });

  for (let i = 0; i < leadingBlanks; i++) html += `<div class="calDay empty"></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const key = dateKey(date);
    const future = isFutureDate(date);
    const today = isToday(date);

    let barClass = "none";
    let percentLabel = "";
    if (!future && habits.length > 0) {
      const { totalBoxes, percent } = dayCompletionForDate(date);
      if (totalBoxes > 0) {
        barClass = percent === 100 ? "full" : percent > 0 ? "partial" : "none";
        percentLabel = `<span class="calDayPct">${percent}%</span>`;
      }
    }

    html += `<div class="calDay ${future ? "future" : ""} ${today ? "today" : ""}" data-date="${key}">
      <span class="calDayNum">${d}</span>
      <div class="calDayBar ${barClass}"></div>
      ${percentLabel}
    </div>`;
  }

  grid.innerHTML = html;

  grid.querySelectorAll(".calDay:not(.empty):not(.future)").forEach(cell => {
    cell.addEventListener("click", () => showDayDetail(cell.dataset.date));
  });
}

function showDayDetail(key) {
  const panel = document.getElementById("dayDetailPanel");
  if (!panel) return;
  panel.classList.remove("hidden");

  const dateObj = new Date(key + "T00:00:00");
  document.getElementById("dayDetailTitle").innerText = dateObj.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });

  const listEl = document.getElementById("dayDetailList");

  if (habits.length === 0) {
    listEl.innerHTML = `<p style="color:var(--text-soft);">No habits yet. Add one from the Dashboard.</p>`;
    return;
  }

  listEl.innerHTML = habits.map(habit => {
    const subTasks = getEffectiveSubTasks(habit);
    if (subTasks) {
      const arr = getSubtaskData(habit.id, key, subTasks.length);
      const ticks = subTasks.map((label, i) =>
        `<span class="subtick ${arr[i] ? "done" : ""}" title="${label}" data-habit="${habit.id}" data-date="${key}" data-sub="${i}" data-subcount="${subTasks.length}"></span>`
      ).join("");
      return `<div class="dayDetailRow"><span class="dayDetailName">${escapeHtml(habit.name)}</span><div class="subtickWrapInner">${ticks}</div></div>`;
    }
    const done = getHabitStatus(habit.id, key);
    return `<div class="dayDetailRow"><span class="dayDetailName">${escapeHtml(habit.name)}</span>
      <span class="checkCell dayCheck ${done ? "done" : ""}" data-habit="${habit.id}" data-date="${key}">${done ? "✅" : "⬜"}</span></div>`;
  }).join("");

  listEl.querySelectorAll(".subtick").forEach(tick => {
    tick.addEventListener("click", () => {
      toggleSubtask(tick.dataset.habit, tick.dataset.date, parseInt(tick.dataset.sub, 10), parseInt(tick.dataset.subcount, 10));
      renderCalendarView();
      showDayDetail(key);
      renderHabits();
    });
  });

  listEl.querySelectorAll(".dayCheck").forEach(cell => {
    cell.addEventListener("click", () => {
      toggleHabitStatus(cell.dataset.habit, cell.dataset.date);
      renderCalendarView();
      showDayDetail(key);
      renderHabits();
    });
  });
}