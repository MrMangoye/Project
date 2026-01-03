import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Home, Link as LinkIcon } from "lucide-react";

export default function ChooseFamily() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome to Family Tree
              </h1>
              <p className="text-gray-600 mt-2">
                Connect with your family members and build your family tree
              </p>
            </div>

            <div className="space-y-6">
              <div
                onClick={() => navigate("/setup-family")}
                className="p-6 border-2 border-blue-500 rounded-xl cursor-pointer transition-all hover:bg-blue-50 hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <Home className="mb-3 text-blue-600" size={32} />
                  <h3 className="font-bold text-lg mb-2">Create New Family</h3>
                  <p className="text-gray-600">
                    Start a new family tree. You'll be the admin.
                  </p>
                  <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Get Started
                  </button>
                </div>
              </div>

              <div
                onClick={() => navigate("/join-family")}
                className="p-6 border-2 border-green-500 rounded-xl cursor-pointer transition-all hover:bg-green-50 hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <LinkIcon className="mb-3 text-green-600" size={32} />
                  <h3 className="font-bold text-lg mb-2">Join Existing Family</h3>
                  <p className="text-gray-600">
                    Join a family tree using an invitation code.
                  </p>
                  <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                    Join Now
                  </button>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-gray-500 mb-2">
                  Already have a family? Ask your family admin to add you directly
                </p>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}