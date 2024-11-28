import React, { useState, useEffect, useCallback } from "react";
import { useRecipes } from "../contexts/RecipeContext";
import LoginModal from "../components/auth/LoginModal";
import SignupModal from "../components/auth/SignupModal";
import HowItWorksModal from '../components/modals/HowItWorksModal';
import "../styles/LandingPage.css";

function LandingPage() {
  const { getCuratedDishes } = useRecipes();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

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
        <div className="hero-content">
          <div className="hero-left">
            <div className="title-wrapper">
              <span className="pre-title">Welcome to WishEat</span>
              <h1 className="hero-title">
                Discover the Joy of <br />
                <span className="highlight">Healthy Eating</span>
              </h1>
              <p className="hero-subtitle">
                Personalized recipes, nutrition tracking, and meal planning tools to help you live your healthiest life.
              </p>
            </div>
            <div className="cta-group">
              <button className="primary-cta" onClick={handleGetStarted}>
                Get Started Free
              </button>
              <button 
                className="secondary-cta"
                onClick={() => setShowHowItWorks(true)}
              >
                See How It Works <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            <div className="trust-badges">
              <div className="badge">
                <span className="number">10k+</span>
                <span className="label">Active Users</span>
              </div>
              <div className="badge">
                <span className="number">5k+</span>
                <span className="label">Recipes</span>
              </div>
              <div className="badge">
                <span className="number">4.8</span>
                <span className="label">User Rating</span>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="recipe-showcase">
              {isLoading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Finding delicious recipes...</p>
                </div>
              ) : (
                <div className="recipe-carousel">
                  {randomRecipes.map((recipe, index) => (
                    <div 
                      key={recipe.uri} 
                      className={`recipe-card ${index === activeIndex ? 'active' : ''}`}
                    >
                      <div className="recipe-image-container">
                        <img
                          src={recipe.image}
                          alt={recipe.label}
                          className="recipe-image"
                        />
                        <div className="recipe-overlay">
                          <span className="recipe-category">Featured</span>
                          <h4 className="recipe-title">{recipe.label}</h4>
                          <div className="recipe-stats">
                            <span className="calories">
                              <i className="fas fa-fire"></i>
                              {recipe.calories.toFixed(0)} cal
                            </span>
                            <span className="time">
                              <i className="fas fa-clock"></i>
                              20 min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-search"></i>
            </div>
            <h3>Smart Recipe Search</h3>
            <p>Find recipes that match your dietary preferences and restrictions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Nutrition Tracking</h3>
            <p>Monitor your daily intake and track your progress over time</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <h3>Meal Planning</h3>
            <p>Plan your meals ahead and stay organized throughout the week</p>
          </div>
        </div>
      </section>

      <HowItWorksModal 
        show={showHowItWorks} 
        onClose={() => setShowHowItWorks(false)}
        onGetStarted={handleGetStarted}
      />

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
