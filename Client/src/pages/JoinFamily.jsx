// pages/JoinFamily.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api.js";
import { Link as LinkIcon, Search, Users } from "lucide-react";

export default function JoinFamily() {
  const [familyCode, setFamilyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await API.post(`/family/join/${familyCode}`);
      
      if (res.needsApproval) {
        setSuccess(res.message || "Request sent for approval. Waiting for admin approval.");
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        // Update user with family info
        const user = JSON.parse(localStorage.getItem("user"));
        const updatedUser = { 
          ...user, 
          familyId: res.familyId || res.family?._id,
          familyName: res.family?.name
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Navigate to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Join family error:", err);
      setError(err.error || "Failed to join family");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Join a Family</h1>
              <p className="text-gray-600 mt-2">Connect with your family members</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Family Code *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter family code"
                    value={familyCode}
                    onChange={(e) => setFamilyCode(e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Ask your family admin for the family code
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-2 flex items-center">
                  <Users className="mr-2" />
                  How to get the family code?
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Ask your family administrator</li>
                  <li>• Check your email invitation</li>
                  <li>• Family admin can generate code in settings</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/setup-family')}
                  className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                >
                  Create New Instead
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Join Family'}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don't have a family code?{" "}
                <button
                  onClick={() => navigate('/setup-family')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Create a new family
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}