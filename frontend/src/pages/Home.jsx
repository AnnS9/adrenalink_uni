import { Link } from 'react-router-dom';
import '../styles/global.css';


export default function Home() {
  const sportsCategories = [
   { id: 1, name: 'Mountain Biking', image: '/images/mountain_biking.jpg' },
  { id: 2, name: 'Surfing', image: '/images/surfing.jpg' },
  { id: 3, name: 'Kitesurfing', image: '/images/kitesurfing.jpg' },
  { id: 4, name: 'Snowboarding', image: '/images/snowboard.jpg' },
  { id: 5, name: 'Ziplining', image: '/images/zipline.jpg' },
  { id: 6, name: 'Rock Climbing', image: '/images/climb.jpg' },
  ];

  return (
     <div className="container">
      <img src="/images/logo1.png" alt="AdrenaLink Logo" className="logo" />
      <h1>My adrenaline is</h1>
      <div className="grid">
        {sportsCategories.map(({ id, name, image }) => (
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
  );
}