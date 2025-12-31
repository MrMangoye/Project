// pages/EnhancedRegister.jsx
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import API from '../services/api';
import {
  Users, Home, UserPlus, Link as LinkIcon,
  ChevronRight, CheckCircle, Shield, ArrowLeft
} from 'lucide-react';

function EnhancedRegister() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    familyChoice: '',
    familyName: '',
    familyCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (step === 1) {
        // Account creation
        const res = await API.post('/auth/register', {
          name: form.name,
          email: form.email,
          password: form.password
        });
        
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        
        setStep(2);
        setSuccess('Account created successfully!');
        
      } else if (step === 2) {
        // Family setup in registration
        if (!form.familyChoice) {
          setError('Please choose an option');
          return;
        }
        
        let res;
        if (form.familyChoice === 'create') {
          res = await API.post('/family/create', {
            name: form.familyName
          });
        } else if (form.familyChoice === 'join') {
          res = await API.post(`/family/join/${form.familyCode}`);
        }
        
        if (res.needsApproval) {
          setSuccess(res.message || 'Request sent for approval');
          setTimeout(() => navigate(from), 2000);
        } else {
          // Update user with family info
          const user = JSON.parse(localStorage.getItem('user'));
          const updatedUser = { 
            ...user, 
            familyId: res.family?._id || res.familyId,
            familyName: form.familyName || res.family?.name
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          if (res.token) {
            localStorage.setItem('token', res.token);
          }
          
          setStep(3);
          setSuccess('Family setup completed!');
        }
        
      } else if (step === 3) {
        // Final step - go to dashboard
        navigate(from);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={`flex items-center ${step >= stepNum ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= stepNum ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                    {stepNum}
                  </div>
                  <span className="ml-2 font-medium hidden sm:inline">
                    {stepNum === 1 ? 'Account' : stepNum === 2 ? 'Family' : 'Complete'}
                  </span>
                </div>
                {stepNum < 3 && <div className="w-8 sm:w-16 h-0.5 bg-gray-300 mx-2 sm:mx-4"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-2/5 bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white hidden md:block">
              <div className="h-full flex flex-col justify-center">
                <h1 className="text-3xl font-bold mb-6">Join Your Family Network</h1>
                <p className="mb-8 opacity-90">
                  Connect with your family members, preserve your history, and build your family tree together.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-center">
                    <Users className="mr-4" size={24} />
                    <div>
                      <h3 className="font-bold">Family Tree</h3>
                      <p className="text-sm opacity-90">Visualize your family relationships</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Shield className="mr-4" size={24} />
                    <div>
                      <h3 className="font-bold">Private & Secure</h3>
                      <p className="text-sm opacity-90">Your family data is protected</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <UserPlus className="mr-4" size={24} />
                    <div>
                      <h3 className="font-bold">Collaborative</h3>
                      <p className="text-sm opacity-90">Add members together</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-3/5 p-6 sm:p-8">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  Back
                </button>
              )}
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {step === 1 && 'Create Your Account'}
                {step === 2 && 'Connect to Family'}
                {step === 3 && 'Setup Complete!'}
              </h2>
              
              <p className="text-gray-600 mb-8">
                {step === 1 && 'Start your family journey with us'}
                {step === 2 && 'Create new or join existing family'}
                {step === 3 && 'Your family network is ready'}
              </p>
              
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
              
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Smith"
                        value={form.name}
                        onChange={(e) => setForm({...form, name: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => setForm({...form, password: e.target.value})}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Minimum 6 characters
                      </p>
                    </div>
                  </div>
                )}
                
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${form.familyChoice === 'create' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                        onClick={() => setForm({...form, familyChoice: 'create'})}
                      >
                        <div className="flex flex-col items-center text-center">
                          <Home className={`mb-3 ${form.familyChoice === 'create' ? 'text-blue-600' : 'text-gray-400'}`} size={32} />
                          <h3 className="font-bold text-lg mb-2">Create New Family</h3>
                          <p className="text-sm text-gray-600">
                            Start a new family tree. You'll be the admin.
                          </p>
                        </div>
                      </div>
                      
                      <div
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${form.familyChoice === 'join' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                        onClick={() => setForm({...form, familyChoice: 'join'})}
                      >
                        <div className="flex flex-col items-center text-center">
                          <LinkIcon className={`mb-3 ${form.familyChoice === 'join' ? 'text-blue-600' : 'text-gray-400'}`} size={32} />
                          <h3 className="font-bold text-lg mb-2">Join Existing Family</h3>
                          <p className="text-sm text-gray-600">
                            Join a family tree using an invitation code.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {form.familyChoice === 'create' && (
                      <div className="animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Family Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="The Smith Family"
                          value={form.familyName}
                          onChange={(e) => setForm({...form, familyName: e.target.value})}
                        />
                      </div>
                    )}
                    
                    {form.familyChoice === 'join' && (
                      <div className="animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Family Code *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter family code"
                          value={form.familyCode}
                          onChange={(e) => setForm({...form, familyCode: e.target.value})}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Ask your family admin for the family code
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {step === 3 && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="text-green-600" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Welcome to the Family!</h3>
                    <p className="text-gray-600 mb-8">
                      Your account is ready. You can now start building your family tree.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="font-bold">Next Steps:</p>
                        <ul className="text-sm text-gray-600 mt-2 space-y-1">
                          <li>• Add family members</li>
                          <li>• Define relationships</li>
                          <li>• Upload photos</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="font-bold">Invite Others:</p>
                        <p className="text-sm text-gray-600 mt-2">
                          Share your family code to invite relatives
                        </p>
                      </div>
                      
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="font-bold">Explore Features:</p>
                        <p className="text-sm text-gray-600 mt-2">
                          Check out the family tree and analytics
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        {step === 1 && 'Continue to Family Setup'}
                        {step === 2 && (form.familyChoice === 'create' ? 'Create Family' : 'Join Family')}
                        {step === 3 && 'Go to Dashboard'}
                        <ChevronRight className="ml-2" size={20} />
                      </>
                    )}
                  </button>
                  
                  {step === 1 && (
                    <p className="text-center text-gray-600 mt-4">
                      Already have an account?{' '}
                      <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
                        Sign in here
                      </Link>
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedRegister;