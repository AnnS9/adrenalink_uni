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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!category) return <div>No category data found.</div>;

  return (
    <div className="category-page">
      <div
        className="hero-image"
        style={{ backgroundImage: `url(${category.image})` }}
      >
        <h1 className="hero-title">{category.name.toUpperCase()}</h1>
      </div>

      <div className="action-buttons">
        <button
          onClick={() => setShowMap(!showMap)}
          className={`mapbutton ${showMap ? 'active' : ''}`}
        >
          {showMap ? 'Hide Map' : 'View Map'}
        </button>

        <button onClick={() => navigate('/community')}>AdrenaTribe Community</button>
      </div>

      {showMap && <CategoryMap places={category.places} />}

      <div className="places-list">
        {category.places?.map((place) => (
          <div
            className="place-card"
            key={place.id}
            onClick={() => navigate(`/place/${place.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <img src={place.image} alt={place.name} />
            <div className="place-info">
              <h3>{place.name}</h3>
              <p>{place.location}</p>
              <p>⭐ {place.rating}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}