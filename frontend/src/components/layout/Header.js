import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoginModal from "../auth/LoginModal";
import SignupModal from "../auth/SignupModal";
import UserDetailsModal from "../auth/UserDetailsModal";
import "../../styles/header.css";

function Header() {
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);

  const isLandingPage = location.pathname === "/";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    setIsSignup(false);
  };
  const handleCloseUserDetailsModal = () => setShowUserDetailsModal(false);

  const handleAuthSuccess = (isNewUser) => {
    setShowAuthModal(false);
    if (isNewUser) {
      setShowUserDetailsModal(true);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <header
      style={{
        position: isLandingPage ? "absolute" : "relative",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        padding: "20px 0",
        backgroundColor: isLandingPage ? "transparent" : "rgba(0, 0, 0, 0.8)",
      }}
    >
      <div className="container d-flex justify-content-between align-items-center">
        <Link to="/" className="text-decoration-none">
          <span className="h4" style={{ color: "white" }}>
            Health & Fitness Tracker
          </span>
        </Link>
        <div>
          {isLoggedIn ? (
            <button className="btn btn-outline-light" onClick={handleLogout}>
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
              Login / Sign Up
            </button>
          )}
        </div>
      </div>

      {showAuthModal &&
        (isSignup ? (
          <SignupModal
            show={showAuthModal}
            onClose={handleCloseAuthModal}
            onSignupSuccess={() => handleAuthSuccess(true)}
            onSwitchToLogin={() => setIsSignup(false)}
          />
        ) : (
          <LoginModal
            show={showAuthModal}
            onClose={handleCloseAuthModal}
            onLoginSuccess={() => handleAuthSuccess(false)}
            onSwitchToSignup={() => setIsSignup(true)}
          />
        ))}
      <UserDetailsModal
        show={showUserDetailsModal}
        onClose={handleCloseUserDetailsModal}
      />
    </header>
  );
}

export default Header;
