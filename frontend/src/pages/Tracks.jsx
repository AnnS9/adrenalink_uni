import { useEffect, useState } from 'react';
import { FaStar, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/Tracks.css';
import ConfirmModal from '../components/ConfirmModal';

const BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export default function Tracks() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState(null);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${BASE}/api/user/favorites`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch favorite tracks');
      const data = await response.json();
      setTracks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!trackToDelete) return;
    try {
      const res = await fetch(`${BASE}/api/user/favorites`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ placeId: trackToDelete.id }),
      });
      if (!res.ok) throw new Error('Failed to remove track');
      setTracks(prev => prev.filter(track => track.id !== trackToDelete.id));
      setTrackToDelete(null);
      setShowConfirm(false);
    } catch (err) {
      alert(err.message);
    }
  };

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
            <div key={track.id} className="track-card-wrapper">
              <Link to={`/place/${track.id}`} className="track-card">
                <img src={track.image} alt={track.name} className="track-image" />
                <div className="track-info">
                  <div className="track-name">{track.name}</div>
                  <div className="track-location">{track.location}</div>
                  <div className="track-rating">
                    <FaStar /> {track.rating}
                  </div>
                </div>
              </Link>
              <button
                className="delete-track-btn"
                onClick={() => {
                  setTrackToDelete(track);
                  setShowConfirm(true);
                }}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}

      {showConfirm && (
        <ConfirmModal
          title="Delete Track"
          message={`Are you sure you want to remove "${trackToDelete.name}" from your tracks?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowConfirm(false);
            setTrackToDelete(null);
          }}
        />
      )}
    </div>
  );
}
