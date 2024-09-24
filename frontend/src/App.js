import React, { useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { IngredientProvider } from "./contexts/IngredientContext";
import { RecipeProvider } from "./contexts/RecipeContext";
import { UserDetailsProvider } from "./contexts/UserDetailsContext";
import Layout from "./components/Layout";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/dashboard/Dashboard";
import Fridge from "./components/fridge/Fridge";
import Recipes from "./components/recipes/Recipes";
import LikedRecipes from "./components/recipes/LikedRecipes";
import SignupModal from "./components/auth/SignupModal";
import UserDetailsModal from "./components/auth/UserDetailsModal";
import LoginModal from "./components/auth/LoginModal";

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/" replace />;
}

function ConditionalLanding() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

function AppRoutes() {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const handleShowUserDetails = useCallback(() => {
    setShowUserDetails(true);
  }, []);

  const handleUserDetailsSubmitted = useCallback(() => {
    setShowUserDetails(false);
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ConditionalLanding />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard onSetUserDetails={handleShowUserDetails} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fridge"
          element={
            <ProtectedRoute>
              <Fridge />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              <Recipes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/liked-recipes"
          element={
            <ProtectedRoute>
              <LikedRecipes />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SignupModal
        show={showSignup}
        onClose={() => setShowSignup(false)}
        onShowUserDetails={handleShowUserDetails}
        onSwitchToLogin={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
      />
      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToSignup={() => {
          setShowLogin(false);
          setShowSignup(true);
        }}
      />
      <UserDetailsModal
        show={showUserDetails}
        onClose={() => setShowUserDetails(false)}
        onDetailsSubmitted={handleUserDetailsSubmitted}
      />
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserDetailsProvider>
          <IngredientProvider>
            <RecipeProvider>
              <AppRoutes />
            </RecipeProvider>
          </IngredientProvider>
        </UserDetailsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
