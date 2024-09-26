import React, { useState, useEffect } from "react";
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
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isLandingPage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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
      className={`header ${isHeaderVisible ? "" : "header--hidden"} ${
        isLandingPage ? "header--transparent" : "header--solid"
      }`}
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
