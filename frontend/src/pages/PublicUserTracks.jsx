import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import "../styles/Tracks.css";
import { apiGet } from "../lib/api";

export default function PublicUserTracks() {
  const { userId } = useParams();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");

    // Handle missing param early
    if (!userId) {
      setError("Missing user id");
      setLoading(false);
      return;
    }

    // Build once with a leading slash. api.js will normalize it.
    apiGet(`/api/users/${userId}/favorites`)
      .then((data) => {
        if (!alive) return;
        // Support either an array or a wrapper like { favorites: [...] }
        const list = Array.isArray(data) ? data : data?.favorites || [];
        setTracks(list);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e.message || "Failed to fetch tracks");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [userId]);

  if (loading) return <div className="loading">Loading tracks...</div>;
  if (error)   return <p className="error-text">Error: {error}</p>;
  if (!tracks.length) return <p className="no-tracks">No tracks available.</p>;

  const safeImg = (src) =>
    src && typeof src === "string" ? src : "/images/placeholder.jpg";

  const fmt = (n) =>
    typeof n === "number" ? n.toFixed(1) : n || "N/A";

  return (
    <div className="tracks-container">
      <h2 className="tracks-title">Tracks by this user</h2>
      <div className="tracks-grid">
        {tracks.map((track) => {
          const key = track.id || track._id || `${track.name}-${track.location}`;
          const placeId = track.id || track.place_id || track._id;
          return (
            <Link key={key} to={`/place/${placeId}`} className="track-card">
              <img
                src={safeImg(track.image)}
                alt={track.name ? `Place: ${track.name}` : "Place image"}
                className="track-image"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = "/images/placeholder.jpg"; }}
              />
              <div className="track-info">
                <div className="track-name">{track.name || "Unnamed place"}</div>
                <div className="track-location">{track.location || "Unknown location"}</div>
                <div className="track-rating">
                  <FaStar aria-hidden="true" /> {fmt(track.rating)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
