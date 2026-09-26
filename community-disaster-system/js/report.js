/* =====================================================================
   REPORT.JS
   Runs only on report.html.
   Handles: form validation, generating a unique Report ID, saving
   reports to LocalStorage, showing a success message, and displaying
   recently submitted reports.
   ===================================================================== */

// The LocalStorage key we use to store the array of reports.
// admin.js uses this SAME key so both pages stay in sync.
var REPORTS_STORAGE_KEY = "emergencyReports";

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("reportForm");
  if (form) {
    form.addEventListener("submit", handleReportSubmit);
  }
  renderRecentReports();
});

// Reads the saved reports array from LocalStorage (or returns an empty array
// the first time the site is used, when nothing has been saved yet).
function getStoredReports() {
  var raw = localStorage.getItem(REPORTS_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

// Saves the given array of reports back to LocalStorage.
function saveStoredReports(reports) {
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

// Generates a simple, readable, unique-enough Report ID like "RPT-8F3K2".
function generateReportId() {
  var randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return "RPT-" + randomPart;
}

// Shows/hides an inline error message for one field.
function setFieldError(errorElementId, show) {
  var el = document.getElementById(errorElementId);
  if (el) el.classList.toggle("visible", show);
}

function handleReportSubmit(event) {
  event.preventDefault(); // stop the form from actually reloading the page

  var name = document.getElementById("reportName").value.trim();
  var phone = document.getElementById("reportPhone").value.trim();
  var type = document.getElementById("reportType").value;
  var location = document.getElementById("reportLocation").value.trim();
  var description = document.getElementById("reportDescription").value.trim();
  var severity = document.getElementById("reportSeverity").value;
  var affected = document.getElementById("reportAffected").value;
  var confirmed = document.getElementById("reportConfirm").checked;

  // --- VALIDATION ---
  // A very simple phone check: at least 7 digits.
  var phoneIsValid = /\d{7,}/.test(phone.replace(/\D/g, ""));

  var isValid = true;
  isValid = validateField(name !== "", "reportNameError") && isValid;
  isValid = validateField(phoneIsValid, "reportPhoneError") && isValid;
  isValid = validateField(type !== "", "reportTypeError") && isValid;
  isValid = validateField(location !== "", "reportLocationError") && isValid;
  isValid = validateField(description !== "", "reportDescriptionError") && isValid;
  isValid = validateField(severity !== "", "reportSeverityError") && isValid;
  isValid = validateField(affected !== "" && Number(affected) >= 0, "reportAffectedError") && isValid;
  isValid = validateField(confirmed, "reportConfirmError") && isValid;

  if (!isValid) {
    return; // Stop here - don't save anything until every field is valid.
  }

  // --- BUILD AND SAVE THE REPORT ---
  var newReport = {
    id: generateReportId(),
    name: name,
    phone: phone,
    type: type,
    location: location,
    description: description,
    severity: severity,
    affected: Number(affected),
    status: "New", // Every new report starts as "New" (used by the admin panel)
    submittedAt: new Date().toLocaleString()
  };

  var reports = getStoredReports();
  reports.unshift(newReport); // add to the beginning, so newest shows first
  saveStoredReports(reports);

  // --- SHOW SUCCESS MESSAGE ---
  document.getElementById("reportIdDisplay").textContent = newReport.id;
  document.getElementById("reportSuccess").style.display = "block";
  document.getElementById("reportSuccess").scrollIntoView({ behavior: "smooth" });

  // Reset the form so it's ready for another report if needed.
  document.getElementById("reportForm").reset();

  renderRecentReports();
}

// Helper used by handleReportSubmit: shows/hides the error span for one
// field and returns whether that field passed validation.
function validateField(condition, errorElementId) {
  setFieldError(errorElementId, !condition);
  return condition;
}

// Displays the 5 most recent reports on the report page itself, so the
// person who just submitted one can see it appear in the community feed.
function renderRecentReports() {
  var container = document.getElementById("recentReportsContainer");
  var noReportsMessage = document.getElementById("noRecentReports");
  if (!container) return;

  var reports = getStoredReports();

  if (reports.length === 0) {
    container.innerHTML = "";
    if (noReportsMessage) noReportsMessage.style.display = "block";
    return;
  }

  if (noReportsMessage) noReportsMessage.style.display = "none";

  var recent = reports.slice(0, 5);
  container.innerHTML = recent.map(function (report) {
    return (
      '<div class="card alert-card" data-severity="' + report.severity.toLowerCase() + '" style="margin-bottom:16px;">' +
        '<div class="alert-card-header">' +
          '<h3>' + report.type + ' — ' + report.location + '</h3>' +
          '<span class="badge badge-' + report.severity.toLowerCase() + '">' + report.severity.toUpperCase() + '</span>' +
        '</div>' +
        '<p class="alert-meta"><i class="fa-regular fa-clock"></i> ' + report.submittedAt +
        ' &nbsp;|&nbsp; Report ID: ' + report.id +
        ' &nbsp;|&nbsp; Status: ' + report.status + '</p>' +
        '<p>' + report.description + '</p>' +
      '</div>'
    );
  }).join("");
}
