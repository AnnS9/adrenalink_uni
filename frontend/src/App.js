import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
import Tracks from './pages/Tracks';
import Community from "./pages/Community";
import SearchResults from "./pages/SearchResults";

// --- useAuth Hook ---
const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    let isMounted = true;

    const checkAuthStatus = async () => {
      try {
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
        if (isMounted) setIsAuthLoading(false);
      }
    };

    checkAuthStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = useCallback(() => {
    fetch('/api/logout', { method: 'POST', credentials: 'include' }).then(() => {
      setIsLoggedIn(false);
      setUserRole(null);
      navigate('/');
    });
  }, [navigate]);

  const manualLogin = (user) => {
    setIsLoggedIn(true);
    setUserRole(user.role);
  };

  return { isLoggedIn, userRole, isAdmin, isAuthLoading, handleLogout, manualLogin };
};

// --- ProtectedRoute Component ---
function ProtectedRoute({ isAdmin, isAuthLoading, children }) {
  if (isAuthLoading) return <div>Authenticating...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

// --- AppContent Component ---
function AppContent() {
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
      {/* ToastContainer allows toast messages to appear */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <AppLayout isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/place/:id" element={<PlacePage isLoggedIn={isLoggedIn} userRole={userRole} />} />
          <Route path="/map" element={<UkMap />} />

          <Route
            path="/adrenaid"
            element={
              isAuthLoading ? <div>Loading...</div> : isLoggedIn ? <ProfilePage /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/adrenaid/edit"
            element={
              isAuthLoading ? <div>Loading...</div> : isLoggedIn ? <EditProfile /> : <Navigate to="/" replace />
            }
          />
          <Route path="/search" element={<SearchResults />} />
          <Route
            path="/adminpanel"
            element={
              <ProtectedRoute isAdmin={isAdmin} isAuthLoading={isAuthLoading}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tracks"
            element={
              isAuthLoading ? <div>Loading...</div> : isLoggedIn ? <Tracks /> : <Navigate to="/" replace />
            }
          />
          <Route path="/community" element={<Community isLoggedIn={isLoggedIn} />} />
        </Routes>
      </AppLayout>

      <BottomMenu
        isAuthLoading={isAuthLoading}
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
