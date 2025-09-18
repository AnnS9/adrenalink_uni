import { useState } from "react";
import AuthModal from "./AuthModal";

export default function CommunityBanner({ isLoggedIn }) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      {!isLoggedIn && (
        <div className="community-banner">
          Create account to access the Community Hub
          <button onClick={() => setShowAuthModal(true)}>Sign In</button>
        </div>
      )}

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
