import React, { useState, useCallback, lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { IngredientProvider } from "./contexts/IngredientContext";
import { RecipeProvider } from "./contexts/RecipeContext";
import { UserDetailsProvider } from "./contexts/UserDetailsContext";
import Layout from "./components/Layout";
import { MealPlannerProvider } from './contexts/MealPlannerContext';

const LandingPage = lazy(() => import(/* webpackChunkName: "landing-page" */ "./components/LandingPage"));
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ "./components/dashboard/Dashboard"));
const Fridge = lazy(() => import(/* webpackChunkName: "fridge" */ "./components/fridge/Fridge"));
const Recipes = lazy(() => import(/* webpackChunkName: "recipes" */ "./components/recipes/Recipes"));
const LikedRecipes = lazy(() => import(/* webpackChunkName: "liked-recipes" */ "./components/recipes/LikedRecipes"));
const SuggestedRecipes = lazy(() => import(/* webpackChunkName: "suggested-recipes" */ "./components/recipes/SuggestedRecipes"));
const SignupModal = lazy(() => import(/* webpackChunkName: "auth" */ "./components/auth/SignupModal"));
const LoginModal = lazy(() => import(/* webpackChunkName: "auth" */ "./components/auth/LoginModal"));
const OAuthCallback = lazy(() => import(/* webpackChunkName: "auth" */ "./components/auth/OAuthCallback"));
const MealPlanner = lazy(() => import(/* webpackChunkName: "meal-planner" */ "./components/mealplanner/MealPlanner"));
const ResetPassword = lazy(() => import(/* webpackChunkName: "auth" */ "./components/auth/ResetPassword"));
const ProfilePage = lazy(() => import(/* webpackChunkName: "profile" */ "./components/profile/ProfilePage"));

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

  const handleSwitchToLogin = useCallback(() => {
    setShowSignup(false);
    setShowLogin(true);
  }, []);

  const handleSwitchToSignup = useCallback(() => {
    setShowLogin(false);
    setShowSignup(true);
  }, []);

  const { handleOAuthCallback } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const isNewUser = params.get("isNewUser") === "true";
    if (token) {
      handleOAuthCallback(token);
      if (isNewUser) {
        navigate("/profile", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [location, handleOAuthCallback, navigate]);

  return (
    <Layout>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<ConditionalLanding />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
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
          <Route
            path="/suggested-recipes"
            element={
              <ProtectedRoute>
                <SuggestedRecipes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meal-planner"
            element={
              <ProtectedRoute>
                <MealPlanner />
              </ProtectedRoute>
            }
          />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <SignupModal
          show={showSignup}
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={handleSwitchToLogin}
        />
        <LoginModal
          show={showLogin}
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={handleSwitchToSignup}
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
              <MealPlannerProvider>
                <AppRoutes />
              </MealPlannerProvider>
            </RecipeProvider>
          </IngredientProvider>
        </UserDetailsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
