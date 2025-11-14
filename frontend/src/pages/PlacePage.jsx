import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaStar, FaArrowsAlt, FaPlus } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "leaflet/dist/leaflet.css";
import "../styles/PlacePage.css";
import { apiGet, apiSend } from "../lib/api";
import { FaLocationArrow } from "react-icons/fa";

const customMarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// same pattern as your map page
const gmapsViewUrl = (lat, lng) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

const gmapsDirectionsUrl = (lat, lng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

export default function PlacePage({ isLoggedIn, userRole, currentUser }) {
  const { id } = useParams();

  const [place, setPlace] = useState({
    reviews: [],
    latitude: null,
    longitude: null,
  });
  const [showMap, setShowMap] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const [categoryId, setCategoryId] = useState(null);
  const [categoryName, setCategoryName] = useState(null);

  useEffect(() => {
    let alive = true;
    apiGet(`/api/place/${id}`)
      .then((data) => {
        if (!alive) return;
        setPlace({ ...data, reviews: data.reviews || [] });
        if (data.is_favorited) setIsFavorited(true);
        if (data.category_id) setCategoryId(data.category_id);
        if (data.category_name) setCategoryName(data.category_name);
      })
      .catch((err) => console.error("Failed to fetch place:", err));
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    fetch(`/api/place/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setPlace({ ...data, reviews: data.reviews || [] });
        if (data.is_favorited) setIsFavorited(true);

        if (data.category_id) setCategoryId(data.category_id);
        if (data.category_name) setCategoryName(data.category_name);
      })
      .catch((err) => console.error("Failed to fetch place:", err));
  }, [id]);

  useEffect(() => {
    if (categoryId && !categoryName) {
      apiGet(`/api/category/${categoryId}`)
        .then((cat) => {
          if (cat?.name) setCategoryName(cat.name);
        })
        .catch(() => {});
    }
  }, [categoryId, categoryName]);

  const handleAddToTrack = async () => {
    if (!isLoggedIn) {
      toast.info("You must be logged in to add to track.");
      return;
    }
    try {
      await apiSend("/api/user/favorites", "POST", { placeId: id });
      setIsFavorited(true);
      toast.success("Place added to your track!");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleSubmitReview = async () => {
    if (!isLoggedIn) {
      toast.info("You must be logged in to leave a review.");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please enter a review.");
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5.");
      return;
    }
    try {
      const savedReview = await apiSend(`/api/place/${id}/review`, "POST", {
        text: reviewText.trim(),
        rating,
      });
      savedReview.rating = Number(savedReview.rating);
      savedReview.author =
        savedReview.author ||
        currentUser?.full_name ||
        currentUser?.username ||
        "Anonymous";
      savedReview.created_at =
        savedReview.created_at || new Date().toISOString();

      setPlace((prev) => {
        const updatedReviews = [savedReview, ...(prev.reviews || [])];
        const avgRating =
          updatedReviews.reduce(
            (sum, r) => sum + (Number(r.rating) || 0),
            0
          ) / updatedReviews.length;
        return { ...prev, reviews: updatedReviews, rating: avgRating };
      });

      setRating(0);
      setReviewText("");
      toast.success("Review submitted!");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await apiSend(`/api/review/${reviewId}`, "DELETE");
      setPlace((prev) => {
        const updatedReviews = prev.reviews.filter((r) => r.id !== reviewId);
        const avgRating =
          updatedReviews.length > 0
            ? updatedReviews.reduce(
                (sum, r) => sum + (Number(r.rating) || 0),
                0
              ) / updatedReviews.length
            : 0;
        return { ...prev, reviews: updatedReviews, rating: avgRating };
      });
      toast.success("Review deleted.");
    } catch {
      toast.error("Failed to delete review.");
    }
  };

  const renderStars = (value) =>
    [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        color={i < value ? "#ed0000" : "#ccc"}
        size={16}
        style={{ marginRight: 2 }}
      />
    ));

  if (!place) return <div>Loading...</div>;

  return (
    <div className="place-page">
      <header className="header">
        <button className="back-button" onClick={() => window.history.back()}>
          Back
        </button>
      </header>

      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/">Home</Link>
          </li>
          {categoryId && (
            <li>
              <Link to={`/category/${categoryId}`}>
                {categoryName || "Category"}
              </Link>
            </li>
          )}
          <li aria-current="page">{place.name || "Place"}</li>
        </ol>
      </nav>

      <div className="image-container">
        <img src={place.image} alt={place.name} className="place-image" />
        <div className="place-details">
          <div className="map-button-container-horizontal">
            <div className="map-button-item">
              <button
                className="map-toggle-icon"
                onClick={() => setShowMap(!showMap)}
                title={showMap ? "Hide Map" : "View Map"}
              >
                <FaArrowsAlt />
              </button>
              <div className="map-toggle-label">
                {showMap ? "Hide Map" : "View Map"}
              </div>
            </div>

            {/* Google maps buttons */}
            {place.latitude && place.longitude && (
              <>
                <div className="map-button-item">
                  <button
                    className="map-toggle-icon"
                    onClick={() =>
                      window.open(
                        gmapsViewUrl(place.latitude, place.longitude),
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    title="View in Google Maps"
                  >
                     <img
                      src="/images/map-icon.png"
                      alt="Google Maps"
                      style={{ width: 22, height: 22 }}
                    />
                  </button>
                  <div className="map-toggle-label">Google Maps</div>
                </div>

                <div className="map-button-item">
                  <button
                    className="map-toggle-icon"
                    onClick={() =>
                      window.open(
                        gmapsDirectionsUrl(place.latitude, place.longitude),
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    title="Get directions"
                  >
                     <FaLocationArrow size={20} color="white" />
                  </button>
                  <div className="map-toggle-label">Directions</div>
                </div>
              </>
            )}

            {isLoggedIn && (
              <div className="track-button-item">
                <button
                  className="track-icon"
                  onClick={handleAddToTrack}
                  title={isFavorited ? "Already in Track" : "Add to Tracks"}
                  disabled={isFavorited}
                >
                  <FaPlus color={isFavorited ? "yellow" : "white"} />
                </button>
                <div className="track-label">
                  {isFavorited ? "In Track" : "Add Track"}
                </div>
              </div>
            )}
          </div>

          <h2 className="placename">{place.name}</h2>
          <div className="rating-display">
            {renderStars(Math.round(place.rating || 0))}
            <span style={{ marginLeft: 6, color: "#666" }}>
              ({place.rating?.toFixed(1) || "0.0"})
            </span>
          </div>
          <p className="address">{place.location}</p>
          <p className="description">{place.description}</p>

          {showMap && place.latitude && place.longitude && (
            <div
              className="map-container"
              style={{ height: "300px", width: "100%" }}
            >
              <MapContainer
                center={[place.latitude, place.longitude]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                />
                <Marker
                  position={[place.latitude, place.longitude]}
                  icon={customMarkerIcon}
                >
                  <Popup>
                    <div className="popup-header">
                      <strong>{place.name}</strong>
                    </div>
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
              Rate this location:{" "}
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    color: star <= rating ? "#ed0000" : "#ccc",
                    cursor: "pointer",
                    fontSize: "1.5rem",
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
          {place.reviews?.map((review) => (
            <div key={review.id} className="review">
              {review.user_id ? (
                <Link
                  to={`/users/${review.user_id}`}
                  className="review-author-link"
                >
                  {review.full_name || review.author || "Anonymous"}
                </Link>
              ) : (
                <strong>
                  {review.full_name || review.author || "Anonymous"}
                </strong>
              )}
              <div className="review-stars">
                {renderStars(Number(review.rating) || 0)}
              </div>
              <p>{review.text}</p>
              <small>
                {new Date(review.created_at).toLocaleDateString()}
              </small>
              <br />
              {userRole === "admin" && (
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

