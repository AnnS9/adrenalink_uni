import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/CategoryPage.css';
import CategoryMap from './CategoryMap';

export default function CategoryPage({ isLoggedIn, openAuth }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`http://localhost:5000/api/category/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch category ${id}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => setCategory(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const renderStars = (value = 0) =>
    [...Array(5)].map((_, i) => (
      <span key={i} className={i < value ? 'filled' : ''}>★</span>
    ));

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!category) return <div>No category data found.</div>;

  const nextParam = `/category/${id}`;

  return (
    <div className="category-page alt-look">
      <header
        className="hero-image hero-alt"
        style={{ backgroundImage: `url(${category.image || ''})` }}
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
            className={`mapbutton ${showMap ? 'active' : ''}`}
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
            {showMap ? 'Hide Map' : 'View Map'}
          </button>

          {isLoggedIn && (
            <button
              onClick={() => navigate('/community')}
              className="community-button"
            >
              Community Space
            </button>
          )}
        </div>

        {!isLoggedIn && (
          <div className="signin-banner">
            <p>🔒 Sign in to access the <strong>Community Hub</strong> and share your reviews.</p>
            <button
              className="btn-small"
              onClick={() => openAuth(nextParam)}
            >
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
          {category.places?.map((place, index) => {
            const rating = Math.round(place.rating || 0);
            return (
              <Link
                to={`/place/${place.id || index}`}
                key={place.id || index}
                className="place-card"
              >
                <div className="place-image-wrap">
                  <img
                    src={place.image || '/images/default.jpg'}
                    alt={place.name || 'Unknown'}
                  />
                  <div className="img-gradient" />
                  <div className="place-title-onimage">
                    {place.name || 'Unnamed Place'}
                  </div>
                </div>

                <div className="place-meta">
                  <p className="place-desc">
                    {place.description || 'Explore this spot and see what the community says.'}
                  </p>
                  <div className="rating-stars">
                    {renderStars(rating)}
                    <span className="rating-number">
                      {` (${place.rating ? place.rating.toFixed(1) : '0.0'})`}
                    </span>
                  </div>
                </div>
              </Link>
            );
          }) || <p>No places found in this category.</p>}
        </section>
      </div>
    </div>
  );
}


