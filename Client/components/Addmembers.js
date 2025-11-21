import React, { useState } from 'react';
import API from '../services/api';

export default function AddMember({ familyId }) {
  const [form, setForm] = useState({
    name: '', dob: '', gender: '', occupation: '',
    parentId: '', spouseId: '',
    businessName: '', industry: '', contact: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const relationships = {
      parent: form.parentId ? [form.parentId] : [],
      spouse: form.spouseId ? [form.spouseId] : []
    };
    const business = {
      name: form.businessName,
      industry: form.industry,
      contact: form.contact
    };
    await API.post('/family/add-member', {
      name: form.name, dob: form.dob, gender: form.gender,
      occupation: form.occupation, familyId, relationships, business
    });
    alert('Member added');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="dob" type="date" onChange={handleChange} />
      <select name="gender" onChange={handleChange}>
        <option value="">Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <input name="occupation" placeholder="Occupation" onChange={handleChange} />
      <input name="parentId" placeholder="Parent ID" onChange={handleChange} />
      <input name="spouseId" placeholder="Spouse ID" onChange={handleChange} />
      <input name="businessName" placeholder="Business Name" onChange={handleChange} />
      <input name="industry" placeholder="Industry" onChange={handleChange} />
      <input name="contact" placeholder="Contact Info" onChange={handleChange} />
      <button type="submit">Add Member</button>
    </form>
  );
}