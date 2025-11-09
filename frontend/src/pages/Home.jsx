
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

  useEffect(() => {
    fetch(`${BASE}/api/categories`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPromoIndex(prev => (prev + 1) % PROMO_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="homepage">
      <div className="container">
        <h1>Discover the thrill near you</h1>
        <p className="promo-text">{PROMO_TEXTS[promoIndex]}</p>
        <div className="grid">
          {categories.map(({ id, name, image }) => (
            <Link to={`/category/${id}`} key={id}>
              <div className="tile">
                <img src={image} alt={name} />
                <div className="overlay" />
                <div className="textOverlay">
                  <span className="textInner">{name.toUpperCase()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
