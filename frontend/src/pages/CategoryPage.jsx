import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/CategoryPage.css';
import CategoryMap from './CategoryMap';

export default function CategoryPage() {
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
        if (!res.ok) {
          throw new Error(`Failed to fetch category ${id}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => setCategory(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // ⭐ star renderer
  const renderStars = (value = 0) =>
    [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < value ? '#ed0000' : '#ccc' }}>★</span>
    ));

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!category) return <div>No category data found.</div>;

  return (
    <div className="category-page">
      <div
        className="hero-image"
        style={{ backgroundImage: `url(${category.image || ''})` }}
      >
        <h1 className="hero-title">{category.name?.toUpperCase()}</h1>
      </div>

      <div className="action-buttons">
        <button
          onClick={() => setShowMap(!showMap)}
          className={`mapbutton ${showMap ? 'active' : ''}`}
        >
          {showMap ? 'Hide Map' : 'View Map'}
        </button>

        <button onClick={() => navigate('/community')}>
          AdrenaTribe Community
        </button>
      </div>

      {showMap && <CategoryMap places={category.places || []} />}

      <div className="places-list">
        {category.places?.map((place, index) => (
          <div
            className="place-card"
            key={place.id || index}  // fallback if id missing
            onClick={() => navigate(`/place/${place.id || index}`)}
            style={{ cursor: 'pointer' }}
          >
            <img src={place.image || '/images/default.jpg'} alt={place.name || 'Unknown'} />
            <div className="place-info">
              <h3>{place.name || 'Unnamed Place'}</h3>
              <p>{place.location || 'Unknown location'}</p>
              <div className="rating-stars">
                {renderStars(Math.round(place.rating || 0))}
                <span style={{ marginLeft: 6, color: '#666' }}>
                  ({place.rating ? place.rating.toFixed(1) : "0.0"})
                </span>
              </div>
            </div>
          </div>
        )) || <p>No places found in this category.</p>}
      </div>
    </div>
  );
}
