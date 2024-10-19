import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/LoginModal.css";
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

function LoginModal({ show, onClose, onLoginSuccess, onSwitchToSignup }) {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [errors, setErrors] = useState({});
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordEmailError, setForgotPasswordEmailError] = useState("");
  const [emailValidated, setEmailValidated] = useState(false);
  const [forgotPasswordEmailValidated, setForgotPasswordEmailValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name, value) => {
    let error = "";
    if (name === "email") {
      if (!value) {
        error = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        error = "Email is invalid";
      }
    } else if (name === "password") {
      if (!value) {
        error = "Password is required";
      }
    }
    return error;
  };

  useEffect(() => {
    if (isLoggedIn && shouldRedirect) {
      onClose();
      navigate("/dashboard");
      setShouldRedirect(false);
    }
  }, [isLoggedIn, shouldRedirect, navigate, onClose]);

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

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'email' && emailValidated) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(loginData.email, loginData.password);
      onClose();
    } catch (error) {
      console.error("Login failed:", error);
      setError(error.response?.data?.message || "Login failed. Please check your credentials and try again.");
    }
  };

  const handleInputFocus = (inputName) => {
    setFocusedInput(inputName);
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    setFocusedInput(null);
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    if (name === 'email') {
      setEmailValidated(true);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_BASE_URL}/auth/google`;
  };

  const handleForgotPasswordEmailChange = (e) => {
    const { value } = e.target;
    setForgotPasswordEmail(value);
    if (forgotPasswordEmailValidated) {
      setForgotPasswordEmailError(validateField("email", value));
    }
  };

  const handleForgotPasswordEmailFocus = () => {
    setFocusedInput("forgotPasswordEmail");
  };

  const handleForgotPasswordEmailBlur = () => {
    setFocusedInput(null);
    setForgotPasswordEmailError(validateField("email", forgotPasswordEmail));
    setForgotPasswordEmailValidated(true);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordError("");
    setForgotPasswordMessage("");

    const emailError = validateField("email", forgotPasswordEmail);
    if (emailError) {
      setForgotPasswordEmailError(emailError);
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/forgot-password`, {
        email: forgotPasswordEmail,
      });
      setForgotPasswordMessage(response.data.message);
    } catch (error) {
      console.error("Forgot password failed:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setForgotPasswordError(error.response.data.message);
      } else {
        setForgotPasswordError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setShowForgotPassword(true);
  };

  const handleBackToLogin = (e) => {
    e.preventDefault();
    setShowForgotPassword(false);
    setForgotPasswordMessage("");
    setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (!show) return null;

  return (
    <div
      className="modal-overlay d-flex justify-content-center align-items-center h-100"
      onClick={onClose}
    >
      <div
        className="card bg-dark text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-body d-flex flex-column align-items-center mx-auto w-100">
          <h2 className="fw-bold mb-2 text-uppercase">
            {showForgotPassword ? "Forgot Password" : "Login"}
          </h2>
          <p className="text-white-50 mb-5">
            {showForgotPassword
              ? "Enter your email to reset your password"
              : "Please enter your login and password!"}
          </p>

          {!showForgotPassword && error && <div className="alert alert-danger">{error}</div>}
          {showForgotPassword && forgotPasswordError && <div className="alert alert-danger">{forgotPasswordError}</div>}
          {forgotPasswordMessage && <div className="alert alert-success">{forgotPasswordMessage}</div>}

          {!showForgotPassword ? (
            <form onSubmit={handleLogin} className="w-100">
              <div
                className={`form-outline form-white mb-4 ${
                  focusedInput === "email" || loginData.email ? "focused" : ""
                } ${errors.email ? "is-invalid" : ""}`}
              >
                <input
                  type="email"
                  id="loginEmail"
                  className={`form-control form-control-lg ${
                    errors.email ? "is-invalid" : ""
                  }`}
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginInputChange}
                  onFocus={() => handleInputFocus("email")}
                  onBlur={handleInputBlur}
                  required
                />
                <label className="form-label" htmlFor="loginEmail">
                  Email address
                </label>
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              <div
                className={`form-outline form-white mb-4 ${
                  focusedInput === "password" || loginData.password
                    ? "focused"
                    : ""
                } ${errors.password ? "is-invalid" : ""}`}
              >
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="loginPassword"
                    className={`form-control form-control-lg ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginInputChange}
                    onFocus={() => handleInputFocus("password")}
                    onBlur={handleInputBlur}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary password-toggle-btn"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <label className="form-label" htmlFor="loginPassword">
                  Password
                </label>
                {errors.password && (
                  <div className="invalid-feedback">{errors.password}</div>
                )}
              </div>
              <p className="" style={{ marginTop: '10px', marginBottom: '20px' }}>
                <a
                  className="text-white-50"
                  href="#"
                  onClick={handleForgotPasswordClick}
                >
                  Forgot password?
                </a>
              </p>

              <div className="text-center">
                <button
                  className="btn btn-outline-light btn-lg px-5"
                  type="submit"
                >
                  Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="w-100">
              <div className={`form-outline form-white mb-4 ${focusedInput === "forgotPasswordEmail" || forgotPasswordEmail ? "focused" : ""} ${forgotPasswordEmailError ? "is-invalid" : ""}`}>
                <input
                  type="email"
                  id="forgotPasswordEmail"
                  className={`form-control form-control-lg ${forgotPasswordEmailError ? "is-invalid" : ""}`}
                  value={forgotPasswordEmail}
                  onChange={handleForgotPasswordEmailChange}
                  onFocus={handleForgotPasswordEmailFocus}
                  onBlur={handleForgotPasswordEmailBlur}
                  required
                />
                <label className="form-label" htmlFor="forgotPasswordEmail">
                  Email address
                </label>
                {forgotPasswordEmailError && (
                  <div className="invalid-feedback">{forgotPasswordEmailError}</div>
                )}
              </div>
              <div className="text-center">
                <button 
                  className="btn btn-outline-light btn-lg px-5" 
                  type="submit"
                  disabled={!!forgotPasswordEmailError}
                >
                  Reset Password
                </button>
              </div>
              <p className="mt-3 text-center">
                <a
                  className="text-white-50"
                  href="#"
                  onClick={handleBackToLogin}
                >
                  Back to Login
                </a>
              </p>
            </form>
          )}

          {!showForgotPassword && (
            <>
              <div className="mt-4">
                <button
                  className="google-login-btn"
                  onClick={handleGoogleLogin}
                  aria-label="Sign in with Google"
                >
                  <FcGoogle size={20} />
                  <span style={{ paddingLeft: '4px' }}>Sign in with Google</span>
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="mb-0">Don't have an account?</p>
                <a
                  href="#"
                  className="text-white-50 fw-bold"
                  onClick={(e) => {
                    e.preventDefault();
                    onSwitchToSignup();
                  }}
                >
                  Sign Up
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
