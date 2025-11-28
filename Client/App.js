import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  // Keep your token check as you had it
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* Default route goes to Login */}
        <Route path="/" element={<Login />} />

        {/* Registration route */}
        <Route path="/register" element={<Register />} />

        {/* Dashboard route - protected */}
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/" />}
        />

        {/* Catch-all route redirects to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;