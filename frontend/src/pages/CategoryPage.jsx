import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import "../styles/CategoryPage.css";
import CategoryMap from "./CategoryMap";
import { apiGet } from "../lib/api";

export default function CategoryPage({ isLoggedIn, openAuth }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    apiGet(`/api/category/${id}`)
      .then((data) => {
        if (!alive) return;
        setCategory(data);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err.message || "Failed to fetch category");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  const renderStars = (value = 0) =>
    [1, 2, 3, 4, 5].map((star) => (
      <FaStar
        key={star}
        color={star <= value ? "#ed0000" : "#ccc"}
        size={16}
        style={{ marginRight: 2 }}
        aria-hidden="true"
      />
    ));

  const fmt = (n) => (typeof n === "number" ? n.toFixed(1) : "0.0");

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!category) return <div>No category data found.</div>;

  return (
    <div className="category-page alt-look">
      <header
        className="hero-image hero-alt"
        style={{ backgroundImage: `url(${category.image || ""})` }}
      >
        <div className="hero-overlay">
          <h1 className="hero-title big">{category.name?.toUpperCase()}</h1>
        </div>
      </header>

      <div className="page-container">
        <div className="toolbar">
          <nav className="crumbs category">
            <Link to="/">Home</Link> <span>›</span> <span>{category.name}</span>
          </nav>

          <button
            onClick={() => setShowMap(!showMap)}
            className={`mapbutton ${showMap ? "active" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: 6 }}
            >
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {showMap ? "Hide Map" : "View Map"}
          </button>

          {isLoggedIn && (
            <button onClick={() => navigate("/community")} className="community-button">
              Community Hub
            </button>
          )}
        </div>

        {!isLoggedIn && (
          <div className="signin-banner">
            <p>
               Sign in to access the <strong>Community Hub</strong> and share your reviews.
            </p>
            <button className="btn-small" onClick={() => openAuth(`/category/${id}`)}>
              Sign In
            </button>
          </div>
        )}

        {showMap && (
          <div className="map-drawer">
            <button className="close-button" onClick={() => setShowMap(false)} aria-label="Hide map">
              ×
            </button>
            <CategoryMap places={category.places || []} />
          </div>
        )}

        <section className="places-grid">
          {category.places?.length ? (
            category.places.map((place, index) => {
              const pid = place.id ?? index;
              const rounded = Math.round(place.rating || 0);

              return (
                <Link to={`/place/${pid}`} key={pid} className="place-card">
                  <div className="place-image-wrap">
                    <img
                      src={place.image || "/images/default.jpg"}
                      alt={place.name || "Unknown"}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/images/default.jpg";
                      }}
                    />
                    <div className="img-gradient" />
                    <div className="place-title-onimage">{place.name || "Unnamed Place"}</div>
                  </div>

                  <div className="place-meta">
                    

                    <div className="rating-stars">
                      {renderStars(rounded)}
                      <span className="rating-number">({fmt(place.rating)})</span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <p>No places found in this category.</p>
          )}
        </section>
      </div>
    </div>
  );
}
