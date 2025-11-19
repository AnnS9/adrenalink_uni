import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="brand">
            <img src="/images/logo1.png" alt="Go to Adrenalink homepage" aria-hidden="true" className="brand-icon" />
            
          </Link>
          <p className="tagline">Find your next rush</p>
        </div>

        <nav className="footer-nav" aria-label="Primary footer">
          <Link to="/">Home</Link>
          <Link to="/map">Map</Link>
          <Link to="/community">Community</Link>
        </nav>

        <nav className="footer-legal" aria-label="Legal">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          
        </nav>

        
      </div>

      <div className="footer-bottom">
        <p>© {year} Adrenalink</p>
      </div>
    </footer>
  );
}
