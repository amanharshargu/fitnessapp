import React from 'react';
import '../../styles/HowItWorksModal.css';

const HowItWorksModal = ({ show, onClose, onGetStarted }) => {
  if (!show) return null;

  const handleGetStarted = () => {
    onClose();
    onGetStarted();
  };

  const steps = [
    {
      icon: "🔍",
      title: "Search & Discover",
      description: "Find recipes based on ingredients you have or want to use. Filter by dietary preferences and nutritional needs.",
      detail: "Our smart search helps you find the perfect recipe from thousands of options."
    },
    {
      icon: "🏪",
      title: "Virtual Fridge",
      description: "Keep track of ingredients you have at home. Get notified when items are running low or about to expire.",
      detail: "Never waste food again with our smart inventory management."
    },
    {
      icon: "❤️",
      title: "Save Favorites",
      description: "Like recipes to build your personal collection. Access them anytime for quick meal planning.",
      detail: "Create your own cookbook with your favorite dishes."
    },
    {
      icon: "📊",
      title: "Track Nutrition",
      description: "Monitor your daily nutritional intake. Set goals and track your progress over time.",
      detail: "Stay on top of your health goals with detailed nutrition insights."
    },
    {
      icon: "📅",
      title: "Meal Planning",
      description: "Plan your meals for the week. Generate shopping lists automatically.",
      detail: "Make meal prep easier with organized planning tools."
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="how-it-works-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>How WishEat Works</h2>
        </div>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-icon">{step.icon}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p className="step-description">{step.description}</p>
                <p className="step-detail">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="get-started-button" onClick={handleGetStarted}>
            Got It, Let's Start!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal; 