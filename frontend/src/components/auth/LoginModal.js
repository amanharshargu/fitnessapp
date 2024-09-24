import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/LoginModal.css";

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
      } else if (value.length < 4) {
        error = "Password must be at least 4 characters long";
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

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(loginData.password)) {
      setError("Password must be more than 7 characters long");
      return;
    }

    try {
      await login(loginData.email, loginData.password);
      onClose();
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please check your credentials and try again.");
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
          <h2 className="fw-bold mb-2 text-uppercase">Login</h2>
          <p className="text-white-50 mb-5">
            Please enter your login and password!
          </p>

          {error && <div className="alert alert-danger">{error}</div>}

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
              <input
                type="password"
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
              <label className="form-label" htmlFor="loginPassword">
                Password
              </label>
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>

            <p className="small mb-3 pb-lg-2">
              <a
                className="text-white-50"
                href="#"
                onClick={(e) => e.preventDefault()}
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
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
