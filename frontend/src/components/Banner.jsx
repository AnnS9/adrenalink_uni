import { useState } from "react";
import AuthModal from "./AuthModal";

export default function CommunityBanner({ onAuthClick }) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClick = () => {
    if (onAuthClick) onAuthClick();
    else setShowAuthModal(true);
  };

  return (
    <>
      <div className="community-banner">
        Create an account to access the Community Hub
        <button onClick={handleClick}>SIGN IN</button>
      </div>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}
