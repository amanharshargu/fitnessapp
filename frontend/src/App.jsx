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
import Footer from './components/layout/Footer';

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
const Contact = lazy(() => import(/* webpackChunkName: "contact" */ "./components/profile/Contact"));

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/" replace />;
}

function ConditionalLanding() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Layout isLandingPage>
      <LandingPage />
      <Footer />
    </Layout>
  );
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
    <>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<ConditionalLanding />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fridge"
            element={
              <ProtectedRoute>
                <Layout>
                  <Fridge />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes"
            element={
              <ProtectedRoute>
                <Layout>
                  <Recipes />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/liked-recipes"
            element={
              <ProtectedRoute>
                <Layout>
                  <LikedRecipes />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/suggested-recipes"
            element={
              <ProtectedRoute>
                <Layout>
                  <SuggestedRecipes />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meal-planner"
            element={
              <ProtectedRoute>
                <Layout>
                  <MealPlanner />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/oauth-callback"
            element={
              <Layout>
                <OAuthCallback />
              </Layout>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <Layout>
                <ResetPassword />
              </Layout>
            }
          />
          <Route
            path="/contact"
            element={
              <Layout>
                <Contact />
              </Layout>
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
    </>
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
