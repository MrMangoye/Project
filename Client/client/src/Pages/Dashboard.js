import React, { useEffect, useState } from 'react';
import AddMember from '../components/AddMember';
import TreeView from '../components/TreeView';
import BusinessDirectory from '../components/BusinessDirectory';
import API from '../services/api';

export default function Dashboard() {
  const [family, setFamily] = useState(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchFamily = async () => {
      const res = await API.post('/family/create', { name: 'My Family', userId });
      setFamily(res.data);
    };
    fetchFamily();
  }, [userId]);

  return family ? (
    <div>
      <h1>Welcome to Your Family Tree</h1>
      <AddMember familyId={family._id} />
      <TreeView familyId={family._id} />
      <BusinessDirectory familyId={family._id} />
    </div>
  ) : <p>Loading...</p>;
}