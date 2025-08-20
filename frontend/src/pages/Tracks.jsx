import { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa'; 
import { Link } from 'react-router-dom';
import '../styles/Tracks.css'; 

function Tracks() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await fetch('/api/user/favorites', { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch favorite tracks');
        const data = await response.json();
        setTracks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, []);

  if (loading) return <div className="loading">Loading favorite tracks...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="tracks-container">
      <h2 className="tracks-title">My Adrenalink Tracks</h2>
      {tracks.length === 0 ? (
                <p className="no-tracks">No favorite tracks yet.</p>
            ) : (
                <div className="tracks-grid">
                {tracks.map(track => (
        <Link 
            to={`/place/${track.id}`} 
            key={track.id} 
            className="track-card"
            >
            <img 
            src={track.image} 
            alt={track.name} 
            className="track-image" 
            />
            <div className="track-info">
            <div className="track-name">{track.name}</div>
            <div className="track-location">{track.location}</div>
            <div className="track-rating">
                <FaStar /> {track.rating}
            </div>
            </div>
        </Link>
        ))}
         
        </div>
      )}
    </div>
  );
}

export default Tracks;