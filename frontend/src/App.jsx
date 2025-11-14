import { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RouteLoader from "./components/RouteLoader";
import Loader from "./components/Loader";
import AppLayout from "./AppLayout";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import PlacePage from "./pages/PlacePage";
import AdminPanel from "./pages/AdminPanel";
import AuthModal from "./components/AuthModal";
import UkMap from "./components/UkMap";
import ProfilePage from "./pages/ProfilePage";
import EditProfile from "./pages/EditProfile";
import Tracks from "./pages/Tracks";
import Community from "./pages/Community";
import PublicProfile from "./pages/PublicProfile";
import PublicUserTracks from "./pages/PublicUserTracks";
import PostPage from "./pages/PostPage";

import { apiGet, apiSend } from "./lib/api";

function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;

    const bootstrap = async () => {
      try {
       
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) {
          setIsLoggedIn(true);
          setUserRole(storedRole);
        }

       
        const data = await apiGet("/api/check-auth");
        if (!alive) return;

        if (data?.logged_in) {
          setIsLoggedIn(true);
          const role = data.user?.role || null;
          setUserRole(role);
          if (role) localStorage.setItem("userRole", role);
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
          localStorage.removeItem("userRole");
        }
      } catch {
        
      } finally {
        if (alive) setIsAuthLoading(false);
      }
    };

    bootstrap();
    return () => {
      alive = false;
    };
  }, []);

  const handleLogout = useCallback(() => {
    apiSend("/api/logout", "POST")
      .catch(() => {})
      .finally(() => {
        setIsLoggedIn(false);
        setUserRole(null);
        localStorage.removeItem("userRole");
        navigate("/");
      });
  }, [navigate]);

  const manualLogin = (user) => {
    setIsLoggedIn(true);
    setUserRole(user.role);
    localStorage.setItem("userRole", user.role);
  };

  return { isLoggedIn, userRole, isAuthLoading, handleLogout, manualLogin };
}

function RequireLogin({ isAuthLoading, isLoggedIn, children }) {
  if (isAuthLoading) return <Loader />;
  if (!isLoggedIn) return <Navigate to="/" replace />;
  return children;
}

function RequireAdmin({ isAuthLoading, userRole, children }) {
  if (isAuthLoading) return <Loader />;
  if (userRole !== "admin") return <Navigate to="/" replace />;
  return children;
}

function AppContent() {
  const { isLoggedIn, userRole, isAuthLoading, handleLogout, manualLogin } =
    useAuth();

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

 
  if (isAuthLoading) {
    return <Loader />;
  }

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

          <Route
            path="/place/:id"
            element={
              <PlacePage isLoggedIn={isLoggedIn} userRole={userRole} />
            }
          />

          <Route path="/map" element={<UkMap />} />

          <Route
            path="/tracks"
            element={
              <RequireLogin
                isAuthLoading={isAuthLoading}
                isLoggedIn={isLoggedIn}
              >
                <Tracks />
              </RequireLogin>
            }
          />

          <Route
            path="/adrenaid"
            element={
              <RequireLogin
                isAuthLoading={isAuthLoading}
                isLoggedIn={isLoggedIn}
              >
                <ProfilePage />
              </RequireLogin>
            }
          />
          <Route
            path="/adrenaid/edit"
            element={
              <RequireLogin
                isAuthLoading={isAuthLoading}
                isLoggedIn={isLoggedIn}
              >
                <EditProfile />
              </RequireLogin>
            }
          />

          <Route path="/profile" element={<Navigate to="/adrenaid" replace />} />

          <Route
            path="/adminpanel"
            element={
              <RequireAdmin
                isAuthLoading={isAuthLoading}
                userRole={userRole}
              >
                <AdminPanel />
              </RequireAdmin>
            }
          />

          <Route
            path="/community"
            element={<Community isLoggedIn={isLoggedIn} />}
          />
          <Route path="/community/:id" element={<PostPage />} />

          <Route path="/users/:userId" element={<PublicProfile />} />
          <Route
            path="/users/:userId/tracks"
            element={<PublicUserTracks />}
          />
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
     
      <RouteLoader />
      <AppContent />
    </Router>
  );
}
