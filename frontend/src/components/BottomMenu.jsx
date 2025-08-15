import React from 'react';
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

// The component now accepts 'onAuthClick' and the new 'isAuthLoading' prop
export default function BottomMenu({ isAuthLoading, isLoggedIn, userRole, onAuthClick, onLogoutClick }) {
  
  const navLinkClasses = ({ isActive }) => 
    `nav-item is-link ${isActive ? 'active' : ''}`.trim();

  return (
    <nav className="bottom-menu">
      <NavLink to="/" className="desktop-logo-link">
        <img src="/images/logo1.png" alt="Adrenalink Logo" className="desktop-logo" />
      </NavLink>
      
      <NavLink to="/" end className={navLinkClasses}>
        <FontAwesomeIcon icon={faHouse} />
        <span>HOME</span>
      </NavLink>

      {isLoggedIn && (
        <>
          <NavLink to="/map" className={navLinkClasses}>
            <FontAwesomeIcon icon={faMapLocationDot} />
            <span>MAP</span>
          </NavLink>
          {userRole === 'client' && (
          <NavLink to="/tracks" className={navLinkClasses}>
            <FontAwesomeIcon icon={faRoute} />
            <span>TRACKS</span>
          </NavLink>)}
          <NavLink to="/adrenaid" className={navLinkClasses}>
            <FontAwesomeIcon icon={faIdCard} />
            <span>MY ID</span>
          </NavLink>
          {userRole === 'admin' && (
            <NavLink to="/adminpanel" className={navLinkClasses}>
              <FontAwesomeIcon icon={faUserShield} />
              <span>ADMIN</span>
            </NavLink>
          )}
        </>
      )}

      <div className="auth-buttons">
        {/* --- THIS IS THE KEY FIX --- */}
        {/* While checking auth, render nothing. Otherwise, show the correct button. */}
        {isAuthLoading ? null : isLoggedIn ? (
          <button onClick={onLogoutClick} className="nav-item is-button">
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>LOG OUT</span>
          </button>
        ) : (
          <button onClick={onAuthClick} className="nav-item is-button">
            <FontAwesomeIcon icon={faRightToBracket} />
            <span>LOGIN / SIGN UP</span>
          </button>
        )}
      </div>
    </nav>
  );
}