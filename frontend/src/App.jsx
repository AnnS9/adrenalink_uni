import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AppLayout from './AppLayout';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import PlacePage from './pages/PlacePage';
import AdminPanel from './pages/AdminPanel';
import AuthModal from './components/AuthModal';
import UkMap from './components/UkMap';
import ProfilePage from './pages/ProfilePage';
import EditProfile from './pages/EditProfile';
import Tracks from './pages/Tracks';
import Community from './pages/Community';
import SearchResults from './pages/SearchResults';
import PublicProfile from './pages/PublicProfile';
import PublicUserTracks from './pages/PublicUserTracks';
import PostPage from './pages/PostPage';

function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      if (isMounted) {
        setIsLoggedIn(true);
        setUserRole(storedRole);
        setIsAuthLoading(false);
      }
      return;
    }

    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/check-auth', { credentials: 'include' });
        const data = await response.json();
        if (isMounted) {
          setIsLoggedIn(data.logged_in);
          setUserRole(data.user?.role || null);
          if (data.user?.role) localStorage.setItem('userRole', data.user.role);
        }
      } catch {
        if (isMounted) {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    };

    checkAuthStatus();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = useCallback(() => {
    fetch('/api/logout', { method: 'POST', credentials: 'include' }).then(() => {
      setIsLoggedIn(false);
      setUserRole(null);
      localStorage.removeItem('userRole');
      navigate('/');
    });
  }, [navigate]);

  const manualLogin = (user) => {
    setIsLoggedIn(true);
    setUserRole(user.role);
    localStorage.setItem('userRole', user.role);
  };

  return { isLoggedIn, userRole, isAuthLoading, handleLogout, manualLogin };
}

function ProtectedRoute({ isAdmin, isAuthLoading, children }) {
  if (isAuthLoading) return <div>Authenticating...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppContent() {
  const { isLoggedIn, userRole, isAuthLoading, handleLogout, manualLogin } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nextPath, setNextPath] = useState(null);

  const openAuthModal = () => setIsModalOpen(true);
  const openAuthWithNext = (next) => {
    setNextPath(next || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNextPath(null);
  };

  const handleLoginSuccess = (userData) => {
    manualLogin(userData);
    closeModal();
  };

  if (isAuthLoading) return <div>Loading...</div>;

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        draggable
        theme="colored"
      />

      <Routes>
        <Route
          element={
            <AppLayout
              isLoggedIn={isLoggedIn}
              isAuthLoading={isAuthLoading}
              userRole={userRole}
              onAuthClick={openAuthModal}
              onLogoutClick={handleLogout}
            />
          }
        >
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
          <Route
            path="/category/:id"
            element={
              <CategoryPage
                isLoggedIn={isLoggedIn}
                openAuth={openAuthWithNext}
              />
            }
          />
          <Route path="/place/:id" element={<PlacePage isLoggedIn={isLoggedIn} userRole={userRole} />} />
          <Route path="/map" element={<UkMap />} />
          <Route path="/tracks" element={isLoggedIn ? <Tracks /> : <Navigate to="/" replace />} />
          <Route path="/adrenaid" element={isLoggedIn ? <ProfilePage /> : <Navigate to="/" replace />} />
          <Route path="/adrenaid/edit" element={isLoggedIn ? <EditProfile /> : <Navigate to="/" replace />} />
          <Route path="/search" element={<SearchResults />} />
          <Route
            path="/adminpanel"
            element={
              <ProtectedRoute isAdmin={userRole === 'admin'} isAuthLoading={isAuthLoading}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route path="/community" element={<Community isLoggedIn={isLoggedIn} />} />
          <Route path="/community/:id" element={<PostPage />} />
          <Route path="/users/:userId" element={<PublicProfile />} />
          <Route path="/users/:userId/tracks" element={<PublicUserTracks />} />
        </Route>
      </Routes>

      <AuthModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onLoginSuccess={handleLoginSuccess}
        nextPath={nextPath}
      />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
