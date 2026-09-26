/* =====================================================================
   ALERTS.JS
   Runs only on alerts.html.
   Handles: sample alert data, rendering alert cards, filtering by
   disaster type, and searching by location or disaster type.
   ===================================================================== */

// --- SAMPLE ALERT DATA ---
// In a real system this would come from a server/API. For this student
// project we use a hardcoded array so the page looks functional immediately.
var sampleAlerts = [
  {
    id: 1,
    type: "flood",
    title: "Flood Alert",
    severity: "high",
    location: "Bengaluru",
    datetime: "13 Sep 2026, 8:00 AM",
    description: "Heavy rainfall may cause flooding in low-lying areas.",
    instructions: "Avoid low-lying roads, move valuables to higher ground, and follow official updates."
  },
  {
    id: 2,
    type: "weather",
    title: "Heat Wave Alert",
    severity: "medium",
    location: "Karnataka",
    datetime: "12 Sep 2026, 6:00 AM",
    description: "Avoid prolonged exposure to direct sunlight and drink sufficient water.",
    instructions: "Stay indoors during peak afternoon hours and stay hydrated."
  },
  {
    id: 3,
    type: "fire",
    title: "Fire Safety Alert",
    severity: "high",
    location: "Community Area",
    datetime: "11 Sep 2026, 4:30 PM",
    description: "Avoid the affected area and contact emergency services if required.",
    instructions: "Keep away from the affected block and do not attempt to re-enter for belongings."
  },
  {
    id: 4,
    type: "earthquake",
    title: "Minor Earthquake Advisory",
    severity: "low",
    location: "Bengaluru Rural",
    datetime: "10 Sep 2026, 11:15 PM",
    description: "A minor tremor was recorded in the region. No major damage reported.",
    instructions: "Check your home for cracks and keep your emergency kit accessible."
  },
  {
    id: 5,
    type: "other",
    title: "Water Supply Disruption",
    severity: "low",
    location: "Whitefield",
    datetime: "9 Sep 2026, 9:00 AM",
    description: "Scheduled maintenance may disrupt water supply for several hours.",
    instructions: "Store sufficient drinking water in advance."
  }
];

// Keep track of the current filter and search text so we can combine them.
var currentFilter = "all";
var currentSearch = "";

document.addEventListener("DOMContentLoaded", function () {
  renderAlerts();

  // --- FILTER BUTTONS ---
  var filterButtons = document.querySelectorAll("#alertFilters button");
  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentFilter = button.getAttribute("data-filter");

      // Visually mark the active filter button
      filterButtons.forEach(function (b) { b.classList.remove("btn-primary"); b.classList.add("btn-outline"); });
      button.classList.remove("btn-outline");
      button.classList.add("btn-primary");

      renderAlerts();
    });
  });

  // --- SEARCH BOX ---
  var searchInput = document.getElementById("alertSearch");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      currentSearch = searchInput.value.trim().toLowerCase();
      renderAlerts();
    });
  }
});

// Builds the HTML for one alert card.
function buildAlertCardHTML(alert) {
  return (
    '<div class="card alert-card" data-severity="' + alert.severity + '">' +
      '<div class="alert-card-header">' +
        '<h3>' + alert.title + '</h3>' +
        '<span class="badge badge-' + alert.severity + '">' + alert.severity.toUpperCase() + '</span>' +
      '</div>' +
      '<p class="alert-meta"><i class="fa-solid fa-location-dot"></i> ' + alert.location +
      ' &nbsp;|&nbsp; <i class="fa-regular fa-clock"></i> ' + alert.datetime + '</p>' +
      '<p>' + alert.description + '</p>' +
      '<p style="margin-top:8px;"><strong>Safety Instructions:</strong> ' + alert.instructions + '</p>' +
    '</div>'
  );
}

// Filters the sample data by the current filter + search text, then renders it.
function renderAlerts() {
  var container = document.getElementById("alertsContainer");
  var noResultsMessage = document.getElementById("noAlertsMessage");
  if (!container) return;

  var filtered = sampleAlerts.filter(function (alert) {
    var matchesFilter = (currentFilter === "all") || (alert.type === currentFilter);
    var matchesSearch =
      currentSearch === "" ||
      alert.location.toLowerCase().indexOf(currentSearch) !== -1 ||
      alert.type.toLowerCase().indexOf(currentSearch) !== -1 ||
      alert.title.toLowerCase().indexOf(currentSearch) !== -1;
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = "";
    if (noResultsMessage) noResultsMessage.style.display = "block";
    return;
  }

  if (noResultsMessage) noResultsMessage.style.display = "none";
  container.innerHTML = filtered.map(buildAlertCardHTML).join("");
}
