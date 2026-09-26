/* =====================================================================
   SAFETY.JS
   Runs only on safety-guides.html.
   Handles: the interactive emergency kit checklist, its progress bar,
   and saving checked/unchecked state to LocalStorage.
   ===================================================================== */

var KIT_STORAGE_KEY = "emergencyKitChecklist";

document.addEventListener("DOMContentLoaded", function () {
  var checkboxes = document.querySelectorAll("#kitChecklist input[type='checkbox']");
  if (checkboxes.length === 0) return;

  var savedState = getStoredKitState();

  // On page load, tick any checkboxes the user had already checked before.
  checkboxes.forEach(function (checkbox) {
    var itemKey = checkbox.getAttribute("data-item");
    checkbox.checked = !!savedState[itemKey];

    // Whenever a checkbox changes, save the new state and refresh the progress bar.
    checkbox.addEventListener("change", function () {
      var state = getStoredKitState();
      state[itemKey] = checkbox.checked;
      localStorage.setItem(KIT_STORAGE_KEY, JSON.stringify(state));
      updateProgress(checkboxes);
    });
  });

  updateProgress(checkboxes);
});

function getStoredKitState() {
  var raw = localStorage.getItem(KIT_STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

// Counts how many items are checked and updates the label + progress bar width.
function updateProgress(checkboxes) {
  var total = checkboxes.length;
  var checkedCount = 0;

  checkboxes.forEach(function (checkbox) {
    if (checkbox.checked) checkedCount++;
  });

  var percent = Math.round((checkedCount / total) * 100);

  var label = document.getElementById("kitProgressLabel");
  var fill = document.getElementById("kitProgressFill");

  if (label) label.textContent = "Your Emergency Kit: " + checkedCount + "/" + total + " Items Ready";
  if (fill) fill.style.width = percent + "%";
}
