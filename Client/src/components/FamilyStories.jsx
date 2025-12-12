import React, { useState, useEffect, useCallback } from "react";
import API from "../services/api.js";
import { 
  BookOpen, Heart, MessageCircle, Share2, Calendar, 
  MapPin, User, Plus, Image, Film, X, Search, 
  Filter, Edit, Trash2, Bookmark, Star, ExternalLink,
  ChevronDown, ChevronUp, ThumbsUp, Eye, Download,
  MoreVertical, Clock, Tag, Users, Globe, Lock
} from "lucide-react";
import { format } from "date-fns";

const FamilyStories = ({ familyId, currentUser }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStory, setShowAddStory] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [editingStory, setEditingStory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    year: "all",
    sortBy: "newest"
  });
  const [categories, setCategories] = useState([]);
  const [years, setYears] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likeLoading, setLikeLoading] = useState(null);

  const [newStory, setNewStory] = useState({
    title: "",
    content: "",
    type: "memory",
    year: new Date().getFullYear(),
    location: "",
    tags: [],
    relatedPersons: [],
    privacy: "family",
    images: [],
    videos: []
  });

  // Story types with icons and colors
  const storyTypes = [
    { id: "memory", label: "Memories", icon: "📖", color: "blue" },
    { id: "recipe", label: "Recipes", icon: "🍳", color: "green" },
    { id: "history", label: "History", icon: "📜", color: "purple" },
    { id: "achievement", label: "Achievements", icon: "🏆", color: "yellow" },
    { id: "tradition", label: "Traditions", icon: "🎉", color: "pink" },
    { id: "travel", label: "Travel", icon: "✈️", color: "indigo" },
    { id: "humor", label: "Funny Stories", icon: "😂", color: "orange" },
    { id: "advice", label: "Life Advice", icon: "💡", color: "teal" }
  ];

  // Privacy options
  const privacyOptions = [
    { id: "public", label: "Public", icon: <Globe size={16} /> },
    { id: "family", label: "Family Only", icon: <Users size={16} /> },
    { id: "private", label: "Private", icon: <Lock size={16} /> }
  ];

  // Fetch stories
  const fetchStories = useCallback(async () => {
    if (!familyId) return;
    
    try {
      setLoading(true);
      const response = await API.get(`/api/family/families/${familyId}/stories`);
      
      if (response.data && response.data.success) {
        setStories(response.data.stories || []);
        
        // Extract unique categories and years for filters
        const types = [...new Set(response.data.stories.map(s => s.type))];
        const storyYears = [...new Set(response.data.stories.map(s => s.year).filter(y => y))].sort((a, b) => b - a);
        
        setCategories(types);
        setYears(storyYears);
      }
    } catch (error) {
      console.error("Failed to fetch stories:", error);
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Handle adding a new story
  const handleAddStory = async () => {
    try {
      const response = await API.post("/api/family/stories", {
        ...newStory,
        familyId
      });

      if (response.data.success) {
        setStories([response.data.story, ...stories]);
        setShowAddStory(false);
        resetNewStory();
      }
    } catch (error) {
      console.error("Failed to add story:", error);
      alert("Failed to add story. Please try again.");
    }
  };

  // Handle updating a story
  const handleUpdateStory = async () => {
    try {
      const response = await API.put(`/api/family/stories/${editingStory._id}`, newStory);

      if (response.data.success) {
        setStories(stories.map(story => 
          story._id === editingStory._id ? response.data.story : story
        ));
        setSelectedStory(response.data.story);
        setEditingStory(null);
        resetNewStory();
      }
    } catch (error) {
      console.error("Failed to update story:", error);
      alert("Failed to update story. Please try again.");
    }
  };

  // Handle deleting a story
  const handleDeleteStory = async (storyId) => {
    if (!window.confirm("Are you sure you want to delete this story? This action cannot be undone.")) {
      return;
    }

    try {
      await API.delete(`/api/family/stories/${storyId}`);
      setStories(stories.filter(story => story._id !== storyId));
      setSelectedStory(null);
    } catch (error) {
      console.error("Failed to delete story:", error);
      alert("Failed to delete story. Please try again.");
    }
  };

  // Handle liking a story
  const handleLikeStory = async (storyId) => {
    try {
      setLikeLoading(storyId);
      const response = await API.post(`/api/family/stories/${storyId}/like`);

      if (response.data.success) {
        setStories(stories.map(story => 
          story._id === storyId ? response.data.story : story
        ));
        
        if (selectedStory && selectedStory._id === storyId) {
          setSelectedStory(response.data.story);
        }
      }
    } catch (error) {
      console.error("Failed to like story:", error);
    } finally {
      setLikeLoading(null);
    }
  };

  // Handle adding a comment
  const handleAddComment = async (storyId) => {
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await API.post(`/api/family/stories/${storyId}/comments`, {
        content: commentText
      });

      if (response.data.success) {
        setStories(stories.map(story => 
          story._id === storyId ? response.data.story : story
        ));
        
        if (selectedStory && selectedStory._id === storyId) {
          setSelectedStory(response.data.story);
        }
        
        setCommentText("");
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Reset new story form
  const resetNewStory = () => {
    setNewStory({
      title: "",
      content: "",
      type: "memory",
      year: new Date().getFullYear(),
      location: "",
      tags: [],
      relatedPersons: [],
      privacy: "family",
      images: [],
      videos: []
    });
  };

  // Initialize edit form with story data
  const initEditStory = (story) => {
    setEditingStory(story);
    setNewStory({
      title: story.title,
      content: story.content,
      type: story.type,
      year: story.year || new Date().getFullYear(),
      location: story.location || "",
      tags: story.tags || [],
      relatedPersons: story.relatedPersons || [],
      privacy: story.privacy || "family",
      images: story.images || [],
      videos: story.videos || []
    });
  };

  // Filter and sort stories
  const filteredStories = stories
    .filter(story => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          story.title.toLowerCase().includes(searchLower) ||
          story.content.toLowerCase().includes(searchLower) ||
          story.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .filter(story => {
      // Type filter
      if (filters.type !== "all") {
        return story.type === filters.type;
      }
      return true;
    })
    .filter(story => {
      // Year filter
      if (filters.year !== "all") {
        return story.year === parseInt(filters.year);
      }
      return true;
    })
    .sort((a, b) => {
      // Sort filter
      switch (filters.sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "most_liked":
          return (b.likes?.length || 0) - (a.likes?.length || 0);
        case "most_commented":
          return (b.comments?.length || 0) - (a.comments?.length || 0);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  // Get story type config
  const getStoryTypeConfig = (type) => {
    return storyTypes.find(t => t.id === type) || storyTypes[0];
  };

  // Get privacy config
  const getPrivacyConfig = (privacy) => {
    return privacyOptions.find(p => p.id === privacy) || privacyOptions[1];
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "Unknown date";
    }
  };

  // Handle tag input
  const handleTagInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!newStory.tags.includes(newTag)) {
        setNewStory({
          ...newStory,
          tags: [...newStory.tags, newTag]
        });
      }
      e.target.value = "";
    }
  };

  // Handle remove tag
  const handleRemoveTag = (tagToRemove) => {
    setNewStory({
      ...newStory,
      tags: newStory.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Calculate stats
  const stats = {
    total: stories.length,
    byType: storyTypes.reduce((acc, type) => {
      acc[type.id] = stories.filter(s => s.type === type.id).length;
      return acc;
    }, {}),
    recent: stories.filter(s => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(s.createdAt) > weekAgo;
    }).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading family stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <BookOpen className="mr-3" size={32} />
              Family Stories & Memories
            </h1>
            <p className="text-gray-600 mt-2">
              Preserve and share your family's precious moments, recipes, traditions, and history
            </p>
          </div>
          
          <button
            onClick={() => {
              resetNewStory();
              setEditingStory(null);
              setShowAddStory(true);
            }}
            className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center shadow-md hover:shadow-lg"
          >
            <Plus className="mr-2" size={20} />
            Share a Story
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-sm text-gray-600">Total Stories</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.recent}</div>
            <p className="text-sm text-gray-600">Last 7 Days</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats.byType.memory || 0}
            </div>
            <p className="text-sm text-gray-600">Memories</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {stories.reduce((acc, story) => acc + (story.likes?.length || 0), 0)}
            </div>
            <p className="text-sm text-gray-600">Total Likes</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search stories by title, content, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="mr-2" size={20} />
            Filters
            {showFilters ? <ChevronUp className="ml-2" size={16} /> : <ChevronDown className="ml-2" size={16} />}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  {storyTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most_liked">Most Liked</option>
                  <option value="most_commented">Most Commented</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Story Grid */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <BookOpen className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            {searchTerm || filters.type !== "all" || filters.year !== "all" 
              ? "No matching stories found"
              : "No stories yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filters.type !== "all" || filters.year !== "all"
              ? "Try adjusting your filters or search term"
              : "Be the first to share a family story!"}
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilters({ type: "all", year: "all", sortBy: "newest" });
              setShowAddStory(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90"
          >
            Share Your First Story
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map(story => {
            const typeConfig = getStoryTypeConfig(story.type);
            const privacyConfig = getPrivacyConfig(story.privacy);
            
            return (
              <div 
                key={story._id} 
                className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden group"
              >
                {/* Story Header */}
                <div className={`px-4 py-3 bg-${typeConfig.color}-50 border-b border-${typeConfig.color}-100 flex items-center justify-between`}>
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{typeConfig.icon}</span>
                    <span className={`font-medium text-${typeConfig.color}-700`}>
                      {typeConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {privacyConfig.icon}
                    <span className="text-xs text-gray-600">{privacyConfig.label}</span>
                  </div>
                </div>

                <div className="p-5">
                  {/* Story Image */}
                  {story.images?.[0] && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={story.images[0]}
                        alt={story.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Title & Excerpt */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {story.content}
                  </p>

                  {/* Metadata */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-2" />
                      {story.year && <span className="mr-4">{story.year}</span>}
                      <Clock size={14} className="mr-2" />
                      {formatDate(story.createdAt)}
                    </div>
                    
                    {story.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin size={14} className="mr-2" />
                        {story.location}
                      </div>
                    )}

                    {/* Tags */}
                    {story.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {story.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                        {story.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{story.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLikeStory(story._id)}
                        disabled={likeLoading === story._id}
                        className={`flex items-center ${
                          story.likes?.includes(currentUser?._id)
                            ? 'text-red-600'
                            : 'text-gray-600 hover:text-red-600'
                        }`}
                      >
                        <Heart 
                          size={18} 
                          className="mr-1" 
                          fill={story.likes?.includes(currentUser?._id) ? 'currentColor' : 'none'}
                        />
                        <span>{story.likes?.length || 0}</span>
                      </button>
                      
                      <button
                        onClick={() => setSelectedStory(story)}
                        className="flex items-center text-gray-600 hover:text-blue-600"
                      >
                        <MessageCircle size={18} className="mr-1" />
                        <span>{story.comments?.length || 0}</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedStory(story)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Read More
                      </button>
                      
                      {/* Story Actions Menu */}
                      {(story.author?._id === currentUser?._id || currentUser?.role === "admin") && (
                        <div className="relative">
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <MoreVertical size={20} />
                          </button>
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-10 hidden group-hover:block hover:block">
                            <button
                              onClick={() => initEditStory(story)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                            >
                              <Edit size={14} className="mr-2" />
                              Edit Story
                            </button>
                            <button
                              onClick={() => handleDeleteStory(story._id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete Story
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center mt-4 pt-4 border-t">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      {story.author?.profilePicture ? (
                        <img src={story.author.profilePicture} alt={story.author.name} className="w-full h-full rounded-full" />
                      ) : (
                        <User size={14} className="text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{story.author?.name}</p>
                      <p className="text-gray-500 text-xs">
                        {formatDate(story.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Story Detail Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getStoryTypeConfig(selectedStory.type).color}-100 text-${getStoryTypeConfig(selectedStory.type).color}-700`}>
                      {getStoryTypeConfig(selectedStory.type).icon} {getStoryTypeConfig(selectedStory.type).label}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center">
                      {getPrivacyConfig(selectedStory.privacy).icon}
                      <span className="ml-1">{getPrivacyConfig(selectedStory.privacy).label}</span>
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">{selectedStory.title}</h2>
                </div>
                
                <div className="flex items-center gap-2">
                  {(selectedStory.author?._id === currentUser?._id || currentUser?.role === "admin") && (
                    <>
                      <button
                        onClick={() => initEditStory(selectedStory)}
                        className="p-2 text-gray-600 hover:text-blue-600"
                        title="Edit story"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteStory(selectedStory._id)}
                        className="p-2 text-gray-600 hover:text-red-600"
                        title="Delete story"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedStory(null)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Story Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  {/* Media Gallery */}
                  {(selectedStory.images?.length > 0 || selectedStory.videos?.length > 0) && (
                    <div className="mb-6">
                      <div className="grid grid-cols-2 gap-2">
                        {selectedStory.images?.slice(0, 4).map((image, index) => (
                          <div key={index} className="rounded-lg overflow-hidden">
                            <img
                              src={image}
                              alt={`${selectedStory.title} - ${index + 1}`}
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Story Text */}
                  <div className="prose max-w-none mb-8">
                    <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                      {selectedStory.content}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Story Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-bold mb-3 flex items-center">
                        <Bookmark size={18} className="mr-2" />
                        Story Details
                      </h4>
                      <div className="space-y-3">
                        {selectedStory.year && (
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500">Year</p>
                              <p className="font-medium">{selectedStory.year}</p>
                            </div>
                          </div>
                        )}
                        {selectedStory.location && (
                          <div className="flex items-center">
                            <MapPin size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500">Location</p>
                              <p className="font-medium">{selectedStory.location}</p>
                            </div>
                          </div>
                        )}
                        {selectedStory.author && (
                          <div className="flex items-center">
                            <User size={16} className="mr-3 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500">Author</p>
                              <p className="font-medium">{selectedStory.author.name}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {selectedStory.tags?.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold mb-2 flex items-center">
                          <Tag size={18} className="mr-2" />
                          Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedStory.tags.map((tag, index) => (
                            <span 
                              key={index} 
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar - Comments & Actions */}
                <div className="space-y-6">
                  {/* Action Buttons */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <button
                      onClick={() => handleLikeStory(selectedStory._id)}
                      disabled={likeLoading === selectedStory._id}
                      className={`w-full flex items-center justify-center p-3 rounded-lg border transition-colors ${
                        selectedStory.likes?.includes(currentUser?._id)
                          ? 'bg-red-50 border-red-200 text-red-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Heart 
                        className="mr-2" 
                        size={18}
                        fill={selectedStory.likes?.includes(currentUser?._id) ? 'currentColor' : 'none'}
                      />
                      {likeLoading === selectedStory._id ? 'Liking...' : `Like (${selectedStory.likes?.length || 0})`}
                    </button>

                    <button className="w-full flex items-center justify-center p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Share2 className="mr-2" size={18} />
                      Share Story
                    </button>

                    <button className="w-full flex items-center justify-center p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Download className="mr-2" size={18} />
                      Download
                    </button>
                  </div>

                  {/* Comments Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold mb-3 flex items-center">
                      <MessageCircle size={18} className="mr-2" />
                      Comments ({selectedStory.comments?.length || 0})
                    </h4>
                    
                    {selectedStory.comments && selectedStory.comments.length > 0 ? (
                      <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                        {selectedStory.comments.map((comment, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg">
                            <div className="flex items-center mb-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                                {comment.user?.profilePicture ? (
                                  <img src={comment.user.profilePicture} alt={comment.user.name} className="w-full h-full rounded-full" />
                                ) : (
                                  <User size={14} className="text-blue-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm truncate">{comment.user?.name}</p>
                                  <p className="text-gray-500 text-xs">
                                    {formatDate(comment.createdAt)}
                                  </p>
                                </div>
                                <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No comments yet</p>
                    )}
                    
                    {/* Add Comment */}
                    <div className="mt-4">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        rows="3"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => setCommentText('')}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddComment(selectedStory._id)}
                          disabled={!commentText.trim() || submittingComment}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {submittingComment ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Story Modal */}
      {(showAddStory || editingStory) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingStory ? 'Edit Story' : 'Share a Family Story'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddStory(false);
                    setEditingStory(null);
                    resetNewStory();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  editingStory ? handleUpdateStory() : handleAddStory();
                }}
                className="space-y-4"
              >
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    value={newStory.title}
                    onChange={(e) => setNewStory({...newStory, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Grandpa's Fishing Adventure, Grandma's Secret Recipe, etc."
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {storyTypes.map((type) => (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => setNewStory({...newStory, type: type.id})}
                        className={`p-3 rounded-lg border text-center transition-colors ${
                          newStory.type === type.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-lg mb-1">{type.icon}</div>
                        <div className="text-sm">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      type="number"
                      value={newStory.year}
                      onChange={(e) => setNewStory({...newStory, year: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={newStory.location}
                      onChange={(e) => setNewStory({...newStory, location: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Where did this happen?"
                    />
                  </div>
                </div>

                {/* Privacy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {privacyOptions.map((option) => (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => setNewStory({...newStory, privacy: option.id})}
                        className={`p-3 rounded-lg border flex flex-col items-center ${
                          newStory.privacy === option.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="mb-1">{option.icon}</div>
                        <div className="text-sm">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Content *
                  </label>
                  <textarea
                    value={newStory.content}
                    onChange={(e) => setNewStory({...newStory, content: e.target.value})}
                    rows="8"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell your story in detail. Who was involved? What happened? Why is it special to your family?"
                    required
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (Press Enter to add)
                  </label>
                  <input
                    type="text"
                    onKeyDown={handleTagInput}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add tags like 'fishing', 'recipe', 'vacation'"
                  />
                  {newStory.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newStory.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddStory(false);
                      setEditingStory(null);
                      resetNewStory();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newStory.title || !newStory.content}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    {editingStory ? 'Update Story' : 'Share Story'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyStories;