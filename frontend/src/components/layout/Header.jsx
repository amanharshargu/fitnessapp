import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoginModal from "../auth/LoginModal";
import SignupModal from "../auth/SignupModal";
import "../../styles/Header.css";

function Header() {
  const { isLoggedIn, logout, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    setIsSignup(false);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const displayName = user?.username || "Account";

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate("/profile");
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="wisheat-header">
      <div className="wisheat-header__container">
        <Link to="/" className="wisheat-header__logo">
          <span>WishEat</span>
        </Link>
        <div className="wisheat-header__actions">
          {isLoggedIn ? (
            <div className="wisheat-header__dropdown" ref={dropdownRef}>
              <button
                className="wisheat-header__btn wisheat-header__btn--outline"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {user?.photo && (
                  <img
                    src={user?.photo}
                    alt={displayName}
                    className="wisheat-header__user-photo"
                  />
                )}
                {displayName}
              </button>
              {showDropdown && (
                <div className="wisheat-header__dropdown-content">
                  <button
                    className="wisheat-header__dropdown-item"
                    onClick={handleProfileClick}
                  >
                    My Profile
                  </button>
                  <button
                    className="wisheat-header__dropdown-item"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
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
