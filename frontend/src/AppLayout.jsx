import { Outlet } from 'react-router-dom';
import Footer from './components/Footer';
import BottomMenu from './components/BottomMenu';

export default function AppLayout({
  isLoggedIn,
  isAuthLoading,
  userRole,
  onAuthClick,
  onLogoutClick,
}) {
  return (
    <div className="app-layout">
      <main id="main">
        
        <Outlet />
      </main>

      <Footer />

      <BottomMenu
        isAuthLoading={isAuthLoading}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        onAuthClick={onAuthClick}
        onLogoutClick={onLogoutClick}
      />
    </div>
  );
}
