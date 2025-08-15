import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';


import AppLayout from './AppLayout';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import PlacePage from './pages/PlacePage';
import AdminPanel from './pages/AdminPanel';
import BottomMenu from './components/BottomMenu';
import AuthModal from './components/AuthModal';
import UkMap from './components/UkMap';
import ProfilePage from './pages/ProfilePage';
import EditProfile from './pages/EditProfile';


// --- A more robust useAuth Hook ---
const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  // This state is crucial. It tracks the INITIAL auth check on page load.
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();
  const isAdmin = userRole === 'admin';

  // This useEffect hook runs ONLY ONCE when the app first loads.
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts

    const checkAuthStatus = async () => {
      try {
        // 👉 Use relative URL so the cookie is treated as same‑site in dev & prod
        const response = await fetch('/api/check-auth', { credentials: 'include' });
        const data = await response.json();
        
        if (isMounted) {
          setIsLoggedIn(data.logged_in);
          setUserRole(data.user_role);
        }
      } catch (error) {
        if (isMounted) {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      } finally {
        if (isMounted) {
          // The initial check is complete.
          setIsAuthLoading(false);
        }
      }
    };

    checkAuthStatus();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, []); // The empty array [] ensures this runs only once.

  const handleLogout = useCallback(() => {
    // 👉 Relative path again
    fetch('/api/logout', { method: 'POST', credentials: 'include' })
      .then(() => {
        setIsLoggedIn(false);
        setUserRole(null);
        navigate('/');
      });
  }, [navigate]);
  
  const manualLogin = (user) => {
    setIsLoggedIn(true);
    setUserRole(user.role);
  };

  // Expose the initial loading state
  return { isLoggedIn, userRole, isAdmin, isAuthLoading, handleLogout, manualLogin };
};


// --- ProtectedRoute Component ---
// This component now correctly uses the initial auth loading state.
function ProtectedRoute({ isAdmin, isAuthLoading, children }) {
  if (isAuthLoading) {
    // While checking auth, show a loading message. DO NOT render children.
    return <div>Authenticating...</div>;
  }
  
  if (!isAdmin) {
    // If not an admin after checking, redirect.
    return <Navigate to="/" replace />;
  }

  // If auth check is done and user is an admin, render the component.
  return children;
}


// --- AppContent Component ---
function AppContent() {
  // Get the new isAuthLoading state from the hook
  const { isLoggedIn, userRole, isAdmin, isAuthLoading, handleLogout, manualLogin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openAuthModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  const handleLoginSuccess = (userData) => {
    manualLogin(userData);
    closeModal();
  };

  return (
    <>
      <AppLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/category/:id" element={<CategoryPage />} />
    <Route
      path="/place/:id"
      element={<PlacePage isLoggedIn={isLoggedIn} userRole={userRole} />}
    />
    <Route path="/map" element={<UkMap />} />
    
    <Route
      path="/adrenaid"
      element={
        isAuthLoading ? (
          <div>Loading...</div>
        ) : isLoggedIn ? (
          <ProfilePage />
        ) : (
          <Navigate to="/" replace />
        )
      }
    />
    <Route
      path="/adrenaid/edit"
      element={
        isAuthLoading ? (
          <div>Loading...</div>
        ) : isLoggedIn ? (
          <EditProfile />
        ) : (
          <Navigate to="/" replace />
        )
      }
    />

    {/* Admin-only panel */}
    <Route
      path="/adminpanel"
      element={
        <ProtectedRoute isAdmin={isAdmin} isAuthLoading={isAuthLoading}>
          <AdminPanel />
        </ProtectedRoute>
      }
    />
  </Routes>
</AppLayout>

      <BottomMenu
        isAuthLoading={isAuthLoading} // Pass the loading state down
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        onAuthClick={openAuthModal}
        onLogoutClick={handleLogout}
      />
      <AuthModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}


// --- Main App Component ---
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
