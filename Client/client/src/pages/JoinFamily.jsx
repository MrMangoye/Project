import React, { useState } from "react";
import API from "../services/api.js";
import { useNavigate } from "react-router-dom";

export default function JoinFamily() {
  const [familyId, setFamilyId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // ✅ include token so backend knows which user is joining
      const res = await API.post(
        `/api/family/join/${familyId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );

      // ✅ Store the fresh user object directly from backend
      if (res.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      // (your original code still here, unchanged)
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.familyId = res.data.familyId || familyId; // fallback if backend only returns familyId
        localStorage.setItem("user", JSON.stringify(user));
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Join family error:", err);
      setError(err.response?.data?.error || "Failed to join family");
    }
  };

  return (
    <div>
      <h2>Join a Family</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Family ID"
          value={familyId}
          onChange={(e) => setFamilyId(e.target.value)}
          required
        />
        <button type="submit">Join</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}