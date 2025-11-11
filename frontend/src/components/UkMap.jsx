import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const customIcon = L.icon({
  iconUrl: '/images/icon-map.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});


const gmapsViewUrl = (lat, lng) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

const gmapsDirectionsUrl = (lat, lng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

export default function UkMap() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    fetch('/api/places')
      .then((res) => res.json())
      .then((data) => setPlaces(data))
      .catch((err) => console.error('Error fetching places:', err));
  }, []);

  return (
    <MapContainer center={[54.5, -3]} zoom={6} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      />

      {places.map((place) => {
        const { id, name, description, latitude, longitude } = place;
        const lat = Number(latitude);
        const lng = Number(longitude);

        return (
          <Marker key={id} position={[lat, lng]} icon={customIcon}>
            <Popup>
              <strong>{name}</strong><br />
              {description}<br />

              <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
                <Link to={`/place/${id}`}>View Place Details</Link>

                <a
                  href={gmapsViewUrl(lat, lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps
                </a>

                <a
                  href={gmapsDirectionsUrl(lat, lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Directions in Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

