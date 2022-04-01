const locations = JSON.parse(document.getElementById("map").dataset.locations);

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiY2hlYXNlcjAwNyIsImEiOiJjbDFkaTQ4N3IwYWVvM2tuM2VpZzhoMGNtIn0.rc9sAcELK-E2OAQr5OoEpA";

  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/cheaser007/cl1di6cg1000914o02hgxog22",
    scrollZoom: false,
    center: [-118.113491, 34.111745],
    zoom: 10,
    interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement("div");
    el.className = "marker";

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
