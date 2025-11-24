import { useEffect, useState } from 'react';
import { FaStar, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/Tracks.css';
import ConfirmModal from '../components/ConfirmModal';

export default function Tracks() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/user/favorites', {
          credentials: 'include',
          signal,
        });

       
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Server error: ${text}`);
        }

        const contentType = response.headers.get('content-type') || '';

        if (!contentType.includes('application/json')) {
          
          const text = await response.text();
          throw new Error(`Expected JSON, got: ${text}`);
        }

        const data = await response.json();

        
        setTracks(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(String(err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();

    return () => {
      controller.abort();
    };
  }, []);

  const handleDeleteConfirm = async () => {
    if (!trackToDelete) return;

    try {
      setError(null);

      const res = await fetch('/api/user/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ placeId: trackToDelete.id }),
      });

      if (!res.ok) {
       
        const ct = res.headers.get('content-type') || '';
        const body = ct.includes('application/json') ? await res.json() : await res.text();
        const message = typeof body === 'string' ? body : JSON.stringify(body);
        throw new Error(`Failed to remove track: ${message}`);
      }

      if (res.status === 204) {
        setTracks(prev => prev.filter(t => t.id !== trackToDelete.id));
      } else {
       
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const payload = await res.json();
        
          if (Array.isArray(payload)) {
            setTracks(payload);
          } else {
            setTracks(prev => prev.filter(t => t.id !== trackToDelete.id));
          }
        } else {
        
          setTracks(prev => prev.filter(t => t.id !== trackToDelete.id));
        }
      }

      setTrackToDelete(null);
      setShowConfirm(false);
    } catch (err) {
      setError(String(err.message));
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
                <img
                  src={track.image || '/images/placeholder.png'}
                  alt={track.name || 'track'}
                  className="track-image"
                  onError={e => {
                    e.currentTarget.src = '/images/placeholder.png';
                  }}
                />
                <div className="track-info">
                  <div className="track-name">{track.name}</div>
                  <div className="track-location">{track.location}</div>
                  <div className="track-rating">
                    <FaStar /> {track.rating ?? 'N/A'}
                  </div>
                </div>
              </Link>

              <button
                className="delete-track-btn"
                onClick={() => {
                  setTrackToDelete(track);
                  setShowConfirm(true);
                }}
                aria-label={`Remove ${track.name} from favorites`}
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
          message={`Are you sure you want to remove "${trackToDelete?.name ?? ''}" from your tracks?`}
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
