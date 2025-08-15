import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
  popupAnchor: [0, -35] 
});
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
      {places.map((place) => (
       <Marker
    key={place.id}
    position={[place.latitude, place.longitude]}
    icon={customIcon} 
  >
    <Popup>
      <strong>{place.name}</strong><br />
      {place.description}
    </Popup>
  </Marker>
      ))}
    </MapContainer>
  );
}