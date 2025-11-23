import React from 'react';

export default function MemberProfile({ member }) {
  return (
    <div className="card">
      <h2>{member.name}</h2>
      <p>Occupation: {member.occupation}</p>
      <p>Business: {member.business?.name}</p>
      <p>Industry: {member.business?.industry}</p>
      <p>Contact: {member.business?.contact}</p>
    </div>
  );
}