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
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <span>WishEat</span>
        </Link>
        <div className="header-actions">
          {isLoggedIn ? (
            <button className="btn btn-outline-light" onClick={logout}>
              Logout
            </button>
          ) : (
            <button
              className="btn btn-outline-light"
              onClick={() => {
                setShowAuthModal(true);
                setIsSignup(false);
              }}
            >
              Sign In / Login
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
