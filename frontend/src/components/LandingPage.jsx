import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRecipes } from "../contexts/RecipeContext";
import LoginModal from "./auth/LoginModal";
import SignupModal from "./auth/SignupModal";
import "../styles/LandingPage.css";

function LandingPage() {
  const { isLoggedIn } = useAuth();
  const { getRandomRecipes } = useRecipes();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [randomRecipes, setRandomRecipes] = useState([]);

  const fetchRandomRecipes = useCallback(async () => {
    try {
      const recipes = await getRandomRecipes(3);
      setRandomRecipes(recipes);
    } catch (error) {
      console.error("Error fetching random recipes:", error);
      setRandomRecipes([]);
    }
  }, [getRandomRecipes]);

  useEffect(() => {
    fetchRandomRecipes();
  }, [fetchRandomRecipes]);

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    setIsSignup(false);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleGetStarted = () => {
    setShowAuthModal(true);
    setIsSignup(false);
  };

  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Make Your <span className="highlight">Food</span> Count
          </h1>
          <button className="get-started-btn" onClick={handleGetStarted}>Get Started</button>
          <div className="food-images">
            {randomRecipes.map((recipe, index) => (
              <div key={recipe.uri} className="image-container">
                <img
                  src={recipe.image}
                  alt={`Food dish ${index + 1}`}
                  className={`dish-image dish-${index + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 All rights reserved.</p>
          <nav>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Contact Us</a>
          </nav>
        </div>
      </footer>

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
    </div>
  );
}

export default LandingPage;
