import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import EnhancedRegister from "./pages/EnhancedRegister";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import SetupFamily from "./pages/SetupFamily";
import JoinFamily from "./pages/JoinFamily";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<EnhancedRegister />} />
        <Route path="/dashboard" element={token ? <EnhancedDashboard /> : <Navigate to="/" />} />
        <Route path="/setup-family" element={token ? <SetupFamily /> : <Navigate to="/" />} />
        <Route path="/join-family" element={token ? <JoinFamily /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;