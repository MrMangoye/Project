import React, { useState } from "react";
import API from "../services/api.js";
import { useNavigate } from "react-router-dom";

export default function SetupFamily() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ include token so backend knows who is creating the family
      const familyRes = await API.post(
        "/api/family/create",
        { name, description },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );

      // ✅ Store the fresh user object directly from backend
      if (familyRes.data?.user) {
        localStorage.setItem("user", JSON.stringify(familyRes.data.user));
      }

      // ✅ Add the user as a member (still keeping your original code)
      const user = JSON.parse(localStorage.getItem("user"));
      await API.post(
        "/api/family/add-member",
        {
          name: user.name,
          familyId: familyRes.data.family._id, // use family._id from backend
          occupation: "Founder",
          relationships: {},
          business: {}
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );

      navigate("/dashboard");
    } catch (err) {
      console.error("Setup family error:", err);
      alert("Failed to setup family");
    }
  };

  return (
    <div>
      <h2>Create Your Family</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Family Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Create Family</button>
      </form>
    </div>
  );
}