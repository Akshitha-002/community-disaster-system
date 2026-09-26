/* =====================================================================
   RESOURCES.JS
   Runs only on resources.html.
   Handles: the Leaflet/OpenStreetMap map, sample resource data,
   category filtering, rendering resource cards, and using the
   browser's geolocation to find and sort resources by real distance
   from the user's current location.

   NOTE: Coordinates below are approximate demo locations around
   Bengaluru, used only to show the map working. Replace with real,
   verified location data before using this for anything beyond a
   student project demo.
   ===================================================================== */

var sampleResources = [
  {
    id: 1,
    name: "City General Hospital (Demo)",
    category: "hospital",
    address: "Fort Road, Bengaluru",
    phone: "080-2222-1111",
    distance: "1.2 km",
    lat: 12.9634,
    lng: 77.5730
  },
  {
    id: 2,
    name: "Cubbon Park Police Station (Demo)",
    category: "police",
    address: "Cubbon Park Area, Bengaluru",
    phone: "080-2222-2222",
    distance: "2.0 km",
    lat: 12.9772,
    lng: 77.5946
  },
  {
    id: 3,
    name: "Central Fire Station (Demo)",
    category: "fire",
    address: "MG Road Area, Bengaluru",
    phone: "080-2222-3333",
    distance: "1.8 km",
    lat: 12.9698,
    lng: 77.5828
  },
  {
    id: 4,
    name: "Community Emergency Shelter (Demo)",
    category: "shelter",
    address: "Indiranagar, Bengaluru",
    phone: "080-2222-4444",
    distance: "3.5 km",
    lat: 12.9784,
    lng: 77.6408
  },
  {
    id: 5,
    name: "District Relief Center (Demo)",
    category: "relief",
    address: "Koramangala, Bengaluru",
    phone: "080-2222-5555",
    distance: "4.1 km",
    lat: 12.9352,
    lng: 77.6245
  },
  {
    id: 6,
    name: "St. Mary's Hospital (Demo)",
    category: "hospital",
    address: "Jayanagar, Bengaluru",
    phone: "080-2222-6666",
    distance: "5.0 km",
    lat: 12.9308,
    lng: 77.5838
  }
];

var currentCategory = "all";
var resourceMap = null;
var mapMarkers = [];

// Set once the user taps "Use My Location" and grants permission.
// null means we don't know their location yet, so we fall back to
// the static demo "distance" field on each sample resource.
var userLocation = null;
var userMarker = null;

document.addEventListener("DOMContentLoaded", function () {
  initMap();
  renderResources();

  var filterButtons = document.querySelectorAll("#resourceFilters button");
  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentCategory = button.getAttribute("data-category");

      filterButtons.forEach(function (b) { b.classList.remove("btn-primary"); b.classList.add("btn-outline"); });
      button.classList.remove("btn-outline");
      button.classList.add("btn-primary");

      renderResources();
    });
  });

  var useLocationBtn = document.getElementById("useLocationBtn");
  if (useLocationBtn) {
    useLocationBtn.addEventListener("click", handleUseLocation);
  }
});

// Sets up the Leaflet map, centered on Bengaluru, using free OpenStreetMap tiles.
function initMap() {
  var mapElement = document.getElementById("resourceMap");
  if (!mapElement || typeof L === "undefined") return; // Leaflet didn't load - skip safely

  resourceMap = L.map("resourceMap").setView([12.9716, 77.5946], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19
  }).addTo(resourceMap);
}

