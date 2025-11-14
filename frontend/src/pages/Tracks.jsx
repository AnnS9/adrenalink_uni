import { useEffect, useState, useCallback } from "react";
import { FaStar, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../styles/Tracks.css";
import ConfirmModal from "../components/ConfirmModal";
import { apiGet, apiSend } from "../lib/api";

export default function Tracks() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {

      const data = await apiGet("/api/user/favorites");
      const rows = Array.isArray(data) ? data : data?.favorites || [];
      setTracks(rows);
    } catch (e) {
      setError(e.message || "Failed to fetch favorite tracks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeleteConfirm = async () => {
    if (!trackToDelete) return;
    try {
      const placeId = trackToDelete.id || trackToDelete.place_id || trackToDelete._id;
      if (!placeId) throw new Error("Missing place id");

   
      setTracks((prev) => prev.filter((t) => (t.id || t._id) !== placeId));

      await apiSend("/api/user/favorites", "DELETE", { placeId });

      setTrackToDelete(null);
      setShowConfirm(false);
    } catch (e) {
      
      await load();
      alert(e.message || "Failed to remove track");
    }
  };

  if (loading) return <div className="loading">Loading favorite tracks...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const safeImg = (src) =>
    src && typeof src === "string" ? src : "/images/placeholder.jpg";

  const fmt = (n) => (typeof n === "number" ? n.toFixed(1) : n || "N/A");

  return (
    <div className="tracks-container">
      <h2 className="tracks-title">My Adrenalink Tracks</h2>

      {tracks.length === 0 ? (
        <p className="no-tracks">No favorite tracks yet.</p>
      ) : (
        <div className="tracks-grid">
          {tracks.map((track) => {
            const key = track.id || track._id || `${track.name}-${track.location}`;
            const placeId = track.id || track.place_id || track._id;

            return (
              <div key={key} className="track-card-wrapper">
                <Link to={`/place/${placeId}`} className="track-card">
                  <img
                    src={safeImg(track.image)}
                    alt={track.name ? `Place: ${track.name}` : "Place image"}
                    className="track-image"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/images/placeholder.jpg";
                    }}
                  />
                  <div className="track-info">
                    <div className="track-name">{track.name || "Unnamed place"}</div>
                    <div className="track-location">{track.location || "Unknown location"}</div>
                    <div className="track-rating">
                      <FaStar aria-hidden="true" /> {fmt(track.rating)}
                    </div>
                  </div>
                </Link>

                <button
                  className="delete-track-btn"
                  onClick={() => {
                    setTrackToDelete(track);
                    setShowConfirm(true);
                  }}
                  aria-label={`Remove ${track.name || "this place"} from favorites`}
                >
                  <FaTrash />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showConfirm && (
        <ConfirmModal
          title="Delete Track"
          message={
            trackToDelete?.name
              ? `Are you sure you want to remove "${trackToDelete.name}" from your tracks?`
              : "Are you sure you want to remove this place from your tracks?"
          }
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
