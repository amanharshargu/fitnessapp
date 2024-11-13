import React, { useState } from 'react';
import ContactModal from '../profile/Contact';
import '../../styles/Footer.css';

function Footer() {
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <>
      <footer className="wisheat-footer">
        <div className="wisheat-footer-content">
          <div className="wisheat-footer-brand">
            <h4 className="wisheat-footer-title">WishEat</h4>
            <span className="wisheat-footer-divider">|</span>
            <p className="wisheat-footer-copyright">&copy; 2024 All rights reserved</p>
          </div>
          <nav className="wisheat-footer-nav">
            <button 
              className="wisheat-footer-contact-btn"
              onClick={() => setShowContactModal(true)}
            >
              Contact Us
            </button>
          </nav>
        </div>
      </footer>

      <ContactModal 
        show={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </>
  );
}

export default Footer;
