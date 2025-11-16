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
import '../styles/TopMenu.css'; 

export default function HeaderMenu({
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


    document.body.style.overflow = isMenuOpen && !mq.matches ? 'hidden' : 'auto';

    return () => {
      window.removeEventListener('scroll', onScroll);
      mq.removeEventListener?.('change', enableDesktopScroll);
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const navLinkClasses = ({ isActive }) =>
    `nav-item is-link ${isActive ? 'active' : ''}`.trim();


  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAuthClick = () => {
    onAuthClick();
    handleLinkClick();
  };

  const handleLogoutClick = () => {
    onLogoutClick();
    handleLinkClick();
  };

  const MenuLinks = ({ isMobile = false }) => (
    <>
      <NavLink
        to="/"
        end
        className={navLinkClasses}
        aria-label="Home"
        onClick={isMobile ? handleLinkClick : undefined}
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
            onClick={isMobile ? handleLinkClick : undefined}
          >
            <FontAwesomeIcon icon={faMapLocationDot} />
            <span className="label">MAP</span>
          </NavLink>

          {userRole === 'client' && (
            <NavLink
              to="/tracks"
              className={navLinkClasses}
              aria-label="Tracks"
              onClick={isMobile ? handleLinkClick : undefined}
            >
              <FontAwesomeIcon icon={faRoute} />
              <span className="label">TRACKS</span>
            </NavLink>
          )}

          <NavLink
            to="/adrenaid"
            className={navLinkClasses}
            aria-label="My profile"
            onClick={isMobile ? handleLinkClick : undefined}
          >
            <FontAwesomeIcon icon={faIdCard} />
            <span className="label">MY ID</span>
          </NavLink>

          {userRole === 'admin' && (
            <NavLink
              to="/adminpanel"
              className={navLinkClasses}
              aria-label="Admin"
              onClick={isMobile ? handleLinkClick : undefined}
            >
              <FontAwesomeIcon icon={faUserShield} />
              <span className="label">ADMIN</span>
            </NavLink>
          )}
        </>
      )}

      <div className="auth-buttons" role="group" aria-label="Account">
        {!isAuthLoading &&
          (isLoggedIn ? (
            <button
              onClick={handleLogoutClick}
              className="nav-item is-button"
              aria-label="Log out"
            >
              <FontAwesomeIcon icon={faRightFromBracket} />
              <span className="label">LOG OUT</span>
            </button>
          ) : (
            <button
              onClick={handleAuthClick}
              className="nav-item is-button"
              aria-label="Log in or sign up"
            >
              <FontAwesomeIcon icon={faRightToBracket} />
              <span className="label">LOGIN / SIGN UP</span>
            </button>
          ))}
      </div>
    </>
  );

  return (
    <nav
      className={`header-menu ${scrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''}`}
      role="navigation"
      aria-label="Primary"
    >
      <NavLink
        to="/"
        className="desktop-logo-link"
        aria-label="Adrenalink home"
      >
        <img src="/images/logo1.png" alt="Adrenalink" className="desktop-logo" />
      </NavLink>


      <div className="header-menu-links">
        <MenuLinks />
      </div>

 
      <button
        className="hamburger-button"
        onClick={toggleMenu}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-menu-overlay"
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
      >
        <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} />
      </button>


      {isMenuOpen && (
        <div id="mobile-menu-overlay" className="mobile-menu-overlay">
          <div className="mobile-menu-links">
            <MenuLinks isMobile={true} />
          </div>
        </div>
      )}
    </nav>
  );
}