import { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import '../styles/Tracks.css';

export default function PublicUserTracks() {
  const { userId } = useParams();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await fetch(`/api/users/${userId}/favorites`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch tracks');
        const data = await response.json();
        setTracks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, [userId]);

  if (loading) return <div className="loading">Loading tracks...</div>;
  if (!tracks.length) return <p className="no-tracks">No tracks available.</p>;

  return (
    <div className="tracks-container">
      <h2 className="tracks-title">Tracks by this user</h2>
      <div className="tracks-grid">
        {tracks.map(track => (
          <Link key={track.id} to={`/place/${track.id}`} className="track-card">
            <img src={track.image} alt={track.name} className="track-image" />
            <div className="track-info">
              <div className="track-name">{track.name}</div>
              <div className="track-location">{track.location}</div>
              <div className="track-rating"><FaStar /> {track.rating}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}