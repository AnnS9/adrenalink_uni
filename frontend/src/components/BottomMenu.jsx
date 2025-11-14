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
  faBars,
  faXmark,
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');

    const onScroll = () => setScrolled(window.scrollY > 8);

    const enableDesktopScroll = () => {
      if (!mq.matches) {
        setScrolled(false);
        window.removeEventListener('scroll', onScroll, { passive: true });
        return;
      }
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    };

    enableDesktopScroll();
    mq.addEventListener?.('change', enableDesktopScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      mq.removeEventListener?.('change', enableDesktopScroll);
    };
  }, []);

  const navLinkClasses = ({ isActive }) =>
    `nav-item is-link ${isActive ? 'active' : ''}`.trim();

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav
      className={`bottom-menu ${scrolled ? 'scrolled' : ''} ${
        isMenuOpen ? 'menu-open' : ''
      }`}
      role="navigation"
      aria-label="Primary"
    >
      {/* Logo */}
      <NavLink
        to="/"
        className="desktop-logo-link"
        aria-label="Adrenalink home"
        onClick={closeMenu}
      >
        <img src="/images/logo1.png" alt="Adrenalink" className="desktop-logo" />
      </NavLink>

      {/* Hamburger toggle - visible on mobile in CSS */}
      <button
        className="hamburger-toggle"
        type="button"
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} />
      </button>

      {/* Links container */}
      <div className={`bottom-menu-links ${isMenuOpen ? 'open' : ''}`}>
        <NavLink
          to="/"
          end
          className={navLinkClasses}
          aria-label="Home"
          onClick={closeMenu}
        >
          <FontAwesomeIcon icon={faHouse} />
          <span className="label">HOME</span>
        </NavLink>

        {!isAuthLoading && isLoggedIn && (
          <>
            <NavLink
              to="/map"
              className={navLinkClasses}
              aria-label="Map"
              onClick={closeMenu}
            >
              <FontAwesomeIcon icon={faMapLocationDot} />
              <span className="label">MAP</span>
            </NavLink>

            {userRole === 'client' && (
              <NavLink
                to="/tracks"
                className={navLinkClasses}
                aria-label="Tracks"
                onClick={closeMenu}
              >
                <FontAwesomeIcon icon={faRoute} />
                <span className="label">TRACKS</span>
              </NavLink>
            )}

            <NavLink
              to="/adrenaid"
              className={navLinkClasses}
              aria-label="My profile"
              onClick={closeMenu}
            >
              <FontAwesomeIcon icon={faIdCard} />
              <span className="label">MY ID</span>
            </NavLink>

            {userRole === 'admin' && (
              <NavLink
                to="/adminpanel"
                className={navLinkClasses}
                aria-label="Admin"
                onClick={closeMenu}
              >
                <FontAwesomeIcon icon={faUserShield} />
                <span className="label">ADMIN</span>
              </NavLink>
            )}
          </>
        )}

        {/* Auth */}
        <div className="auth-buttons" role="group" aria-label="Account">
          {!isAuthLoading &&
            (isLoggedIn ? (
              <button
                onClick={() => {
                  onLogoutClick();
                  closeMenu();
                }}
                className="nav-item is-button"
                aria-label="Log out"
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
                <span className="label">LOG OUT</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onAuthClick();
                  closeMenu();
                }}
                className="nav-item is-button"
                aria-label="Log in or sign up"
              >
                <FontAwesomeIcon icon={faRightToBracket} />
                <span className="label">LOGIN / SIGN UP</span>
              </button>
            ))}
        </div>
      </div>
    </nav>
  );
}
