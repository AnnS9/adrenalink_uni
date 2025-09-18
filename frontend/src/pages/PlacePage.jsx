import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaStar, FaArrowsAlt, FaPlus } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import '../styles/PlacePage.css';

const customMarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function PlacePage({ isLoggedIn, userRole, currentUser }) {
  const { id } = useParams();
  
  const [place, setPlace] = useState({ reviews: [], latitude: null, longitude: null });
  const [showMap, setShowMap] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // Fetch place data
  useEffect(() => {
    fetch(`/api/place/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setPlace({ ...data, reviews: data.reviews || [] });
        if (data.is_favorited) setIsFavorited(true);
      })
      .catch(err => console.error('Failed to fetch place:', err));
  }, [id]);

  // Add to track
  const handleAddToTrack = async () => {
    if (!isLoggedIn) {
      toast.info('You must be logged in to add to track.');
      return;
    }
    try {
      const response = await fetch(`/api/user/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ placeId: id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to track');
      }
      setIsFavorited(true);
      toast.success('Place added to your track!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!isLoggedIn) {
      toast.info('You must be logged in to leave a review.');
      return;
    }
    if (!reviewText.trim()) {
      toast.error('Please enter a review.');
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5.');
      return;
    }

    try {
      const res = await fetch(`/api/place/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: reviewText.trim(), rating }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit review.');
      }

      const savedReview = await res.json();
      savedReview.rating = Number(savedReview.rating);
      savedReview.author = savedReview.author || currentUser?.username || 'Anonymous';
      savedReview.created_at = savedReview.created_at || new Date().toISOString();

      setPlace(prev => {
        const updatedReviews = [savedReview, ...(prev.reviews || [])];
        const avgRating = updatedReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / updatedReviews.length;
        return { ...prev, reviews: updatedReviews, rating: avgRating };
      });

      setRating(0);
      setReviewText('');
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
  };

  // Delete review
  const handleDeleteReview = (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    fetch(`/api/review/${reviewId}`, { method: 'DELETE', credentials: 'include' })
      .then(res => {
        if (res.ok) {
          setPlace(prev => {
            const updatedReviews = prev.reviews.filter(r => r.id !== reviewId);
            const avgRating = updatedReviews.length > 0
              ? updatedReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / updatedReviews.length
              : 0;
            return { ...prev, reviews: updatedReviews, rating: avgRating };
          });
          toast.success('Review deleted.');
        } else {
          toast.error('Failed to delete review.');
        }
      })
      .catch(err => {
        console.error('Delete failed:', err);
        toast.error('Failed to delete review.');
      });
  };

  // Render stars
  const renderStars = (value) =>
    [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        color={i < value ? '#ed0000' : '#ccc'}
        size={16}
        style={{ marginRight: 2 }}
      />
    ));

  if (!place) return <div>Loading...</div>;

  return (
    <div className="place-page">
      <header className="header">
        <button className="back-button" onClick={() => window.history.back()}>Back</button>
      </header>

      <div className="image-container">
        <img src={place.image} alt={place.name} className="place-image" />
        <div className="place-details">
          <div className="map-button-container-horizontal">
            <div className="map-button-item">
              <button className="map-toggle-icon" onClick={() => setShowMap(!showMap)} title={showMap ? 'Hide Map' : 'View Map'}>
                <FaArrowsAlt />
              </button>
              <div className="map-toggle-label">{showMap ? 'Hide Map' : 'View Map'}</div>
            </div>
            {isLoggedIn && (
              <div className="track-button-item">
                <button className="track-icon" onClick={handleAddToTrack} title={isFavorited ? 'Already in Track' : 'Add to Tracks'} disabled={isFavorited}>
                  <FaPlus color={isFavorited ? 'yellow' : 'white'} />
                </button>
                <div className="track-label">{isFavorited ? 'In Track' : 'Add Track'}</div>
              </div>
            )}
          </div>

          <h2 className="placename">{place.name}</h2>
          <div className="rating-display">
            {renderStars(Math.round(place.rating || 0))}
            <span style={{ marginLeft: 6, color: '#666' }}>({place.rating?.toFixed(1) || "0.0"})</span>
          </div>
          <p className="address">{place.location}</p>
          <p className="description">{place.description}</p>

          {showMap && place.latitude && place.longitude && (
            <div className="map-container" style={{ height: '300px', width: '100%' }}>
              <MapContainer center={[place.latitude, place.longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                />
                <Marker position={[place.latitude, place.longitude]} icon={customMarkerIcon}>
                  <Popup>
                    <div className="popup-header"><strong>{place.name}</strong></div>
                    <p>{place.description || place.location}</p>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>
      </div>

      <section className="reviews-section">
        <h3>Reviews</h3>

        {isLoggedIn ? (
          <div className="review-form">
            <div className="rating-input">
              Rate this location:{' '}
              {[1,2,3,4,5].map(star => (
                <span key={star} onClick={() => setRating(star)} style={{ color: star <= rating ? '#ed0000' : '#ccc', cursor: 'pointer', fontSize: '1.5rem' }}>★</span>
              ))}
            </div>
            <textarea placeholder="Write a review..." value={reviewText} onChange={e => setReviewText(e.target.value)} />
            <button className="submit-review" onClick={handleSubmitReview}>Submit</button>
          </div>
        ) : <p className="login-warning">You must be logged in to leave a review.</p>}

        <div className="reviews-list">
  {place.reviews?.map(review => (
    <div key={review.id} className="review">
      {review.user_id ? (
        <Link to={`/users/${review.user_id}`} className="review-author-link">
          {review.author ?? 'Anonymous'}
        </Link>
      ) : (
        <strong>{review.author ?? 'Anonymous'}</strong>
      )}
      <div className="review-stars">{renderStars(Number(review.rating) || 0)}</div>
      <p>{review.text}</p>
      <small>{new Date(review.created_at).toLocaleDateString()}</small>
      {userRole === 'admin' && (
        <button className="delete-review" onClick={() => handleDeleteReview(review.id)}>Delete</button>
      )}
    </div>
  ))}
</div>
      </section>
    </div>
  );
}
