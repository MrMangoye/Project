import React, { useState, useEffect } from "react";
import API from "../services/api";

export default function AddMember({ familyId, onMemberAdded }) {
  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "",
    occupation: "",
    parentId: "",
    spouseId: "",
    siblingId: "",   // ✅ new field
    businessName: "",
    industry: "",
    contact: ""
  });
  const [error, setError] = useState("");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    API.get(`/api/family/families/${familyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setMembers(res.data.members || []))
      .catch(err => {
        console.error("Failed to fetch members:", err);
        setError("Could not load family members");
      });
  }, [familyId]);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const relationships = {
        parent: form.parentId ? [form.parentId] : [],
        spouse: form.spouseId ? [form.spouseId] : [],
        sibling: form.siblingId ? [form.siblingId] : []   // ✅ include sibling
      };
      const business = {
        name: form.businessName,
        industry: form.industry,
        contact: form.contact
      };

      await API.post(
        "/api/family/add-member",
        { ...form, familyId, relationships, business },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setForm({
        name: "",
        dob: "",
        gender: "",
        occupation: "",
        parentId: "",
        spouseId: "",
        siblingId: "",
        businessName: "",
        industry: "",
        contact: ""
      });
      setError("");

      if (onMemberAdded) onMemberAdded();
      alert("Member added");
    } catch (err) {
      console.error("Add member error:", err);
      setError("Failed to add member");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
      <input name="dob" type="date" value={form.dob} onChange={handleChange} />
      <select name="gender" value={form.gender} onChange={handleChange}>
        <option value="">Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <input name="occupation" placeholder="Occupation" value={form.occupation} onChange={handleChange} />

      {/* ✅ Parent dropdown */}
      <select name="parentId" value={form.parentId} onChange={handleChange}>
        <option value="">Select Parent</option>
        {members.map(m => (
          <option key={m._id} value={m._id}>{m.name}</option>
        ))}
      </select>

      {/* ✅ Spouse dropdown */}
      <select name="spouseId" value={form.spouseId} onChange={handleChange}>
        <option value="">Select Spouse</option>
        {members.map(m => (
          <option key={m._id} value={m._id}>{m.name}</option>
        ))}
      </select>

      {/* ✅ Sibling dropdown */}
      <select name="siblingId" value={form.siblingId} onChange={handleChange}>
        <option value="">Select Sibling</option>
        {members.map(m => (
          <option key={m._id} value={m._id}>{m.name}</option>
        ))}
      </select>

      <input name="businessName" placeholder="Business Name" value={form.businessName} onChange={handleChange} />
      <input name="industry" placeholder="Industry" value={form.industry} onChange={handleChange} />
      <input name="contact" placeholder="Contact Info" value={form.contact} onChange={handleChange} />
      <button type="submit">Add Member</button>
    </form>
  );
}