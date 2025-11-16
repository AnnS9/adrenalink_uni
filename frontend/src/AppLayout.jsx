import { Outlet } from 'react-router-dom';
import Footer from './components/Footer';
import TopMenu from './components/TopMenu';

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

      <TopMenu
        isAuthLoading={isAuthLoading}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        onAuthClick={onAuthClick}
        onLogoutClick={onLogoutClick}
      />
    </div>
  );
}
