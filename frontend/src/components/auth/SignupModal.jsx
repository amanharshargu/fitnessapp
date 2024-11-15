import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/SignupModal.css";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function SignupModal({ show, onClose, onSignupSuccess, onSwitchToLogin }) {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name, value) => {
    let error = "";
    if (name === "username") {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        error = "Username is required";
      } else if (trimmedValue.length < 3) {
        error = "Username must be at least 3 characters long";
      }
    } else if (name === "email") {
      if (!value) {
        error = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        error = "Email is invalid";
      }
    } else if (name === "password") {
      if (!value) {
        error = "Password is required";
      } else if (value.length < 6) {
        error = "Password must be at least 6 characters long";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        error = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
      }
    }
    return error;
  };

  const handleSignupInputChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;
    
    if (name === "username") {
      updatedValue = value.replace(/\s+/g, ' ').trim();
    }
    
    setSignupData((prevData) => ({
      ...prevData,
      [name]: updatedValue,
    }));

    const error = validateField(name, updatedValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signup(signupData);
      onSignupSuccess();
      navigate("/profile");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to create an account. Please try again.");
      }
    }
  };

  const handleInputFocus = (inputName) => {
    setFocusedInput(inputName);
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    setFocusedInput(null);
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (show) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="modal-overlay d-flex justify-content-center align-items-center h-100" onClick={onClose}>
      <div className="card bg-dark text-white" style={{borderRadius: '1rem', maxWidth: '400px'}} onClick={(e) => e.stopPropagation()}>
        <div className="card-body p-5 d-flex flex-column align-items-center mx-auto w-100">
          <h2 className="fw-bold mb-2 text-uppercase">Sign Up</h2>
          <p className="text-white-50 mb-5">Please enter your details to create an account!</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="w-100">
            <div className={`form-outline form-white mb-4 ${focusedInput === 'username' || signupData.username ? 'focused' : ''} ${errors.username ? 'is-invalid' : ''}`}>
              <input
                type="text"
                id="signupUsername"
                className={`form-control form-control-lg ${errors.username ? 'is-invalid' : ''}`}
                name="username"
                value={signupData.username}
                onChange={handleSignupInputChange}
                onFocus={() => handleInputFocus('username')}
                onBlur={handleInputBlur}
                required
              />
              <label className="form-label" htmlFor="signupUsername">Username</label>
              {errors.username && (
                <>
                  <div className="error-icon">!</div>
                  <div className="invalid-feedback">{errors.username}</div>
                </>
              )}
            </div>

            <div className={`form-outline form-white mb-4 ${focusedInput === 'email' || signupData.email ? 'focused' : ''} ${errors.email ? 'is-invalid' : ''}`}>
              <input
                type="email"
                id="signupEmail"
                className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                name="email"
                value={signupData.email}
                onChange={handleSignupInputChange}
                onFocus={() => handleInputFocus('email')}
                onBlur={handleInputBlur}
                required
              />
              <label className="form-label" htmlFor="signupEmail">Email address</label>
              {errors.email && (
                <>
                  <div className="error-icon">!</div>
                  <div className="invalid-feedback">{errors.email}</div>
                </>
              )}
            </div>

            <div
              className={`form-outline form-white mb-4 ${
                focusedInput === 'password' || signupData.password ? 'focused' : ''
              }`}
            >
              <div className={`password-input-wrapper ${errors.password ? "is-invalid" : ""}`}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="signupPassword"
                  className={`form-control form-control-lg ${
                    errors.password ? 'is-invalid' : ''
                  }`}
                  name="password"
                  value={signupData.password}
                  onChange={handleSignupInputChange}
                  onFocus={() => handleInputFocus('password')}
                  onBlur={handleInputBlur}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <label className="form-label" htmlFor="signupPassword">Password</label>
              {errors.password && (
                <div className="invalid-feedback d-block">{errors.password}</div>
              )}
            </div>

            <div className="text-center">
              <button 
                className="btn btn-outline-light btn-lg px-5" 
                type="submit"
                disabled={Object.values(errors).some(error => error !== "")}
              >
                Sign Up
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="mb-0">Already have an account?</p>
            <a href="#" className="text-white-50 fw-bold" onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin();
            }}>Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupModal;
