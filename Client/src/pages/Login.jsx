import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import API from "../services/api.js";
import { LogIn, Mail, Lock, Users, Eye, EyeOff, ArrowRight } from "lucide-react";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate form
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await API.post("/auth/login", form);

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      // Show success feedback
      setTimeout(() => {
        // Enhanced redirect logic
        if (res.user.familyId) {
          // User has a family, go to intended destination or dashboard
          navigate(from, { replace: true });
        } else {
          // User needs to setup family - redirect to choose-family page
          navigate("/choose-family", { replace: true });
        }
      }, 1500);

    } catch (err) {
      console.error("Login error:", err);
      setError(err.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setForm({
      email: "demo@familytree.com",
      password: "demopassword123"
    });
  };

  return (
    <div className="min-h-screen-safe bg-gradient-to-br from-blue-50 via-white to-purple-50 flex-center p-4">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-lg z-10 animate-fadeIn">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-6 hover-lift">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Welcome Back
          </h1>
          <div className="text-gradient text-2xl font-bold mb-2">Family Tree</div>
          <p className="text-gray-600 text-lg">
            Sign in to continue your family journey
          </p>
        </div>

        {/* Login Card */}
        <div className="card-padded hover-glow animate-slideIn">
          {error && (
            <div className="alert-danger mb-6 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <i className="fas fa-exclamation-circle"></i>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{error}</p>
                </div>
                <button 
                  onClick={() => setError("")}
                  className="text-red-600 hover:text-red-800"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          )}

          {/* Demo Account Hint */}
          <div className="alert-info mb-6">
            <p className="text-sm">
              <strong>Demo Account:</strong> demo@familytree.com / demopassword123
            </p>
            <button 
              onClick={handleDemoLogin}
              className="text-blue-700 hover:text-blue-900 text-sm font-medium mt-2 flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              Fill Demo Credentials
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label form-label-required">
                <Mail className="h-5 w-5" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="form-input pl-12"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={loading}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="flex-between mb-2">
                <label className="form-label form-label-required">
                  <Lock className="h-5 w-5" />
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2"
                  disabled={loading}
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Hide Password
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Show Password
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="form-input pl-12 pr-12"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  disabled={loading}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700 font-medium">
                  Remember me
                </span>
              </label>
              
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-base font-semibold active-scale"
            >
              {loading ? (
                <>
                  <div className="spinner-md border-t-white"></div>
                  <span className="animate-pulse">Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-6 w-6" />
                  Sign In to Family Tree
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-500 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Options */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              className="btn-outline flex items-center justify-center gap-3 py-3"
              disabled={loading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="btn-outline flex items-center justify-center gap-3 py-3"
              disabled={loading}
            >
              <svg className="h-5 w-5 fill-current text-black" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Don't have a family tree account?
            </p>
            <Link
              to="/register"
              className="btn-outline w-full flex items-center justify-center gap-3 py-3 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
            >
              <Users className="h-5 w-5" />
              Create Your Family Tree
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex-center gap-6 mb-4">
            <Link to="/about" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              About Us
            </Link>
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Terms of Service
            </Link>
            <Link to="/help" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Help Center
            </Link>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Family Tree. Connect your roots, grow your branches.
          </p>
        </div>
      </div>

      {/* Background Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/80 via-white/40 to-transparent pointer-events-none"></div>
    </div>
  );
}

export default Login;