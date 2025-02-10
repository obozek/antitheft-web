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

function updateMapSync() {
    updateMap().then(r => console.log('Map updated'));
}

function setUp() {
    let deviceSelect = document.getElementById('deviceSelect')
    const selectedOption = deviceSelect.options[deviceSelect.selectedIndex];
    const firstRecordTime = selectedOption.getAttribute('data-firstRecordTime');
    const date = new Date(firstRecordTime * 1000); // Convert epoch seconds to milliseconds
    setFirstRecordDate(date);
    setPickerDate(date);
    updateMapSync();
}

function setFirstRecordDate(date) {
    document.getElementById('selectedDate').textContent = date.toLocaleString();
}

document.getElementById('deviceSelect').addEventListener('change', setUp);

document.getElementById('decreaseDate').addEventListener('click', function () {
    const currentDate = getPickerDate()
    currentDate.setDate(currentDate.getDate() - 1);
    setPickerDate(currentDate);
    updateMapSync()
});

document.getElementById('increaseDate').addEventListener('click', function () {
    const currentDate = getPickerDate()
    currentDate.setDate(currentDate.getDate() + 1);
    setPickerDate(currentDate);
    updateMapSync()
});
// Global variable to store the picker instance.
let picker;

document.addEventListener('DOMContentLoaded', function () {
    picker = new tempusDominus.TempusDominus(
        document.getElementById('datepicker'),
        {
            display: {
                components: {
                    calendar: true,
                    date: true,
                    month: true,
                    year: true,
                    decades: true,
                    clock: false
                },
                buttons: {
                    today: true,
                    clear: true,
                    close: true
                }
            }
            // You can add more configuration options here if needed.
        }
    );
    setUp();
});

/**
 * Sets the picker's date to tomorrow.
 * This function can be modified to set the date to any value you need.
 */
function setPickerDate(date) {
    if (picker) {
        // Set the new date into the picker.
        // This updates both the internal state and the input's displayed value.
        picker.dates.setValue(tempusDominus.DateTime.convert(date));
    }
}

function getPickerDate() {
    if (picker) {
        // Set the new date into the picker.
        // This updates both the internal state and the input's displayed value.
        return new Date(picker.dates.lastPicked);
    }
    return null;
}

// async function populateDeviceDropdown() {
//     const response = await fetch(`${appUrl}/devices`);
//     const devices = await response.json();
//
//     const deviceSelect = document.getElementById('deviceSelect');
//     deviceSelect.innerHTML = ''; // Clear existing options
//
//     devices.forEach(device => {
//         const option = document.createElement('option');
//         option.value = device;
//         option.textContent = device;
//         deviceSelect.appendChild(option);
//     });
//
//     // Automatically load the first device's data
//     if (devices.length > 0) {
//         updateMap();
//     }
// }

// populateDeviceDropdown();

async function updateMap() {
    const deviceId = document.getElementById('deviceSelect').value;
    const date = getPickerDate();
    // get the date in the format yyyy-mm-dd
    const startDate = date.toISOString().split('T')[0];


    const response = await fetch(`${appUrl}/coordinates?deviceId=${deviceId}&startDate=${startDate}T00:00:00Z&endDate=${startDate}T23:59:59Z`);
    const coordinates = await response.json();

    await initMap(coordinates);
}




