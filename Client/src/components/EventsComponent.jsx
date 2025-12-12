import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import API from '../services/api';

const EventsCalendar = ({ familyId, compact = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [loading, setLoading] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    if (familyId) {
      fetchEvents();
    }
  }, [familyId, currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/analytics/families/${familyId}/timeline?year=${currentDate.getFullYear()}`);
      setEvents(res.timeline || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const daysArray = [];
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      daysArray.push(null);
    }
    
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(new Date(year, month, i));
    }
    
    return daysArray;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatEventType = (type) => {
    const types = {
      birthday: '🎂 Birthday',
      anniversary: '💍 Anniversary',
      reunion: '👨‍👩‍👧‍👦 Reunion',
      holiday: '🎉 Holiday',
      custom: '📅 Event'
    };
    return types[type] || type;
  };

  const getEventColor = (type) => {
    const colors = {
      birthday: 'bg-pink-100 text-pink-700',
      anniversary: 'bg-purple-100 text-purple-700',
      reunion: 'bg-blue-100 text-blue-700',
      holiday: 'bg-green-100 text-green-700',
      custom: 'bg-yellow-100 text-yellow-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const daysArray = getDaysInMonth(currentDate);
  const today = new Date();

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center">
            <Calendar className="mr-2" size={20} />
            Upcoming Events
          </h3>
          <button 
            onClick={() => setShowAddEvent(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <div className="space-y-3">
          {events
            .filter(event => new Date(event.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3)
            .map((event, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${getEventColor(event.type)} border-l-4 ${
                  event.type === 'birthday' ? 'border-pink-500' :
                  event.type === 'anniversary' ? 'border-purple-500' :
                  event.type === 'reunion' ? 'border-blue-500' :
                  event.type === 'holiday' ? 'border-green-500' : 'border-yellow-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <div className="flex items-center text-sm mt-1">
                      <Clock size={14} className="mr-1" />
                      {new Date(event.date).toLocaleDateString()} • {formatTime(event.date)}
                    </div>
                  </div>
                  <span className="text-xs font-medium">
                    {formatEventType(event.type)}
                  </span>
                </div>
              </div>
            ))}
          
          {events.length === 0 && !loading && (
            <div className="text-center py-6">
              <Calendar className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-gray-500">No upcoming events</p>
            </div>
          )}
          
          {loading && (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}
        </div>
        
        <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-800 text-sm font-medium">
          View All Events →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Family Events Calendar</h2>
            <p className="text-gray-600">Stay updated with family gatherings and celebrations</p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button 
              onClick={goToToday}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Today
            </button>
            <button 
              onClick={() => setShowAddEvent(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Add Event
            </button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft size={24} />
          </button>
          
          <h3 className="text-xl font-bold">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {days.map(day => (
            <div key={day} className="text-center font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          
          {daysArray.map((date, index) => {
            const isToday = date && 
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();
            
            const dateEvents = getEventsForDate(date);
            
            return (
              <div 
                key={index}
                className={`min-h-24 border rounded-lg p-2 ${
                  !date ? 'border-transparent' : 'border-gray-200 hover:border-blue-300'
                } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                {date && (
                  <>
                    <div className={`text-right mb-1 ${
                      isToday ? 'font-bold text-blue-600' : 'text-gray-700'
                    }`}>
                      {date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dateEvents.slice(0, 2).map((event, eventIndex) => (
                        <div 
                          key={eventIndex}
                          className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-90 ${getEventColor(event.type)}`}
                          onClick={() => setSelectedEvent(event)}
                        >
                          {event.title}
                        </div>
                      ))}
                      
                      {dateEvents.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dateEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Bell className="mr-2" />
          Upcoming Events
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : events.filter(e => new Date(e.date) >= today).length > 0 ? (
          <div className="space-y-4">
            {events
              .filter(event => new Date(event.date) >= today)
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((event, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border-l-4 ${
                    event.type === 'birthday' ? 'border-pink-500 bg-pink-50' :
                    event.type === 'anniversary' ? 'border-purple-500 bg-purple-50' :
                    event.type === 'reunion' ? 'border-blue-500 bg-blue-50' :
                    event.type === 'holiday' ? 'border-green-500 bg-green-50' :
                    'border-yellow-500 bg-yellow-50'
                  } hover:shadow-sm transition-shadow cursor-pointer`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          event.type === 'birthday' ? 'bg-pink-100 text-pink-800' :
                          event.type === 'anniversary' ? 'bg-purple-100 text-purple-800' :
                          event.type === 'reunion' ? 'bg-blue-100 text-blue-800' :
                          event.type === 'holiday' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {formatEventType(event.type)}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-lg">{event.title}</h4>
                      
                      {event.description && (
                        <p className="text-gray-600 mt-1">{event.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 mt-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar size={16} className="mr-2" />
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock size={16} className="mr-2" />
                          {formatTime(event.date)}
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin size={16} className="mr-2" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:text-right">
                      <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        Set Reminder
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
            <h4 className="text-lg font-medium text-gray-600 mb-2">No upcoming events</h4>
            <p className="text-gray-500 mb-4">Add events to keep your family connected</p>
            <button 
              onClick={() => setShowAddEvent(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Event
            </button>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedEvent.type === 'birthday' ? 'bg-pink-100 text-pink-800' :
                    selectedEvent.type === 'anniversary' ? 'bg-purple-100 text-purple-800' :
                    selectedEvent.type === 'reunion' ? 'bg-blue-100 text-blue-800' :
                    selectedEvent.type === 'holiday' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {formatEventType(selectedEvent.type)}
                  </span>
                  <h3 className="text-2xl font-bold mt-2">{selectedEvent.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="text-gray-400 mr-3" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-medium">
                        {new Date(selectedEvent.date).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="flex items-center">
                      <MapPin className="text-gray-400 mr-3" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">{selectedEvent.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedEvent.relatedPersons && selectedEvent.relatedPersons.length > 0 && (
                    <div className="flex items-start">
                      <Users className="text-gray-400 mr-3 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">People Involved</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedEvent.relatedPersons.map((person, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                              {person.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  {selectedEvent.description && (
                    <div>
                      <h4 className="font-bold mb-2">Description</h4>
                      <p className="text-gray-700">{selectedEvent.description}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add New Event</h2>
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Family Reunion, Birthday Party, etc."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="custom">Custom Event</option>
                    <option value="birthday">Birthday</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="reunion">Family Reunion</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Home, Restaurant, Park, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Event details, what to bring, dress code, etc."
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsCalendar;