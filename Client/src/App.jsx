import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import JoinFamily from "./pages/JoinFamily";
import SetupFamily from "./pages/SetupFamily";
import ChooseFamily from "./pages/ChooseFamily"; // ✅ new import

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/join-family" element={token ? <JoinFamily /> : <Navigate to="/" />} />
        <Route path="/setup-family" element={token ? <SetupFamily /> : <Navigate to="/" />} />
        <Route path="/choose-family" element={token ? <ChooseFamily /> : <Navigate to="/" />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;