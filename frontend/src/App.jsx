import React, { useState, useCallback, lazy, Suspense } from "react";
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

const Dashboard = lazy(() => import("./components/dashboard/Dashboard"));
const Fridge = lazy(() => import("./components/fridge/Fridge"));
const Recipes = lazy(() => import("./components/recipes/Recipes"));
const LikedRecipes = lazy(() => import("./components/recipes/LikedRecipes"));
const SignupModal = lazy(() => import("./components/auth/SignupModal"));
const UserDetailsModal = lazy(() => import("./components/auth/UserDetailsModal"));
const LoginModal = lazy(() => import("./components/auth/LoginModal"));

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

  const handleShowUserDetails = useCallback(() => setShowUserDetails(true), []);
  const handleUserDetailsSubmitted = useCallback(() => setShowUserDetails(false), []);

  const handleSwitchToLogin = useCallback(() => {
    setShowSignup(false);
    setShowLogin(true);
  }, []);

  const handleSwitchToSignup = useCallback(() => {
    setShowLogin(false);
    setShowSignup(true);
  }, []);

  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
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
          onSwitchToLogin={handleSwitchToLogin}
        />
        <LoginModal
          show={showLogin}
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={handleSwitchToSignup}
        />
        <UserDetailsModal
          show={showUserDetails}
          onClose={() => setShowUserDetails(false)}
          onDetailsSubmitted={handleUserDetailsSubmitted}
        />
      </Suspense>
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
