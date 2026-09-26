/* =====================================================================
   MAIN.JS
   Shared behavior that runs on EVERY page:
   1. Mobile hamburger menu toggle
   2. SOS confirmation modal (open/close)
   ===================================================================== */

// Wait until the page's HTML is fully loaded before running any code.
// This avoids errors from trying to grab elements that don't exist yet.
document.addEventListener("DOMContentLoaded", function () {

  /* -------------------------------------------------------------
     1. MOBILE HAMBURGER MENU
     On small screens, the nav links are hidden by CSS (see style.css
     section 16). Clicking the hamburger button toggles an "open"
     class that CSS uses to show/hide the menu.
  ------------------------------------------------------------- */
  var navbarToggle = document.getElementById("navbarToggle");
  var navbarLinks = document.getElementById("navbarLinks");

  if (navbarToggle && navbarLinks) {
    navbarToggle.addEventListener("click", function () {
      navbarLinks.classList.toggle("open");
    });

    // Close the mobile menu automatically when a link is tapped,
    // so the menu doesn't stay open after navigating.
    var navLinkItems = navbarLinks.querySelectorAll("a");
    navLinkItems.forEach(function (link) {
      link.addEventListener("click", function () {
        navbarLinks.classList.remove("open");
      });
    });
  }


  /* -------------------------------------------------------------
     2. SOS CONFIRMATION MODAL
     Every page has the same modal markup (id="sosModal").
     Clicking the SOS button in the navbar shows it;
     clicking "Close" or clicking outside the box hides it.
  ------------------------------------------------------------- */
  var sosBtn = document.getElementById("sosBtn");
  var sosModal = document.getElementById("sosModal");
  var sosModalClose = document.getElementById("sosModalClose");

  function openSosModal() {
    if (sosModal) {
      sosModal.classList.add("visible");
    }
  }

  function closeSosModal() {
    if (sosModal) {
      sosModal.classList.remove("visible");
    }
  }

  if (sosBtn) {
    sosBtn.addEventListener("click", openSosModal);
  }

  if (sosModalClose) {
    sosModalClose.addEventListener("click", closeSosModal);
  }

  // Clicking the dark overlay (but not the white box itself) also closes the modal.
  if (sosModal) {
    sosModal.addEventListener("click", function (event) {
      if (event.target === sosModal) {
        closeSosModal();
      }
    });
  }

  // Pressing the Escape key closes the modal too, for accessibility.
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeSosModal();
    }
  });


  /* -------------------------------------------------------------
     3. ACCORDION (Disaster Preparedness page)
     Only preparedness.html has elements with the "accordion-item"
     class, so this code simply does nothing on every other page.
     Clicking a header toggles the "open" class, which CSS uses to
     animate the content open/closed (see style.css section 10).
     We also set max-height inline in JS because CSS can't animate
     to "auto" height on its own.
  ------------------------------------------------------------- */
  var accordionItems = document.querySelectorAll(".accordion-item");

  accordionItems.forEach(function (item) {
    var header = item.querySelector(".accordion-header");
    var content = item.querySelector(".accordion-content");

    if (!header || !content) return;

    header.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");

      if (isOpen) {
        item.classList.remove("open");
        content.style.maxHeight = null;
      } else {
        item.classList.add("open");
        // scrollHeight gives us the content's real height so CSS can animate to it.
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });

  // If the page was opened with a hash like preparedness.html#flood
  // (e.g. from a hazard card on the home page), automatically open
  // that section instead of leaving the visitor to find and click it.
  if (window.location.hash) {
    var targetItem = document.querySelector(window.location.hash);
    if (targetItem && targetItem.classList.contains("accordion-item")) {
      var targetContent = targetItem.querySelector(".accordion-content");
      if (targetContent) {
        targetItem.classList.add("open");
        targetContent.style.maxHeight = targetContent.scrollHeight + "px";
        targetItem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

});
