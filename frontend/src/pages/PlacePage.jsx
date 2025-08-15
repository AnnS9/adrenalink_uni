import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaStar, FaArrowsAlt } from 'react-icons/fa';
import '../styles/PlacePage.css';

export default function PlacePage({ isLoggedIn, userRole, currentUser }) {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    fetch(`/api/place/${id}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setPlace(data))
      .catch((err) => console.error('Failed to fetch place:', err));
  }, [id]);

  const handleSubmitReview = async () => {
    if (!isLoggedIn) {
      alert('You must be logged in to leave a review.');
      return;
    }

    const newReview = { text: reviewText, rating };

    try {
      const res = await fetch(`/api/place/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newReview),
      });
      const savedReview = await res.json();

      const enrichedReview = {
        ...savedReview,
        author: savedReview.author || currentUser?.username || 'Anonymous',
        created_at: savedReview.created_at || new Date().toISOString(),
      };

      setPlace((prev) => ({
        ...prev,
        reviews: [enrichedReview, ...(prev.reviews || [])],
      }));

      setRating(0);
      setReviewText('');
    } catch (err) {
      console.error('Review submission failed:', err);
    }
  };

  const renderStars = (value) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        color={i < value ? '#ed0000' : '#ccc'}
        size={16}
        style={{ marginRight: 2 }}
      />
    ));
  };

  const handleAddToTrack = async () => {
    if (!isLoggedIn) {
      alert('You must be logged in to add to track.');
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

      alert('Place added to your track!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteReview = (reviewId) => {
    if (!window.confirm('Delete this review?')) return;

    fetch(`/api/review/${reviewId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) {
          setPlace((prev) => ({
            ...prev,
            reviews: prev.reviews.filter((r) => r.id !== reviewId),
          }));
        } else {
          alert('Failed to delete review');
        }
      })
      .catch((err) => console.error('Delete failed:', err));
  };

  if (!place) return <div>Loading...</div>;

  return (
    <div className="place-page">
      <header className="header">
        <button className="back-button" onClick={() => window.history.back()}>
          &larr; Back
        </button>
      </header>

      <div className="image-container">
        <img src={place.image} alt={place.name} className="place-image" />

        

      <div className="place-details">
        
        <div className="map-button-container">
          <button
            className="map-toggle-icon"
            onClick={() => setShowMap(!showMap)}
            title={showMap ? 'Hide Map' : 'View Map'}
          >
            <FaArrowsAlt />
          </button>
          <div className="map-toggle-label">
            {showMap ? 'Hide Map' : 'View Map'}
          </div>
        </div>
        <h2 className="placename">{place.name}</h2>
        <p>{renderStars(place.rating)}</p>
        <p className="address">{place.location}</p>
        <p className="description">{place.description}</p>

        {isLoggedIn && (
          <button className="add-to-track-btn" onClick={handleAddToTrack}>
            Add to your track
          </button>
        )}

        {showMap && (
          <div className="map-container">
            <iframe
              title="Google Map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                place.location
              )}&output=embed`}
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>
</div>
      <section className="reviews-section">
        <h3>Reviews</h3>

        {isLoggedIn ? (
          <div className="review-form">
            <div className="rating-input">
              Rate this location: 
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    color: star <= rating ? '#ed0000' : '#ccc',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              placeholder="Write a review..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <button className="submit-review" onClick={handleSubmitReview}>
              Submit
            </button>
          </div>
        ) : (
          <p className="login-warning">
            You must be logged in to leave a review.
          </p>
        )}

        <div className="reviews-list">
          {place.reviews.map((review) => (
            <div key={review.id} className="review">
              <strong>{review.author ?? 'Anonymous'}</strong>
              <div className="review-stars">{renderStars(review.rating)}</div>
              <p>{review.text}</p>
              <small>{new Date(review.created_at).toLocaleDateString()}</small>

              {userRole === 'admin' && (
                <button
                  className="delete-review"
                  onClick={() => handleDeleteReview(review.id)}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
