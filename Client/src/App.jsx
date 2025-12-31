// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import EnhancedRegister from "./pages/EnhancedRegister";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import SetupFamily from "./pages/SetupFamily";
import JoinFamily from "./pages/JoinFamily";

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

// Family setup guard
function FamilySetupGuard({ children }) {
  const { token, hasFamily, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (hasFamily) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const { token, hasFamily, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-4 text-gray-600">Loading...</span>
    </div>;
  }

  return (
    <Router>
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
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <RequireAuth>
            <EnhancedDashboard />
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
    </Router>
  );
}

export default App;