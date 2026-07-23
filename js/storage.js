// ==========================================
// storage.js
// Handles all localStorage read/write
// ==========================================

const STORAGE_KEY = "habitTrackerPro.habits";
const COMPLETIONS_KEY = "habitTrackerPro.completions";
const THEME_KEY = "habitTrackerPro.theme";

// habits: [{ id, name, createdAt }]
function getHabits() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

// completions: { habitId: { "YYYY-MM-DD": true } }
function getCompletions() {
  const data = localStorage.getItem(COMPLETIONS_KEY);
  return data ? JSON.parse(data) : {};
}

function saveCompletions(completions) {
  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
}

function getHabitStatus(habitId, dateKey) {
  const completions = getCompletions();
  return !!(completions[habitId] && completions[habitId][dateKey]);
}

function toggleHabitStatus(habitId, dateKey) {
  const completions = getCompletions();
  if (!completions[habitId]) completions[habitId] = {};
  completions[habitId][dateKey] = !completions[habitId][dateKey];
  if (!completions[habitId][dateKey]) delete completions[habitId][dateKey];
  saveCompletions(completions);
}

// For habits with subTasks (e.g. namaz -> 5 prayers), a day's value is
// stored as an array of booleans instead of a single boolean.
function getSubtaskData(habitId, dateKey, subCount) {
  const completions = getCompletions();
  const raw = completions[habitId] && completions[habitId][dateKey];
  if (Array.isArray(raw)) return raw;
  return new Array(subCount).fill(false);
}

function toggleSubtask(habitId, dateKey, subIndex, subCount) {
  const completions = getCompletions();
  if (!completions[habitId]) completions[habitId] = {};
  let arr = completions[habitId][dateKey];
  if (!Array.isArray(arr)) arr = new Array(subCount).fill(false);
  arr[subIndex] = !arr[subIndex];
  if (arr.some(v => v)) {
    completions[habitId][dateKey] = arr;
  } else {
    delete completions[habitId][dateKey];
  }
  saveCompletions(completions);
}

// True only when ALL sub-tasks (or the single checkbox) are done for that day
function isHabitDayComplete(habit, dateKeyStr) {
  if (habit.subTasks && habit.subTasks.length) {
    const arr = getSubtaskData(habit.id, dateKeyStr, habit.subTasks.length);
    return arr.length === habit.subTasks.length && arr.every(v => v);
  }
  return getHabitStatus(habit.id, dateKeyStr);
}

function deleteHabitData(habitId) {
  const habits = getHabits().filter(h => h.id !== habitId);
  saveHabits(habits);
  const completions = getCompletions();
  delete completions[habitId];
  saveCompletions(completions);
}

// Update a habit's name / icon / type without touching its completion history
function editHabit(habitId, updates) {
  const habits = getHabits();
  const idx = habits.findIndex(h => h.id === habitId);
  if (idx === -1) return;
  habits[idx] = { ...habits[idx], ...updates };
  saveHabits(habits);
}

// ---------- Streak milestone celebration tracking ----------
const CELEBRATED_KEY = "habitTrackerPro.celebrated";

function getCelebrated() {
  const data = localStorage.getItem(CELEBRATED_KEY);
  return data ? JSON.parse(data) : {};
}

function hasCelebrated(habitId, milestone) {
  const c = getCelebrated();
  return !!(c[habitId] && c[habitId].includes(milestone));
}

function markCelebrated(habitId, milestone) {
  const c = getCelebrated();
  if (!c[habitId]) c[habitId] = [];
  if (!c[habitId].includes(milestone)) c[habitId].push(milestone);
  localStorage.setItem(CELEBRATED_KEY, JSON.stringify(c));
}

function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(COMPLETIONS_KEY);
}

function exportAllData() {
  return {
    habits: getHabits(),
    completions: getCompletions(),
    exportedAt: new Date().toISOString()
  };
}

function importAllData(data) {
  if (data.habits) saveHabits(data.habits);
  if (data.completions) saveCompletions(data.completions);
}
