import React, { useState, useEffect } from "react";
import API from "../services/api";
import { Users, UserPlus, Link2 } from "lucide-react";

export default function AddMember({ familyId, onMemberAdded }) {
  const [form, setForm] = useState({
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
  const [error, setError] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [familyId]);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/family/families/${familyId}`);
      setMembers(res.family?.members || []);
    } catch (err) {
      console.error("Failed to fetch members:", err);
      setError("Could not load family members");
    }
  };

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const relationships = {
        parents: form.parentId ? [form.parentId] : [],
        spouses: form.spouseId ? [form.spouseId] : [],
        siblings: form.siblingId ? [form.siblingId] : []
      };
      
      const business = {
        name: form.businessName,
        industry: form.industry,
        contact: form.contact
      };

      await API.post(
        "/family/add-member",
        { ...form, familyId, relationships, business }
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

      if (onMemberAdded) onMemberAdded();
    } catch (err) {
      console.error("Add member error:", err);
      setError(err.error || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center">
            <UserPlus className="mr-2" />
            Personal Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              name="name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="John Smith"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              name="dob"
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.dob}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              name="gender"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Occupation
            </label>
            <input
              name="occupation"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Software Engineer"
              value={form.occupation}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Relationships */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center">
            <Link2 className="mr-2" />
            Family Relationships
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent
            </label>
            <select
              name="parentId"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.parentId}
              onChange={handleChange}
            >
              <option value="">Select Parent</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spouse
            </label>
            <select
              name="spouseId"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.spouseId}
              onChange={handleChange}
            >
              <option value="">Select Spouse</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sibling
            </label>
            <select
              name="siblingId"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.siblingId}
              onChange={handleChange}
            >
              <option value="">Select Sibling</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center">
          <Users className="mr-2" />
          Business Information (Optional)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              name="businessName"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Smith & Co"
              value={form.businessName}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <input
              name="industry"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Technology"
              value={form.industry}
              onChange={handleChange}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Information
            </label>
            <input
              name="contact"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email or phone"
              value={form.contact}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => onMemberAdded && onMemberAdded()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Family Member"}
        </button>
      </div>
    </form>
  );
}