/* =====================================================================
   ADMIN.JS
   Runs only on admin.html.
   Handles: viewing emergency reports, changing report status,
   deleting demo reports, and showing summary stats.

   NOTE: This is a frontend-only "Admin Demo Panel" with no real login.
   In a production version, this page would sit behind real
   authentication and a proper backend.
   ===================================================================== */

// Same LocalStorage key that report.js uses, so both pages share the same data.
var REPORTS_STORAGE_KEY = "emergencyReports";

// Demo count for "Available Resources" - matches the sample data in resources.js.
// (Kept as a simple constant here since admin.html doesn't load resources.js.)
var DEMO_RESOURCE_COUNT = 6;

document.addEventListener("DOMContentLoaded", function () {
  renderAdminDashboard();
});

function getStoredReports() {
  var raw = localStorage.getItem(REPORTS_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveStoredReports(reports) {
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

// Renders everything on the admin page: stat cards, reports-by-type
// summary, and the main reports table.
function renderAdminDashboard() {
  var reports = getStoredReports();

  // --- Stat cards ---
  document.getElementById("statTotalReports").textContent = reports.length;
  document.getElementById("statResources").textContent = DEMO_RESOURCE_COUNT;
  // statActiveAlerts is left as the static "3" from alerts.js's sample data.

  // --- Reports by type ---
  var typeCounts = {};
  reports.forEach(function (report) {
    typeCounts[report.type] = (typeCounts[report.type] || 0) + 1;
  });

  var typeContainer = document.getElementById("reportsByTypeContainer");
  var typeKeys = Object.keys(typeCounts);
  if (typeKeys.length === 0) {
    typeContainer.innerHTML = '<p>No reports yet to summarize.</p>';
  } else {
    typeContainer.innerHTML = typeKeys.map(function (type) {
      return (
        '<div class="card">' +
          '<h3>' + type + '</h3>' +
          '<p style="font-size:1.5rem; font-weight:700; color:var(--color-ink);">' + typeCounts[type] + '</p>' +
        '</div>'
      );
    }).join("");
  }

  // --- Reports table ---
  var tableBody = document.getElementById("adminReportsTableBody");
  var noReportsMessage = document.getElementById("noAdminReports");

  if (reports.length === 0) {
    tableBody.innerHTML = "";
    if (noReportsMessage) noReportsMessage.style.display = "block";
    return;
  }

  if (noReportsMessage) noReportsMessage.style.display = "none";

  tableBody.innerHTML = reports.map(function (report) {
    return (
      '<tr>' +
        '<td>' + report.id + '</td>' +
        '<td>' + report.type + '</td>' +
        '<td>' + report.location + '</td>' +
        '<td><span class="badge badge-' + report.severity.toLowerCase() + '">' + report.severity + '</span></td>' +
        '<td>' + report.affected + '</td>' +
        '<td>' +
          '<select onchange="updateReportStatus(\'' + report.id + '\', this.value)">' +
            '<option value="New"' + (report.status === "New" ? " selected" : "") + '>New</option>' +
            '<option value="Under Review"' + (report.status === "Under Review" ? " selected" : "") + '>Under Review</option>' +
            '<option value="Resolved"' + (report.status === "Resolved" ? " selected" : "") + '>Resolved</option>' +
          '</select>' +
        '</td>' +
        '<td><button type="button" class="btn btn-outline" onclick="deleteReport(\'' + report.id + '\')">Delete</button></td>' +
      '</tr>'
    );
  }).join("");
}

// Called from the status dropdown's onchange in the table above.
function updateReportStatus(reportId, newStatus) {
  var reports = getStoredReports();
  reports.forEach(function (report) {
    if (report.id === reportId) {
      report.status = newStatus;
    }
  });
  saveStoredReports(reports);
  renderAdminDashboard();
}

// Called from the "Delete" button in the table above.
function deleteReport(reportId) {
  var reports = getStoredReports().filter(function (report) {
    return report.id !== reportId;
  });
  saveStoredReports(reports);
  renderAdminDashboard();
}
