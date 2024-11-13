import React, { useState, useEffect, useCallback } from "react";
import { useRecipes } from "../contexts/RecipeContext";
import LoginModal from "./auth/LoginModal";
import SignupModal from "./auth/SignupModal";
import "../styles/LandingPage.css";

function LandingPage() {
  const { getCuratedDishes } = useRecipes();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRandomRecipes = useCallback(async () => {
    try {
      setIsLoading(true);
      const recipes = await getCuratedDishes(6);
      setRandomRecipes(recipes);
    } catch (error) {
      console.error("Error fetching curated dishes:", error);
      setRandomRecipes([]);
    } finally {
      setIsLoading(false);
    }
  }, [getCuratedDishes]);

  useEffect(() => {
    fetchRandomRecipes();
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
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
    <div className="landing-container">
      <div className="hero-section">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-left">
            <div className="title-wrapper">
              <h1 className="hero-title">
                Your Journey to <span className="highlight">Healthier</span> Eating
              </h1>
              <div className="emoji-accent">🥗</div>
            </div>
            <p className="hero-subtitle">
              Discover, track, and transform your relationship with food
            </p>
            <div className="cta-buttons">
              <button className="get-started-btn pulse-animation" onClick={handleGetStarted}>
                Start Your Journey
              </button>
            </div>
          </div>

          <div className="landing-recipe-showcase">
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Finding delicious recipes...</p>
              </div>
            ) : (
              randomRecipes.map((recipe, index) => (
                <div 
                  key={recipe.uri} 
                  className={`landing-showcase-item ${index === activeIndex ? 'active' : ''}`}
                >
                  <div className="landing-recipe-card">
                    <div className="landing-recipe-image-wrapper">
                      <img
                        src={recipe.image}
                        alt={recipe.label}
                        className="landing-recipe-image"
                      />
                    </div>
                    <div className="landing-recipe-details">
                      <h4>{recipe.label}</h4>
                      <span className="landing-calorie-badge">
                        {recipe.calories.toFixed(0)} cal
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="journey-steps">
          <div className="step">
            <div className="step-icon">
              <i className="fas fa-search"></i>
            </div>
            <h3>Discover</h3>
            <p>Find recipes that match your taste and goals</p>
          </div>
          <div className="step">
            <div className="step-icon">
              <i className="fas fa-heart"></i>
            </div>
            <h3>Save</h3>
            <p>Build your personal recipe collection</p>
          </div>
          <div className="step">
            <div className="step-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Track</h3>
            <p>Monitor your nutrition journey</p>
          </div>
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
    </div>
  );
}

export default LandingPage;
