import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Users, User, GitBranch, Phone, Mail, MapPin, Calendar, ChevronRight, Search } from 'lucide-react';

export default function MembersListView({ familyId, onMemberSelect }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMember, setExpandedMember] = useState(null);

  useEffect(() => {
    if (familyId) {
      fetchMembers();
    }
  }, [familyId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await API.get(`/families/${familyId}/tree-with-relations`);
      } catch (err) {
        console.log('Primary endpoint failed, trying alternative...', err);
        res = await API.get(`/api/family/families/${familyId}/tree`);
      }
      
      const membersData = res.members || res.data?.members || res.data || res || [];
      setMembers(Array.isArray(membersData) ? membersData : []);
      
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRelationshipLabel = (member) => {
    const labels = [];
    if (member.calculatedRelationships?.parents?.length > 0) labels.push("Child");
    if (member.calculatedRelationships?.children?.length > 0) labels.push("Parent");
    if (member.calculatedRelationships?.spouses?.length > 0) labels.push("Spouse");
    if (member.calculatedRelationships?.siblings?.length > 0) labels.push("Sibling");
    if (member.isSelf) labels.push("You");
    return labels.join(", ") || "Family Member";
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getRelationshipLabel(member).toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (memberId) => {
    setExpandedMember(expandedMember === memberId ? null : memberId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading members...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Family Members</h2>
            <p className="text-gray-600">View and manage all family members</p>
          </div>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <Users className="text-blue-600" size={24} />
            <span className="font-medium">{members.length} members</span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search members by name, occupation, or relationship..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {filteredMembers.map(member => (
            <div key={member._id} className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => toggleExpand(member._id)}>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    {member.profilePicture ? (
                      <img src={member.profilePicture} alt={member.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="text-blue-600" size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{member.name}</h3>
                    <div className="flex items-center text-gray-600 text-sm flex-wrap gap-2">
                      {member.occupation && (
                        <span className="bg-gray-100 px-2 py-1 rounded">{member.occupation}</span>
                      )}
                      {member.dob && (
                        <span>{calculateAge(member.dob)} years</span>
                      )}
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {getRelationshipLabel(member)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {onMemberSelect && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMemberSelect(member);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      View Profile
                    </button>
                  )}
                  <ChevronRight className={`transform transition-transform ${expandedMember === member._id ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Expanded Details */}
              {expandedMember === member._id && (
                <div className="px-4 pb-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold mb-2">Contact Information</h4>
                      <div className="space-y-2">
                        {member.email && (
                          <div className="flex items-center">
                            <Mail size={16} className="mr-2 text-gray-400" />
                            <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                              {member.email}
                            </a>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center">
                            <Phone size={16} className="mr-2 text-gray-400" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                        {member.address?.city && (
                          <div className="flex items-center">
                            <MapPin size={16} className="mr-2 text-gray-400" />
                            <span>{member.address.city}, {member.address.country}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2">Relationships</h4>
                      <div className="flex flex-wrap gap-2">
                        {member.calculatedRelationships?.parents?.length > 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                            {member.calculatedRelationships.parents.length} Parent(s)
                          </span>
                        )}
                        {member.calculatedRelationships?.children?.length > 0 && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                            {member.calculatedRelationships.children.length} Child(ren)
                          </span>
                        )}
                        {member.calculatedRelationships?.spouses?.length > 0 && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                            {member.calculatedRelationships.spouses.length} Spouse(s)
                          </span>
                        )}
                        {member.calculatedRelationships?.siblings?.length > 0 && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">
                            {member.calculatedRelationships.siblings.length} Sibling(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {member.dob && (
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Date of Birth</p>
                          <p className="font-medium">{new Date(member.dob).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                    {member.gender && (
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-medium capitalize">{member.gender}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {searchTerm ? 'No members found' : 'No members yet'}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try a different search term' : 'Add your first family member to get started'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
