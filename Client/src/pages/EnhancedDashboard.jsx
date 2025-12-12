import React, { useState, useEffect, useCallback } from "react";
import API from "../services/api";
import { 
  Users, Family, Heart, Baby, UserPlus, Network, 
  GitBranch, GitMerge, GitPullRequest, Share2, Search,
  Plus, Bell, Download, Filter, Calendar, BookOpen,
  TrendingUp, BarChart3, Home, Car, DollarSign, Pill,
  Activity, Stethoscope, AlertCircle, CheckCircle
} from "lucide-react";

import AddMember from "../components/AddMember";
import FamilyTree from "../components/FamilyTree";
import BusinessDirectory from "../components/BusinessDirectory";
import EventsCalendar from "../components/EventsCalendar";
import FamilyStories from "../components/FamilyStories";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import FamilyFinance from "../components/FamilyFinance";
import FamilyHealth from "../components/FamilyHealth";

function EnhancedDashboard() {
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [relations, setRelations] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchFamily = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      let user = null;
      
      try {
        user = JSON.parse(userStr);
      } catch {}

      if (!token || !user?.familyId) {
        setError("Please complete your family setup first.");
        setLoading(false);
        return;
      }

      const res = await API.get(`/family/families/${user.familyId}`);
      setFamily(res.family);
      
      const relationsRes = await API.get(`/family/families/${user.familyId}/tree-with-relations`);
      if (relationsRes.members && relationsRes.members.length > 0) {
        const userMember = relationsRes.members.find(m => m.isSelf);
        if (userMember) {
          setSelectedMember(userMember);
          calculateRelations(userMember, relationsRes.members);
        }
      }

      setError("");
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.error || "Failed to load family data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFamily();
  }, [fetchFamily]);

  const calculateRelations = (member, allMembers) => {
    const relationsList = [];
    
    if (member.calculatedRelationships?.parents?.length > 0) {
      member.calculatedRelationships.parents.forEach(parentId => {
        const parent = allMembers.find(m => m._id === parentId);
        if (parent) {
          relationsList.push({
            person: parent,
            relation: parent.gender === 'male' ? 'Father' : 'Mother',
            type: 'parent',
            closeness: 1
          });
        }
      });
    }
    
    if (member.calculatedRelationships?.children?.length > 0) {
      member.calculatedRelationships.children.forEach(childId => {
        const child = allMembers.find(m => m._id === childId);
        if (child) {
          relationsList.push({
            person: child,
            relation: child.gender === 'male' ? 'Son' : 'Daughter',
            type: 'child',
            closeness: 1
          });
        }
      });
    }
    
    if (member.calculatedRelationships?.siblings?.length > 0) {
      member.calculatedRelationships.siblings.forEach(siblingId => {
        const sibling = allMembers.find(m => m._id === siblingId);
        if (sibling) {
          relationsList.push({
            person: sibling,
            relation: sibling.gender === 'male' ? 'Brother' : 'Sister',
            type: 'sibling',
            closeness: 1
          });
        }
      });
    }
    
    if (member.calculatedRelationships?.spouses?.length > 0) {
      member.calculatedRelationships.spouses.forEach(spouseId => {
        const spouse = allMembers.find(m => m._id === spouseId);
        if (spouse) {
          relationsList.push({
            person: spouse,
            relation: spouse.gender === 'male' ? 'Husband' : 'Wife',
            type: 'spouse',
            closeness: 1
          });
        }
      });
    }
    
    setRelations(relationsList);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your family dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Family Tree</h1>
          <p className="text-gray-600 mb-6">You haven't created or joined a family yet.</p>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.href = '/setup-family'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Create Family
            </button>
            <button 
              onClick={() => window.location.href = '/join-family'}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Join Family
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{family.name}</h1>
              <p className="text-gray-600">{family.description}</p>
              {family.motto && (
                <p className="text-gray-500 italic mt-1">"{family.motto}"</p>
              )}
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={20} className="mr-2" />
                Add Member
              </button>
              
              {notifications.length > 0 && (
                <button className="relative">
                  <Bell size={24} className="text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </button>
              )}
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="flex items-center">
                <Users className="text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Members</p>
                  <p className="text-xl font-bold">{family.memberCount || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="flex items-center">
                <Family className="text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Generations</p>
                  <p className="text-xl font-bold">3</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="flex items-center">
                <Heart className="text-red-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Couples</p>
                  <p className="text-xl font-bold">4</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="flex items-center">
                <Baby className="text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Children</p>
                  <p className="text-xl font-bold">8</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "tree", label: "Family Tree", icon: Users },
              { id: "business", label: "Business", icon: TrendingUp },
              { id: "finance", label: "Finance", icon: DollarSign },
              { id: "health", label: "Health", icon: Stethoscope },
              { id: "events", label: "Events", icon: Calendar },
              { id: "stories", label: "Stories", icon: BookOpen },
              { id: "analytics", label: "Analytics", icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <tab.icon size={18} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {activeTab.replace("-", " ")}
          </h2>
          
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <Download size={18} className="mr-2" />
              Export
            </button>
            
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <Share2 size={18} className="mr-2" />
              Share
            </button>
            
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <Filter size={18} className="mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Relationship Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold mb-4">Family Tree Preview</h3>
                    <div className="h-64 bg-white rounded-lg p-4">
                      {/* Simplified tree visualization */}
                      <div className="flex flex-col items-center">
                        <div className="flex space-x-8 mb-8">
                          <div className="bg-blue-100 p-3 rounded-lg">👴 Grandfather</div>
                          <div className="bg-pink-100 p-3 rounded-lg">👵 Grandmother</div>
                        </div>
                        <div className="h-8 w-0.5 bg-gray-300 mb-4"></div>
                        <div className="flex space-x-4 mb-8">
                          <div className="bg-blue-200 p-3 rounded-lg border-2 border-blue-300">👨 Father</div>
                          <div className="bg-pink-200 p-3 rounded-lg border-2 border-pink-300">👩 Mother</div>
                        </div>
                        <div className="h-8 w-0.5 bg-gray-300 mb-4"></div>
                        <div className="flex space-x-2">
                          <div className="bg-white p-2 rounded shadow">👦 You</div>
                          <div className="bg-white p-2 rounded shadow">👧 Sister</div>
                          <div className="bg-white p-2 rounded shadow">👶 Brother</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-white p-6 rounded-xl shadow border">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                      <GitBranch className="mr-2 text-purple-600" />
                      Your Relationships
                    </h3>
                    
                    {relations.length > 0 ? (
                      <div className="space-y-3">
                        {relations.slice(0, 4).map((rel, idx) => (
                          <div key={idx} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                              rel.type === 'parent' ? 'bg-blue-100 text-blue-600' :
                              rel.type === 'child' ? 'bg-green-100 text-green-600' :
                              rel.type === 'sibling' ? 'bg-purple-100 text-purple-600' :
                              'bg-pink-100 text-pink-600'
                            }`}>
                              {rel.relation.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{rel.person?.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-600">{rel.relation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <GitPullRequest size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500">No relationships identified yet</p>
                        <p className="text-sm text-gray-400 mt-1">Add family members to see relationships</p>
                      </div>
                    )}
                    
                    <button className="w-full mt-4 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-500 hover:text-blue-500">
                      + Add Relationship
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-bold mb-4">Recent Family Activity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-bold mb-3">Upcoming Events</h4>
                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <Calendar className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Birthday Party</p>
                          <p className="text-sm text-gray-600">Tomorrow at 4:00 PM</p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <Calendar className="text-green-600 mr-3" />
                        <div>
                          <p className="font-medium">Family Reunion</p>
                          <p className="text-sm text-gray-600">Next Saturday</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-bold mb-3">New Additions</h4>
                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                        <UserPlus className="text-purple-600 mr-3" />
                        <div>
                          <p className="font-medium">Sarah joined the family</p>
                          <p className="text-sm text-gray-600">Added as daughter of John</p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                        <GitMerge className="text-orange-600 mr-3" />
                        <div>
                          <p className="font-medium">Relationship updated</p>
                          <p className="text-sm text-gray-600">Mark identified as brother of Lisa</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "tree" && <FamilyTree familyId={family._id} />}
          {activeTab === "business" && <BusinessDirectory familyId={family._id} />}
          {activeTab === "finance" && <FamilyFinance familyId={family._id} />}
          {activeTab === "health" && <FamilyHealth familyId={family._id} />}
          {activeTab === "events" && <EventsCalendar familyId={family._id} />}
          {activeTab === "stories" && <FamilyStories familyId={family._id} />}
          {activeTab === "analytics" && <AnalyticsDashboard familyId={family._id} />}
        </div>
      </main>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add Family Member</h2>
                <button
                  onClick={() => setShowAddMember(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <AddMember 
                familyId={family._id} 
                onMemberAdded={() => {
                  setShowAddMember(false);
                  fetchFamily();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedDashboard;