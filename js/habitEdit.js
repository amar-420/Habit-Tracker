// ==========================================
// habitEdit.js
// Edit modal: rename a habit, change its icon, or toggle it
// between a normal single-checkbox habit and a 5-prayer habit
// ==========================================

const EMOJI_PRESETS = ["💪","📚","💧","🧘","🕌","📵","🏃","🎯","✍️","🚭","💤","🍎","🎨","🧹","💰","📖"];

let editingHabitId = null;
let selectedEmoji = null;

function openEditHabitModal(habitId) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  editingHabitId = habitId;
  selectedEmoji = habit.icon || null;

  document.getElementById("editHabitName").value = habit.name;
  document.getElementById("editHabitPrayerType").checked = !!(habit.subTasks && habit.subTasks.length);
  document.getElementById("editHabitIconCustom").value = "";

  renderEmojiPicker();
  document.getElementById("editHabitModal").classList.remove("hidden");
}

function closeEditHabitModal() {
  document.getElementById("editHabitModal").classList.add("hidden");
  editingHabitId = null;
}

function renderEmojiPicker() {
  const picker = document.getElementById("emojiPicker");
  picker.innerHTML = EMOJI_PRESETS.map(e =>
    `<button type="button" class="emojiOption ${selectedEmoji === e ? "selected" : ""}" data-emoji="${e}">${e}</button>`
  ).join("");

  picker.querySelectorAll(".emojiOption").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedEmoji = btn.dataset.emoji;
      document.getElementById("editHabitIconCustom").value = "";
      renderEmojiPicker();
    });
  });
}

function saveHabitEdit() {
  if (!editingHabitId) return;

  const name = document.getElementById("editHabitName").value.trim();
  if (!name) return;

  const isPrayer = document.getElementById("editHabitPrayerType").checked;
  const customIcon = document.getElementById("editHabitIconCustom").value.trim();
  const icon = customIcon || selectedEmoji || null;

  editHabit(editingHabitId, {
    name,
    subTasks: isPrayer ? PRAYER_NAMES : null,
    icon
  });

  closeEditHabitModal();
  renderHabits();
}
