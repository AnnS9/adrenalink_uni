import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AppLayout from './AppLayout';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import PlacePage from './pages/PlacePage';
import AdminPanel from './pages/AdminPanel';
import BottomMenu from './components/BottomMenu';
import AuthModal from './components/AuthModal';
import CommunityBanner from './components/Banner';
import UkMap from './components/UkMap';
import ProfilePage from './pages/ProfilePage';
import EditProfile from './pages/EditProfile';
import Tracks from './pages/Tracks';
import Community from './pages/Community';
import SearchResults from './pages/SearchResults';
import PublicProfile from './pages/PublicProfile';
import PublicUserTracks from './pages/PublicUserTracks';
import PostPage from './pages/PostPage';

// --- useAuth Hook ---
function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/check-auth', { credentials: 'include' });
        const data = await response.json();
        if (isMounted) {
          setIsLoggedIn(data.logged_in);
          setUserRole(data.user?.role || null);
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
      navigate('/');
    });
  }, [navigate]);

  const manualLogin = (user) => {
    setIsLoggedIn(true);
    setUserRole(user.role);
  };

  return { isLoggedIn, userRole, isAuthLoading, handleLogout, manualLogin };
}

// --- ProtectedRoute Component ---
function ProtectedRoute({ isAdmin, isAuthLoading, children }) {
  if (isAuthLoading) return <div>Authenticating...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

// --- AppContent Component ---
function AppContent() {
  const { isLoggedIn, userRole, isAuthLoading, handleLogout, manualLogin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openAuthModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const handleLoginSuccess = (userData) => { manualLogin(userData); closeModal(); };

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

      <AppLayout isLoggedIn={isLoggedIn} isAdmin={userRole === 'admin'}>
        {!isLoggedIn && <CommunityBanner onAuthClick={openAuthModal} />}

        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
          <Route path="/category/:id" element={<CategoryPage isLoggedIn={isLoggedIn} />} />

          <Route path="/place/:id" element={<PlacePage isLoggedIn={isLoggedIn} userRole={userRole} />} />
          <Route path="/map" element={<UkMap />} />
          <Route path="/tracks" element={isLoggedIn ? <Tracks /> : <Navigate to="/" replace />} />
          <Route path="/adrenaid" element={isLoggedIn ? <ProfilePage /> : <Navigate to="/" replace />} />
          <Route path="/adrenaid/edit" element={isLoggedIn ? <EditProfile /> : <Navigate to="/" replace />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/adminpanel" element={
            <ProtectedRoute isAdmin={userRole === 'admin'} isAuthLoading={isAuthLoading}>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/community" element={<Community isLoggedIn={isLoggedIn} />} />
          <Route path="/community/:id" element={<PostPage />} />
          <Route path="/users/:userId" element={<PublicProfile />} />
          <Route path="/users/:userId/tracks" element={<PublicUserTracks />} />
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
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
