import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const customIcon = L.icon({
  iconUrl: "/images/icon-map.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const gmapsViewUrl = (lat, lng) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

const gmapsDirectionsUrl = (lat, lng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

export default function CategoryMap({ places = [] }) {
  const centerFallback = [54.5, -3]; // UK-ish center

  const validPoints = places
    .map(p => ({
      ...p,
      lat: Number(p.latitude),
      lng: Number(p.longitude),
    }))
    .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));

  const setBounds = map => {
    if (!validPoints.length) return;
    const bounds = L.latLngBounds(validPoints.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  };

  return (
    <MapContainer
      center={centerFallback}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
      whenCreated={setBounds}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      />

      {validPoints.map(p => (
        <Marker key={p.id ?? `${p.lat},${p.lng}`} position={[p.lat, p.lng]} icon={customIcon}>
          <Popup>
            <strong>{p.name || "Unnamed Place"}</strong>
            <br />
            {p.description || "Explore this spot and see what the community says."}
            <br />

            <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
              <Link to={`/place/${p.id}`}>View Place Details</Link>

              <a
                href={gmapsViewUrl(p.lat, p.lng)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Google Maps
              </a>

              <a
                href={gmapsDirectionsUrl(p.lat, p.lng)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Directions in Google Maps
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}