import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/global.css";


export default function Home({ isLoggedIn }) {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [promoIndex, setPromoIndex] = useState(0);
  const navigate = useNavigate();

  const promoTexts = [
    "Find your next adventure",
    "Discover adrenaline spots",
    "Track your favorite places",
  ];

  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPromoIndex(prev => (prev + 1) % promoTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="homepage">
      

      <div className="container">
        <img src="/images/logo1.png" alt="AdrenaLink Logo" className="logo" />
        <h1>Pick Your Adrenaline</h1>

        <p className="promo-text">{promoTexts[promoIndex]}</p>

        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

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
