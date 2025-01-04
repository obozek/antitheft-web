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

const appUrl = getBaseUrl(); //'https://antitheft-446109.ew.r.appspot.com';

// Top-level async function
document.addEventListener("DOMContentLoaded", async () => {
    const {Map, InfoWindow} = await google.maps.importLibrary("maps");
    const {AdvancedMarkerElement, PinElement} = await google.maps.importLibrary("marker");
    const {LatLngBounds} = await google.maps.importLibrary("core")

    let map; // Global map instance
    let markers = []; // Array to store markers
    let timeline; // Global Vis.js timeline instance
    let datapoints = []; // Store fetched datapoints

// Initialize the map
    function initializeMap(center = {lat: 37.7749, lng: -122.4194}, zoom = 8) {
        map = new Map(document.getElementById("map"), {
            center,
            zoom,
            mapId: "e373da0239cfdb32",
        });
    }

// Clear existing markers
    function clearMarkers() {
        markers.forEach(marker => marker.map = null);
        markers = [];
    }

// Add markers to the map using AdvancedMarkerElement
    function updateMap(filteredPoints) {
        clearMarkers();

        if (filteredPoints.length === 0) return;

        map.setCenter({
            lat: filteredPoints[0].latitude,
            lng: filteredPoints[0].longitude,
        });


        // Create a LatLngBounds object to track the bounds of all markers
        const bounds = new LatLngBounds();

        filteredPoints.forEach(dp => {

            const pinElement = new PinElement({
                background: '#ff5722', // Marker background color
                borderColor: '#ffffff', // Marker border color
                // glyph: new Date(dp.when * 1000).toLocaleTimeString(), // Text inside the marker
                glyphColor: 'rgba(255,255,255,0)', // Glyph color
                scale: 1.2, // Size of the pin
            });

            // Add hover label
            const label = document.createElement("div");
            label.className = "pin-label";
            label.innerHTML = `
            <div>
                <strong>Lat:</strong> ${dp.latitude.toFixed(2)}<br>
                <strong>Lng:</strong> ${dp.longitude.toFixed(2)}
            </div>
        `;
            label.style.display = "none"; // Hidden by default

            // Combine PinElement and hover label
            const markerContent = document.createElement("div");
            markerContent.className = "pin-container";
            markerContent.appendChild(pinElement.element);
            markerContent.appendChild(label);

            // Add hover events
            markerContent.addEventListener("mouseenter", () => {
                label.style.display = "block";
            });
            markerContent.addEventListener("mouseleave", () => {
                label.style.display = "none";
            });

            const pos = {lat: dp.latitude, lng: dp.longitude}

            const advancedMarker = new AdvancedMarkerElement({
                position: pos,
                map: map,
                content: markerContent,
                gmpClickable: true,
            });

            // Extend the bounds to include this marker's position
            bounds.extend(pos);

            // Add an InfoWindow for marker details
            const infoWindow = new InfoWindow({
                content: `
                <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5;">
                    <strong>Date:</strong> ${new Date(dp.when * 1000).toLocaleDateString()}<br>
                    <strong>Time:</strong> ${new Date(dp.when * 1000).toLocaleTimeString()}
                </div>
            `,
            });

            advancedMarker.addListener("click", ({ domEvent, latLng }) => {
                const { target } = domEvent;

                infoWindow.close();
                infoWindow.open(advancedMarker.map, advancedMarker);
            });

            markers.push(advancedMarker);
        });

        // Fit the map's viewport to the bounds, if valid
        if (!bounds.isEmpty()) {
            map.setCenter(bounds.center); // Add padding for better visibility
        } else {
            console.warn("Bounds are empty. No markers to fit.");
        }
    }

    function initializeTimeline(datapoints) {
        const container = document.getElementById("timeline");

        // Set interval size (e.g., 1 day in milliseconds)
        const intervalSize = 24 * 60 * 60 * 1000; // 1 day

        // Aggregate datapoints into density intervals
        const intervals = {};
        datapoints.forEach((dp) => {
            const timestamp = dp.when * 1000; // Convert UNIX to milliseconds
            const intervalStart = Math.floor(timestamp / intervalSize) * intervalSize; // Start of the interval
            intervals[intervalStart] = (intervals[intervalStart] || 0) + 1; // Increment density
        });

        // Convert intervals to Vis.js items
        const items = Object.entries(intervals).map(([start, count]) => ({
            id: start,
            content: "", // No content to avoid clutter
            start: new Date(parseInt(start)).toISOString(),
            end: new Date(parseInt(start) + intervalSize).toISOString(),
            style: `background-color: rgba(255, 0, 0, ${Math.min(count / 10, 1)});`, // Density-based color
        }));

        console.log("Timeline intervals with density:", items); // Debug: Check intervals

        // Initialize Vis.js Timeline
        timeline = new vis.Timeline(container, items, {
            selectable: true,
            zoomable: true,
            start: new Date(Math.min(...Object.keys(intervals).map(key => parseInt(key)))), // Timeline start
            end: new Date(Math.max(...Object.keys(intervals).map(key => parseInt(key)))),   // Timeline end
        });

        // Listen for range selection
        timeline.on("rangechange", (event) => {
            const start = new Date(event.start).getTime() / 1000; // UNIX time in seconds
            const end = new Date(event.end).getTime() / 1000;

            const filteredPoints = datapoints.filter(dp => dp.when >= start && dp.when <= end);
            updateMap(filteredPoints);
        });
    }

// Fetch and populate the device dropdown
    async function populateDeviceDropdown() {
        const response = await fetch(`${appUrl}/devices`);
        const devices = await response.json();

        const deviceSelect = document.getElementById("deviceSelect");
        deviceSelect.innerHTML = ''; // Clear existing options

        devices.forEach(device => {
            const option = document.createElement("option");
            option.value = device;
            option.textContent = device;
            deviceSelect.appendChild(option);
        });

        if (devices.length > 0) {
            onDeviceChange(); // Load the first device's data by default
        }
    }

// Fetch data and update the map when a device is selected
    async function onDeviceChange() {
        const deviceId = document.getElementById("deviceSelect").value;

        const response = await fetch(`${appUrl}/coordinates?deviceId=${deviceId}`);
        const datapoints = await response.json();

        updateMap(datapoints);
        initializeTimeline(datapoints);
    }


    // Attach device change handler to dropdown
    document.getElementById("deviceSelect").addEventListener("change", onDeviceChange);


// Initialize the app
    initializeMap();
    await populateDeviceDropdown();
});
