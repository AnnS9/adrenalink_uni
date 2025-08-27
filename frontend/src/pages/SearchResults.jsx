import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import "../styles/global.css";

export default function SearchResults() {
  const [results, setResults] = useState([]);
  const location = useLocation();

  // Extract query param from URL
  const query = new URLSearchParams(location.search).get("q");

  useEffect(() => {
  if (!query) return;

  fetch(`http://localhost:5000/api/semantic-search?q=${encodeURIComponent(query)}`)
    .then((res) => res.json())
    .then((data) => setResults(data))
    .catch((err) => console.error(err));
}, [query]);

  return (
  <div className="container">
    <h1>Search Results for: {query}</h1>
    {results.length === 0 ? (
      <p>No matching places found.</p>
    ) : (
      results.map((place) => (
        <div key={place.id} className="result-card">
          <h2>{place.name}</h2>
          <p>{place.location} — ⭐ {place.rating}</p>
          <p>{place.description}</p>
        </div>
      ))
    )}

      <Link to="/" className="back-button">
        ⬅ Back to Home
      </Link>
    </div>
  );
}
