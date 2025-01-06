import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CardioSpinner from "../common/CardioSpinner";

function OAuthCallback() {
  const { loginWithOAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        await loginWithOAuth();
        navigate('/profile');
      } catch (error) {
        console.error('OAuth login failed:', error);
        navigate('/login');
      }
    };

    handleOAuthCallback();
  }, [loginWithOAuth, navigate]);

  return (
    <div className="oauth-callback-container" data-test="oauth-callback-container">
      <CardioSpinner size="60" color="#007bff" data-test="oauth-loading-spinner" />
      <p data-test="oauth-loading-text">Processing your login...</p>
    </div>
  );
}

export default OAuthCallback;
