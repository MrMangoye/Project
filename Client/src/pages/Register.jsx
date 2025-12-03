import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from "../services/api.js";
import AddMember from "../components/AddMember";   // ✅ import AddMember

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false); // ✅ new state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/api/auth/register', form);

      if (res.data?.token && res.data?.user?._id) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        if (res.data.needsFamily) {
          navigate('/choose-family');
        } else {
          if (!res.data.user.familyId) {
            navigate('/setup-family');
          } else {
            setShowAddMember(true);   // ✅ show AddMember after register
            navigate('/dashboard');
          }
        }
      } else {
        setError(res.data?.error || res.data?.message || 'Unexpected response from server');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Create an Account</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Already have an account? <Link to="/">Login here</Link></p>

      {/* ✅ AddMember form appears after register */}
      {showAddMember && (
        <div>
          <h3>Add a family member</h3>
          <AddMember familyId={JSON.parse(localStorage.getItem("user")).familyId} />
        </div>
      )}
    </div>
  );
}