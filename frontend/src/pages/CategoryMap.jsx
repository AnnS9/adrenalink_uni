import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaFortAwesome, FaTree, FaLandmark } from 'react-icons/fa';
import '../styles/CategoryPage.css'; 

const categoryIcons = {
  castles: <FaFortAwesome size={20} color="#555" />,
  parks: <FaTree size={20} color="#2E7D32" />,
  museums: <FaLandmark size={20} color="#C2185B" />,
  default: null
};

const customMarkerIcon = L.icon({
  iconUrl: '/images/icon-map.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38]
});

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function CategoryMap({ places: placesProp, isFullScreen, onClose }) {
  const places = placesProp || [];

  if (!places || places.length === 0) return <div>No locations found to display on the map.</div>;

  return (
    <div className={`map-container ${isFullScreen ? 'fullscreen' : 'inline'}`}>
    
      <MapContainer center={[54.5, -3]} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />
        {places.map((place) => {
          const popupIcon = categoryIcons[place.category?.id] || categoryIcons.default;
          return (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={customMarkerIcon}
            >
             <Popup>
                <div className="popup-header">
                  {popupIcon}
                  <strong className="popup-title">{place.name}</strong>
                </div>
                <p className="popup-description">{place.description || place.location}</p>
                <div className="popup-links">
                  <Link to={`/places/${place.id}`} className="popup-link">
                    View Place Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}