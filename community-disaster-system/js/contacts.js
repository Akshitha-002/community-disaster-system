/* =====================================================================
   CONTACTS.JS
   Runs only on contacts.html.
   Handles: adding community emergency contacts and saving/loading
   them from LocalStorage.
   ===================================================================== */

var CONTACTS_STORAGE_KEY = "communityContacts";

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("communityContactForm");
  if (form) {
    form.addEventListener("submit", handleAddContact);
  }
  renderCommunityContacts();
});

function getStoredContacts() {
  var raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveStoredContacts(contacts) {
  localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
}

function handleAddContact(event) {
  event.preventDefault();

  var name = document.getElementById("contactName").value.trim();
  var role = document.getElementById("contactRole").value.trim();
  var phone = document.getElementById("contactPhone").value.trim();

  var phoneIsValid = /\d{7,}/.test(phone.replace(/\D/g, ""));
  var phoneError = document.getElementById("contactPhoneError");
  if (phoneError) phoneError.classList.toggle("visible", !phoneIsValid);

  if (name === "" || role === "" || !phoneIsValid) {
    return; // Don't save an incomplete or invalid contact.
  }

  var contacts = getStoredContacts();
  contacts.push({
    id: Date.now(), // a simple unique id based on the current timestamp
    name: name,
    role: role,
    phone: phone
  });
  saveStoredContacts(contacts);

  document.getElementById("communityContactForm").reset();
  renderCommunityContacts();
}

// Removes one contact by id (called from the "Remove" button on each card).
function removeCommunityContact(id) {
  var contacts = getStoredContacts().filter(function (contact) {
    return contact.id !== id;
  });
  saveStoredContacts(contacts);
  renderCommunityContacts();
}

function renderCommunityContacts() {
  var container = document.getElementById("communityContactsList");
  var noContactsMessage = document.getElementById("noCommunityContacts");
  if (!container) return;

  var contacts = getStoredContacts();

  if (contacts.length === 0) {
    container.innerHTML = "";
    if (noContactsMessage) noContactsMessage.style.display = "block";
    return;
  }

  if (noContactsMessage) noContactsMessage.style.display = "none";

  container.innerHTML = contacts.map(function (contact) {
    return (
      '<div class="card" style="margin-bottom:12px;">' +
        '<div class="flex-between">' +
          '<div>' +
            '<h3 style="margin-bottom:2px;">' + contact.name + '</h3>' +
            '<p style="margin:0; color:var(--color-muted);">' + contact.role + '</p>' +
          '</div>' +
          '<button type="button" class="modal-close" onclick="removeCommunityContact(' + contact.id + ')">Remove</button>' +
        '</div>' +
        '<a href="tel:' + contact.phone + '" class="btn btn-call btn-block" style="margin-top:12px;">Call ' + contact.name + '</a>' +
      '</div>'
    );
  }).join("");
}
