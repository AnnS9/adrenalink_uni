import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faMapLocationDot,
  faRoute,
  faIdCard,
  faUserShield,
  faRightFromBracket,
  faRightToBracket,
} from '@fortawesome/free-solid-svg-icons';
import '../styles/BottomMenu.css';

export default function BottomMenu({
  isAuthLoading,
  isLoggedIn,
  userRole,
  onAuthClick,
  onLogoutClick,
}) {
  const [scrolled, setScrolled] = useState(false);

  // Detect scrolling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkClasses = ({ isActive }) =>
    `nav-item is-link ${isActive ? 'active' : ''}`.trim();

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>

      <nav
        className={`bottom-menu ${scrolled ? 'scrolled' : ''}`}
        role="navigation"
        aria-label="Primary"
      >
        {/* Logo (visible on desktop) */}
        <NavLink to="/" className="desktop-logo-link" aria-label="Adrenalink home">
          <img src="/images/logo1.png" alt="Adrenalink" className="desktop-logo" />
        </NavLink>

        {/* Main navigation */}
        <NavLink to="/" end className={navLinkClasses} aria-label="Home">
          <FontAwesomeIcon icon={faHouse} />
          <span className="label">HOME</span>
        </NavLink>

        {!isAuthLoading && isLoggedIn && (
          <>
            <NavLink to="/map" className={navLinkClasses} aria-label="Map">
              <FontAwesomeIcon icon={faMapLocationDot} />
              <span className="label">MAP</span>
            </NavLink>

            {userRole === 'client' && (
              <NavLink to="/tracks" className={navLinkClasses} aria-label="Tracks">
                <FontAwesomeIcon icon={faRoute} />
                <span className="label">TRACKS</span>
              </NavLink>
            )}

            <NavLink to="/adrenaid" className={navLinkClasses} aria-label="My ID">
              <FontAwesomeIcon icon={faIdCard} />
              <span className="label">MY ID</span>
            </NavLink>

            {userRole === 'admin' && (
              <NavLink to="/adminpanel" className={navLinkClasses} aria-label="Admin">
                <FontAwesomeIcon icon={faUserShield} />
                <span className="label">ADMIN</span>
              </NavLink>
            )}
          </>
        )}

        {/* Authentication controls */}
        <div className="auth-buttons" role="group" aria-label="Account">
          {!isAuthLoading && (isLoggedIn ? (
            <button
              onClick={onLogoutClick}
              className="nav-item is-button"
              aria-label="Log out"
            >
              <FontAwesomeIcon icon={faRightFromBracket} />
              <span className="label">LOG OUT</span>
            </button>
          ) : (
            <button
              onClick={onAuthClick}
              className="nav-item is-button"
              aria-label="Log in or sign up"
            >
              <FontAwesomeIcon icon={faRightToBracket} />
              <span className="label">LOGIN / SIGN UP</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
