import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/global.css";

const PROMO_TEXTS = [
  "Find your next adventure",
  "Discover adrenaline spots",
  "Track your favorite places",
];

const BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

export default function Home({ isLoggedIn }) {
  const [categories, setCategories] = useState([]);
  const [promoIndex, setPromoIndex] = useState(0);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Fetch categories
  useEffect(() => {
    let cancelled = false;
    setIsLoadingCategories(true);
    setLoadError(null);

    fetch(`${BASE}/api/categories`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setCategories(data || []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load categories:", err);
          setLoadError("Could not load categories. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingCategories(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Rotating promo text
  useEffect(() => {
    const interval = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % PROMO_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="homepage">
      <div className="container">
        <h1>Discover the thrill near you</h1>
        <p className="promo-text">{PROMO_TEXTS[promoIndex]}</p>

        {isLoadingCategories && (
          <div className="home-loading">
            Loading spots for you...
          </div>
        )}

        {loadError && !isLoadingCategories && (
          <div className="home-error">
            {loadError}
          </div>
        )}

        {!isLoadingCategories && !loadError && (
          <div className="grid">
            {categories.map(({ id, name, image }) => (
              <Link to={`/category/${id}`} key={id}>
                <div className="tile">
                  <img
                    src={image}
                    alt={name}
                    loading="lazy"
                  />
                  <div className="overlay" />
                  <div className="textOverlay">
                    <span className="textInner">{name.toUpperCase()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
