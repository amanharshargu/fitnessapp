import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/ResetPassword.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'visible';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword: password
      });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="reset-password-overlay">
      <div className="reset-password-container">
        <h2 className="text-center mb-4">Reset Password</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3 password-field">
            {/* <label htmlFor="password" className="form-label">New Password</label> */}
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary eye-button"
                onClick={() => togglePasswordVisibility('password')}
                id="togglePassword"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>
          <div className="mb-3 password-field">
            {/* <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label> */}
            <div className="input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary eye-button"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                id="toggleConfirmPassword"
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
