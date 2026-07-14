// ==========================================
// streak.js
// Calculates current & longest streaks
// A "streak day" = at least one habit completed that day
// (if there are habits at all)
// ==========================================

function getAllCompletedDateKeys() {
  const completions = getCompletions();
  const set = new Set();
  Object.values(completions).forEach(dates => {
    Object.keys(dates).forEach(k => {
      if (dates[k]) set.add(k);
    });
  });
  return set;
}

function calcCurrentStreak() {
  const completedDays = getAllCompletedDateKeys();
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // If today isn't done yet, start counting from yesterday
  if (!completedDays.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (completedDays.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function calcLongestStreak() {
  const completedDays = Array.from(getAllCompletedDateKeys()).sort();
  if (completedDays.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < completedDays.length; i++) {
    const prev = new Date(completedDays[i - 1]);
    const curr = new Date(completedDays[i]);
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      current++;
    } else if (diffDays > 1) {
      current = 1;
    }
    longest = Math.max(longest, current);
  }
  return longest;
}

// ---------- Per-habit streaks (used by Analytics detail view) ----------
// A day counts for THIS habit only when it's fully complete
// (single checkbox ticked, or all sub-tasks like all 5 prayers done).

function calcHabitCurrentStreak(habit) {
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!isHabitDayComplete(habit, dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (isHabitDayComplete(habit, dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function calcHabitLongestStreak(habit) {
  const start = new Date(habit.createdAt);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let longest = 0;
  let current = 0;
  const cursor = new Date(start);

  while (cursor <= today) {
    if (isHabitDayComplete(habit, dateKey(cursor))) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return longest;
}