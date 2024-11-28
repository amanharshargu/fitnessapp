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
import { MealPlannerProvider } from './contexts/MealPlannerContext';
import Layout from "./components/Layout";
import Footer from './components/layout/Footer';

// Lazy load components with descriptive chunk names
const LandingPage = lazy(() => import(/* webpackChunkName: "landing-page" */ "./pages/LandingPage"));
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ "./pages/dashboard/Dashboard"));
const Fridge = lazy(() => import(/* webpackChunkName: "fridge" */ "./pages/fridge/Fridge"));
const Recipes = lazy(() => import(/* webpackChunkName: "recipes" */ "./pages/recipes/Recipes"));
const LikedRecipes = lazy(() => import(/* webpackChunkName: "liked-recipes" */ "./pages/recipes/LikedRecipes"));
const SuggestedRecipes = lazy(() => import(/* webpackChunkName: "suggested-recipes" */ "./pages/recipes/SuggestedRecipes"));
const SignupModal = lazy(() => import(/* webpackChunkName: "auth" */ "./components/auth/SignupModal"));
const LoginModal = lazy(() => import(/* webpackChunkName: "auth" */ "./components/auth/LoginModal"));
const OAuthCallback = lazy(() => import(/* webpackChunkName: "auth" */ "./components/auth/OAuthCallback"));
const MealPlanner = lazy(() => import(/* webpackChunkName: "meal-planner" */ "./pages/mealplanner/MealPlanner"));
const ResetPassword = lazy(() => import(/* webpackChunkName: "auth" */ "./components/auth/ResetPassword"));
const ProfilePage = lazy(() => import(/* webpackChunkName: "profile" */ "./pages/profile/ProfilePage"));
const Contact = lazy(() => import(/* webpackChunkName: "contact" */ "./components/profile/Contact"));

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/" replace />;
};

const ConditionalLanding = () => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Layout isLandingPage>
      <Suspense fallback={null}>
        <LandingPage />
      </Suspense>
      <Footer />
    </Layout>
  );
};

const ProtectedLayout = ({ children }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

function AppRoutes() {
  const [authModals, setAuthModals] = useState({ signup: false, login: false });
  const { handleOAuthCallback } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleModal = useCallback((modalType, value) => {
    setAuthModals(prev => ({ ...prev, [modalType]: value }));
  }, []);

  const handleSwitchModal = useCallback((from, to) => {
    setAuthModals(prev => ({
      ...prev,
      [from]: false,
      [to]: true
    }));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const isNewUser = params.get("isNewUser") === "true";
    
    if (token) {
      handleOAuthCallback(token);
      navigate(isNewUser ? "/profile" : "/dashboard", { replace: true });
    }
  }, [location, handleOAuthCallback, navigate]);

  return (
    <>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<ConditionalLanding />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard/*" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/fridge" element={<ProtectedLayout><Fridge /></ProtectedLayout>} />
          <Route path="/recipes" element={<ProtectedLayout><Recipes /></ProtectedLayout>} />
          <Route path="/liked-recipes" element={<ProtectedLayout><LikedRecipes /></ProtectedLayout>} />
          <Route path="/suggested-recipes" element={<ProtectedLayout><SuggestedRecipes /></ProtectedLayout>} />
          <Route path="/meal-planner" element={<ProtectedLayout><MealPlanner /></ProtectedLayout>} />
          <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
          
          {/* Public Routes */}
          <Route path="/oauth-callback" element={<Layout><OAuthCallback /></Layout>} />
          <Route path="/reset-password/:token" element={<Layout><ResetPassword /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <SignupModal
          show={authModals.signup}
          onClose={() => toggleModal('signup', false)}
          onSwitchToLogin={() => handleSwitchModal('signup', 'login')}
        />
        <LoginModal
          show={authModals.login}
          onClose={() => toggleModal('login', false)}
          onSwitchToSignup={() => handleSwitchModal('login', 'signup')}
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
