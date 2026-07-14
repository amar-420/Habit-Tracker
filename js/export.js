// ==========================================
// export.js
// Backup (JSON), Restore (JSON), Export (CSV)
// ==========================================

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportBackup() {
  const data = exportAllData();
  downloadFile(
    `habit-tracker-backup-${dateKey(new Date())}.json`,
    JSON.stringify(data, null, 2),
    "application/json"
  );
}

function restoreBackup(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      importAllData(data);
      alert("Backup restored successfully!");
      location.reload();
    } catch (err) {
      alert("Invalid backup file.");
    }
  };
  reader.readAsText(file);
}

function exportCsv() {
  const completions = getCompletions();
  let rows = [["Habit", "Date", "Completed"]];

  habits.forEach(habit => {
    const dates = completions[habit.id] || {};
    Object.keys(dates).forEach(date => {
      if (dates[date]) rows.push([habit.name, date, "Yes"]);
    });
  });

  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  downloadFile(`habit-tracker-export-${dateKey(new Date())}.csv`, csv, "text/csv");
}