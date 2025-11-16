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

export default function CategoryMap({ places = [] }) {
  const [map, setMap] = useState(null);

  const validPlaces = (places || []).filter(
    p => Number.isFinite(p?.latitude) && Number.isFinite(p?.longitude)
  );

  useEffect(() => {
    if (!map || validPlaces.length === 0) return;
    const bounds = L.latLngBounds(validPlaces.map(p => [p.latitude, p.longitude]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, validPlaces]);

  return (
    <div className="map-container" style={{ height: '360px', width: '100%' }}>
      <MapContainer
        center={[54.5, -3]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMap}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />
        {validPlaces.map(place => (
          <Marker key={place.id} position={[place.latitude, place.longitude]} icon={customIcon}>
            <Popup>
              <strong>{place.name}</strong><br />
              
              <Link to={`/place/${place.id}`} className="popup-link">View Place Details</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
