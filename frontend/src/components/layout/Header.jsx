import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoginModal from "../auth/LoginModal";
import SignupModal from "../auth/SignupModal";
import "../../styles/Header.css";

function Header() {
  const { isLoggedIn, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    setIsSignup(false);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  return (
    <header className="wisheat-header">
      <div className="wisheat-header__container">
        <Link to="/" className="wisheat-header__logo">
          <span>WishEat</span>
        </Link>
        <div className="wisheat-header__actions">
          {isLoggedIn ? (
            <button className="wisheat-header__btn wisheat-header__btn--outline" onClick={logout}>
              Logout
            </button>
          ) : (
            <button
              className="wisheat-header__btn wisheat-header__btn--outline"
              onClick={() => {
                setShowAuthModal(true);
                setIsSignup(false);
              }}
            >
              Sign Up / Log In
            </button>
          )}
        </div>
      </div>

      {showAuthModal && (
        isSignup ? (
          <SignupModal
            show={showAuthModal}
            onClose={handleCloseAuthModal}
            onSignupSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setIsSignup(false)}
          />
        ) : (
          <LoginModal
            show={showAuthModal}
            onClose={handleCloseAuthModal}
            onLoginSuccess={handleAuthSuccess}
            onSwitchToSignup={() => setIsSignup(true)}
          />
        )
      )}
    </header>
  );
}

export default Header;
