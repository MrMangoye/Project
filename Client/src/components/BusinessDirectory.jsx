import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Building, Search, MapPin, Phone, Mail, Briefcase } from 'lucide-react';

export default function BusinessDirectory({ familyId }) {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [familyId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try to get members with business data
      const res = await API.get(`/families/${familyId}/members`);
      
      // Handle different response formats
      const membersData = res.members || res.data || res || [];
      
      // Ensure it's an array
      const membersArray = Array.isArray(membersData) ? membersData : [];
      
      setMembers(membersArray);
      
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load business directory. Please try again.');
      setMembers([]); // Set empty array to prevent filter error
    } finally {
      setLoading(false);
    }
  };

  // FIX: Add safety check - use empty array if members is null/undefined
  const filtered = (members || []).filter(m => {
    // Check if m exists and has business property
    if (!m || !m.business) return false;
    
    const searchLower = search.toLowerCase();
    
    return (
      (m.business?.name || '').toLowerCase().includes(searchLower) ||
      (m.business?.industry || '').toLowerCase().includes(searchLower) ||
      (m.business?.description || '').toLowerCase().includes(searchLower) ||
      (m.name || '').toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business directory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchMembers}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  const businessMembers = filtered.filter(m => m.business?.name);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Family Business Directory</h2>
        <p className="text-gray-600">Discover businesses owned by family members</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Search business name, industry, or member..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Business Count */}
      <div className="text-gray-600">
        {businessMembers.length === 0 && search === '' ? (
          <p>No business information added yet. Add business details to member profiles.</p>
        ) : businessMembers.length === 0 ? (
          <p>No businesses match your search</p>
        ) : (
          <p>Found {businessMembers.length} business{businessMembers.length !== 1 ? 'es' : ''}</p>
        )}
      </div>

      {/* Business List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businessMembers.map(member => (
          <div key={member._id} className="bg-white rounded-xl shadow border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{member.business.name}</h3>
                {member.business.industry && (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mt-2">
                    {member.business.industry}
                  </span>
                )}
              </div>
              <Building size={24} className="text-blue-600" />
            </div>

            <p className="text-gray-600 mb-4">
              {member.business.description || 'Family-owned business'}
            </p>

            {/* Business Details */}
            <div className="space-y-3 mb-6">
              {member.business.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin size={16} className="mr-2" />
                  <span>{member.business.location}</span>
                </div>
              )}

              {member.business.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone size={16} className="mr-2" />
                  <span>{member.business.phone}</span>
                </div>
              )}

              {member.business.email && (
                <div className="flex items-center text-gray-600">
                  <Mail size={16} className="mr-2" />
                  <span>{member.business.email}</span>
                </div>
              )}

              {member.business.website && (
                <div className="flex items-center text-blue-600">
                  <Briefcase size={16} className="mr-2" />
                  <a 
                    href={member.business.website.startsWith('http') ? member.business.website : `https://${member.business.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {member.business.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>

            {/* Owner Info */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Owner</p>
              <p className="font-medium">{member.name}</p>
              {member.occupation && (
                <p className="text-sm text-gray-600">{member.occupation}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {businessMembers.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Building size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Businesses Found</h3>
          <p className="text-gray-600 mb-4">
            {search ? 'Try a different search term' : 'Add business information to member profiles'}
          </p>
          {!search && (
            <button 
              onClick={() => window.location.href = '/add-member'}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Building size={20} className="mr-2" />
              Add Business Information
            </button>
          )}
        </div>
      )}
    </div>
  );
}