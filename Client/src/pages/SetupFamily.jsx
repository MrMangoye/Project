// pages/SetupFamily.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api.js";
import { Home, Users, Globe, Shield } from "lucide-react";

export default function SetupFamily() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    motto: "",
    privacy: "private"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/family/create", form);

      // Update user with family info
      const user = JSON.parse(localStorage.getItem("user"));
      const updatedUser = { 
        ...user, 
        familyId: res.family._id,
        familyName: res.family.name
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Setup family error:", err);
      setError(err.error || "Failed to setup family");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Create Your Family</h1>
              <p className="text-gray-600 mt-2">Start building your family tree today</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Family Name *
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="The Smith Family"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about your family..."
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Family Motto (Optional)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Family First"
                  value={form.motto}
                  onChange={(e) => setForm({...form, motto: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Privacy Settings
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${form.privacy === 'private' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    onClick={() => setForm({...form, privacy: 'private'})}
                  >
                    <div className="flex flex-col items-center text-center">
                      <Shield className="mb-2 text-blue-600" size={24} />
                      <h3 className="font-bold">Private</h3>
                      <p className="text-sm text-gray-600">Only invited members</p>
                    </div>
                  </div>
                  
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${form.privacy === 'invite-only' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    onClick={() => setForm({...form, privacy: 'invite-only'})}
                  >
                    <div className="flex flex-col items-center text-center">
                      <Users className="mb-2 text-green-600" size={24} />
                      <h3 className="font-bold">Invite Only</h3>
                      <p className="text-sm text-gray-600">By invitation only</p>
                    </div>
                  </div>
                  
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${form.privacy === 'public' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    onClick={() => setForm({...form, privacy: 'public'})}
                  >
                    <div className="flex flex-col items-center text-center">
                      <Globe className="mb-2 text-purple-600" size={24} />
                      <h3 className="font-bold">Public</h3>
                      <p className="text-sm text-gray-600">Visible to everyone</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/join-family')}
                  className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                >
                  Join Existing Family Instead
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Family'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}