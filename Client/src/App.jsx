import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import EnhancedRegister from "./pages/EnhancedRegister";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import ChooseFamily from "./pages/ChooseFamily";
import SetupFamily from "./pages/SetupFamily";
import JoinFamily from "./pages/JoinFamily";
import ToastNotification from "./components/ToastNotification";
import { ToastProvider, useToast } from "./context/ToastContext";

// Auth wrapper component
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();
  
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return children;
}

// Redirect if already authenticated
function RedirectIfAuth({ children }) {
  const token = localStorage.getItem("token");
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Check if user has family setup
function useAuth() {
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
    hasFamily: false,
    isLoading: true
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    try {
      const user = userStr ? JSON.parse(userStr) : null;
      setAuthState({
        token,
        user,
        hasFamily: !!(user?.familyId),
        isLoading: false
      });
    } catch (error) {
      console.error("Error parsing user data:", error);
      setAuthState({
        token: null,
        user: null,
        hasFamily: false,
        isLoading: false
      });
    }
  }, []);

  return authState;
}

// Family setup guard - redirects to choose-family if no family
function FamilySetupGuard({ children }) {
  const { token, hasFamily, isLoading } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();

  if (isLoading) {
    return (
      <div className="flex-col-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="spinner-lg mb-4"></div>
        <p className="text-gray-600 animate-pulse">Loading your family data...</p>
      </div>
    );
  }

  if (!token) {
    showToast("Please sign in to access family setup", "warning");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (hasFamily) {
    showToast("You already have a family setup", "info");
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Dashboard guard - redirects to choose-family if no family
function DashboardGuard({ children }) {
  const { token, hasFamily, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex-col-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="spinner-lg mb-4"></div>
        <p className="text-gray-600 animate-pulse">Loading your family data...</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // CRITICAL: If user has no family, redirect to choose-family
  if (!hasFamily) {
    return <Navigate to="/choose-family" state={{ from: location }} replace />;
  }

  return children;
}

function AppContent() {
  const { token, hasFamily, isLoading } = useAuth();
  const { toasts } = useToast();

  if (isLoading) {
    return (
      <div className="flex-col-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="relative">
          <div className="spinner-lg mb-4"></div>
          <div className="absolute inset-0 animate-ping bg-blue-100 rounded-full"></div>
        </div>
        <span className="ml-4 text-gray-600 animate-pulse">Loading application...</span>
      </div>
    );
  }

  return (
    <>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
          <Routes>
            {/* Public routes - redirect if already logged in */}
            <Route path="/" element={
              <RedirectIfAuth>
                <Login />
              </RedirectIfAuth>
            } />
            
            <Route path="/register" element={
              <RedirectIfAuth>
                <EnhancedRegister />
              </RedirectIfAuth>
            } />
            
            {/* Choose Family page - accessible only if logged in but no family */}
            <Route path="/choose-family" element={
              <RequireAuth>
                <ChooseFamily />
              </RequireAuth>
            } />
            
            {/* Protected dashboard - only accessible if logged in AND has family */}
            <Route path="/dashboard" element={
              <RequireAuth>
                <DashboardGuard>
                  <EnhancedDashboard />
                </DashboardGuard>
              </RequireAuth>
            } />
            
            {/* Family setup routes - only accessible if logged in but no family */}
            <Route path="/setup-family" element={
              <FamilySetupGuard>
                <SetupFamily />
              </FamilySetupGuard>
            } />
            
            <Route path="/join-family" element={
              <FamilySetupGuard>
                <JoinFamily />
              </FamilySetupGuard>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map((toast) => (
          <ToastNotification key={toast.id} {...toast} />
        ))}
      </div>
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;