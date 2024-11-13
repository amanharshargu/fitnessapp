import React, { useState } from 'react';
import ContactModal from '../profile/Contact';
import '../../styles/Footer.css';

function Footer() {
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h4>WishEat</h4>
            <span className="footer-divider">|</span>
            <p>&copy; 2024 All rights reserved</p>
          </div>
          <nav className="footer-links">
            <button 
              className="contact-link"
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