// --- GEOLOCATION ---
// Asks the browser for the user's current position, then re-centers
// the map, drops a "You are here" marker, and re-renders the resource
// list sorted by real distance.
function handleUseLocation() {
  var statusEl = document.getElementById("locationStatus");

  if (!navigator.geolocation) {
    showLocationStatus("Your browser doesn't support location access. Showing demo distances instead.");
    return;
  }

  showLocationStatus("Finding your location...");

  navigator.geolocation.getCurrentPosition(
    function (position) {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      showLocationStatus("Showing resources sorted by distance from your current location.");

      if (resourceMap) {
        resourceMap.setView([userLocation.lat, userLocation.lng], 13);

        if (userMarker) {
          resourceMap.removeLayer(userMarker);
        }
        // A distinct blue-ish circle marker so "you" are easy to tell
        // apart from the pin-shaped resource markers.
        userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
          radius: 9,
          color: "#ffffff",
          weight: 3,
          fillColor: "#1b3a5c",
          fillOpacity: 1
        }).addTo(resourceMap);
        userMarker.bindPopup("You are here").openPopup();
      }

      renderResources();
    },
    function (error) {
      var message = "Unable to access your location. Showing demo distances instead.";
      if (error.code === error.PERMISSION_DENIED) {
        message = "Location access was denied. Enable it in your browser settings to see real distances, or continue with demo distances.";
      }
      showLocationStatus(message);
    }
  );
}

function showLocationStatus(message) {
  var statusEl = document.getElementById("locationStatus");
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.style.display = "block";
}

// Calculates the great-circle distance between two lat/lng points in
// kilometers (the "Haversine formula" - standard for short distances like this).
function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  function toRadians(degrees) { return (degrees * Math.PI) / 180; }

  var earthRadiusKm = 6371;
  var dLat = toRadians(lat2 - lat1);
  var dLng = toRadians(lng2 - lng1);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

// Removes all current resource markers from the map (used before re-drawing filtered ones).
function clearMarkers() {
  mapMarkers.forEach(function (marker) {
    resourceMap.removeLayer(marker);
  });
  mapMarkers = [];
}

// Filters the sample data by the current category, and - if we know the
// user's location - calculates real distance and sorts nearest-first.
function getFilteredResources() {
  var filtered = sampleResources.filter(function (resource) {
    return currentCategory === "all" || resource.category === currentCategory;
  });

  if (userLocation) {
    filtered.forEach(function (resource) {
      resource.distanceKm = haversineDistanceKm(userLocation.lat, userLocation.lng, resource.lat, resource.lng);
    });
    filtered.sort(function (a, b) { return a.distanceKm - b.distanceKm; });
  }

  return filtered;
}

// Renders both the map markers AND the resource cards for the current filter.
function renderResources() {
  var filtered = getFilteredResources();

  // --- Map markers ---
  if (resourceMap) {
    clearMarkers();
    filtered.forEach(function (resource) {
      var marker = L.marker([resource.lat, resource.lng]).addTo(resourceMap);
      marker.bindPopup("<strong>" + resource.name + "</strong><br>" + resource.address);
      mapMarkers.push(marker);
    });
  }

  // --- Resource cards ---
  var container = document.getElementById("resourcesContainer");
  if (!container) return;

  container.innerHTML = filtered.map(function (resource) {
    // If we know the user's location, link directions FROM them TO the
    // resource; otherwise just link to the resource's location.
    var directionsUrl = userLocation
      ? "https://www.openstreetmap.org/directions?from=" + userLocation.lat + "," + userLocation.lng + "&to=" + resource.lat + "," + resource.lng
      : "https://www.openstreetmap.org/directions?to=" + resource.lat + "," + resource.lng;

    var distanceLabel = userLocation
      ? resource.distanceKm.toFixed(1) + " km from you"
      : resource.distance + " (demo)";

    return (
      '<div class="card resource-card">' +
        '<span class="resource-category-tag">' + capitalize(resource.category) + '</span>' +
        '<h3>' + resource.name + '</h3>' +
        '<p style="margin:0;">' + resource.address + '</p>' +
        '<p style="margin:0; color:var(--color-muted); font-size:0.9rem;">' +
          '<i class="fa-solid fa-route"></i> ' + distanceLabel +
        '</p>' +
        '<a href="tel:' + resource.phone.replace(/[^0-9]/g, "") + '" class="btn btn-call btn-block">Call ' + resource.phone + '</a>' +
        '<a href="' + directionsUrl + '" target="_blank" rel="noopener" class="btn btn-outline btn-block">Get Directions</a>' +
      '</div>'
    );
  }).join("");
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
