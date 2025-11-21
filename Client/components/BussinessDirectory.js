import React, { useEffect, useState } from 'react';
import API from '../services/api';

export default function BusinessDirectory({ familyId }) {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get(`/family/${familyId}/members`).then(res => setMembers(res.data));
  }, [familyId]);

  const filtered = members.filter(m =>
    m.business?.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.business?.industry?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input placeholder="Search business or industry" onChange={e => setSearch(e.target.value)} />
      <ul>
        {filtered.map(m => (
          <li key={m._id}>
            <strong>{m.name}</strong> - {m.business?.name} ({m.business?.industry})
          </li>
        ))}
      </ul>
    </div>
  );
}