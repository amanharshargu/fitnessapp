import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import '../../styles/Contact.css';

function ContactModal({ show, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateForm = () => {
    let tempErrors = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      tempErrors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.length < 2) {
      tempErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Subject validation
    if (!formData.subject.trim()) {
      tempErrors.subject = 'Subject is required';
      isValid = false;
    } else if (formData.subject.length < 3) {
      tempErrors.subject = 'Subject must be at least 3 characters';
      isValid = false;
    }

    // Message validation
    if (!formData.message.trim()) {
      tempErrors.message = 'Message is required';
      isValid = false;
    } else if (formData.message.length < 10) {
      tempErrors.message = 'Message must be at least 10 characters';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_name: 'WishEat Team'
      };

      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        templateParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      );
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setSubmitStatus('success');
      
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!show) return null;

  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div className="contact-modal-content" onClick={e => e.stopPropagation()}>
        <button className="contact-close-button" onClick={onClose}>&times;</button>
        <h1 className="contact-title">Contact Us</h1>
        <p className="contact-description">
          Have questions or suggestions? We'd love to hear from you.
        </p>
        
        {submitStatus === 'success' && (
          <div className="contact-status-message contact-success">
            Message sent successfully!
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="contact-status-message contact-error">
            Failed to send message. Please try again.
          </div>
        )}
        
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form-group">
            <label className="contact-label" htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className={`contact-input ${errors.name ? 'contact-input-error' : ''}`}
            />
            {errors.name && <span className="contact-error-text">{errors.name}</span>}
          </div>

          <div className="contact-form-group">
            <label className="contact-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className={`contact-input ${errors.email ? 'contact-input-error' : ''}`}
            />
            {errors.email && <span className="contact-error-text">{errors.email}</span>}
          </div>

          <div className="contact-form-group">
            <label className="contact-label" htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className={`contact-input ${errors.subject ? 'contact-input-error' : ''}`}
            />
            {errors.subject && <span className="contact-error-text">{errors.subject}</span>}
          </div>

          <div className="contact-form-group">
            <label className="contact-label" htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              disabled={isSubmitting}
              className={`contact-textarea ${errors.message ? 'contact-input-error' : ''}`}
            />
            {errors.message && <span className="contact-error-text">{errors.message}</span>}
          </div>

          <button 
            type="submit" 
            className="contact-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactModal;
