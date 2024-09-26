import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import UserDetailsModal from "./UserDetailsModal";

function OAuthCallback() {
  const { handleOAuthCallback } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const isNewUser = params.get("isNewUser") === "true";

    if (token) {
      handleOAuthCallback(token);
      if (isNewUser) {
        setShowUserDetailsModal(true);
      } else {
        navigate("/dashboard");
      }
    } else {
      navigate("/");
    }
  }, [location, handleOAuthCallback, navigate]);

  const handleUserDetailsSubmitted = () => {
    setShowUserDetailsModal(false);
    navigate("/dashboard");
  };

  return (
    <>
      <div>Processing authentication...</div>
      <UserDetailsModal
        show={showUserDetailsModal}
        onClose={() => setShowUserDetailsModal(false)}
        onDetailsSubmitted={handleUserDetailsSubmitted}
      />
    </>
  );
}

export default OAuthCallback;