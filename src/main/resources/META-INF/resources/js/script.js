// Determine the base URL based on the environment
const getBaseUrl = () => {
    const hostname = window.location.hostname;

    if (hostname === 'localhost') {
        return 'http://localhost:8080'; // Local development
    } else if (hostname === 'antitheft-446109.ew.r.appspot.com') {
        return 'https://antitheft-446109.ew.r.appspot.com'; // Staging deployment
    } else {
        return 'https://your-production-url.com'; // Production URL
    }
};
let map;

const appUrl = getBaseUrl(); //'https://antitheft-446109.ew.r.appspot.com';

async function initMap(coordinates) {

    const {Map} = await google.maps.importLibrary("maps");
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 8,
        center: {lat: coordinates[0]?.latitude || 0, lng: coordinates[0]?.longitude || 0}
    });

    coordinates.forEach(coord => {
        const marker = new google.maps.Marker({
            position: {lat: coord.latitude, lng: coord.longitude},
            map: map
        });

        // Add an info window to show date and time
        const infoWindow = new google.maps.InfoWindow({
            content: `Date: ${new Date(coord.when * 1000).toLocaleDateString()}<br>
                      Time: ${new Date(coord.when * 1000).toLocaleTimeString()}`
        });

        marker.addListener("click", () => {
            infoWindow.open(map, marker);
        });
    });
}

async function filterCoordinates() {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const deviceId = document.getElementById('deviceSelect').value;

    if (!startDate || !endDate) {
        alert("Please select both start and end dates.");
        return;
    }

    const response = await fetch(`${appUrl}/coordinates?deviceId=${deviceId}&startDate=${startDate}T00:00:00Z&endDate=${endDate}T23:59:59Z`);
    const coordinates = await response.json();

    // Clear the map and reload with filtered points
    initMap(coordinates);
}

async function populateDeviceDropdown() {
    const response = await fetch(`${appUrl}/devices`);
    const devices = await response.json();

    const deviceSelect = document.getElementById('deviceSelect');
    deviceSelect.innerHTML = ''; // Clear existing options

    devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device;
        option.textContent = device;
        deviceSelect.appendChild(option);
    });

    // Automatically load the first device's data
    if (devices.length > 0) {
        updateMap();
    }
}

populateDeviceDropdown();

async function updateMap() {
    const deviceId = document.getElementById('deviceSelect').value;

    const startDate = document.getElementById("startDate")?.value || '1970-01-01';
    const endDate = document.getElementById("endDate")?.value || '2100-01-01';

    const response = await fetch(`${appUrl}/coordinates?deviceId=${deviceId}&startDate=${startDate}T00:00:00Z&endDate=${endDate}T23:59:59Z`);
    const coordinates = await response.json();

    initMap(coordinates);
}



