import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Search, Calendar as CalendarIcon, Clock, MapPin, Users, Bell, Repeat, Trash2 } from 'lucide-react';

interface CalendarAppProps {
  onClose: () => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location?: string;
  notes?: string;
  color: string;
  allDay: boolean;
  reminder?: number; // minutes before
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  attendees?: string[];
}

const CalendarApp: React.FC<CalendarAppProps> = ({ onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    notes: '',
    color: '#3B82F6',
    allDay: false,
    reminder: 15,
    repeat: 'none' as const,
    attendees: [] as string[]
  });

  const eventColors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    const stored = localStorage.getItem('calendar_events');
    if (stored) {
      setEvents(JSON.parse(stored));
    } else {
      // Add some sample events
      const sampleEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Team Meeting',
          date: new Date().toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '11:00',
          location: 'Conference Room A',
          notes: 'Weekly team sync',
          color: '#3B82F6',
          allDay: false,
          reminder: 15,
          repeat: 'weekly'
        },
        {
          id: '2',
          title: 'Birthday Party',
          date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          startTime: '18:00',
          endTime: '22:00',
          location: 'Home',
          notes: "Don't forget the cake!",
          color: '#EC4899',
          allDay: false,
          reminder: 60,
          repeat: 'yearly'
        }
      ];
      setEvents(sampleEvents);
      localStorage.setItem('calendar_events', JSON.stringify(sampleEvents));
    }
  };

  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('calendar_events', JSON.stringify(newEvents));
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
  };

  const openEventForm = (date?: Date) => {
    const targetDate = date || selectedDate || new Date();
    setEventForm({
      title: '',
      date: targetDate.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      notes: '',
      color: eventColors[0],
      allDay: false,
      reminder: 15,
      repeat: 'none',
      attendees: []
    });
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const editEvent = (event: CalendarEvent) => {
    setEventForm({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || '',
      notes: event.notes || '',
      color: event.color,
      allDay: event.allDay,
      reminder: event.reminder || 15,
      repeat: event.repeat || 'none',
      attendees: event.attendees || []
    });
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const saveEvent = () => {
    if (!eventForm.title.trim()) return;

    const newEvent: CalendarEvent = {
      id: editingEvent?.id || Date.now().toString(),
      title: eventForm.title,
      date: eventForm.date,
      startTime: eventForm.startTime,
      endTime: eventForm.endTime,
      location: eventForm.location,
      notes: eventForm.notes,
      color: eventForm.color,
      allDay: eventForm.allDay,
      reminder: eventForm.reminder,
      repeat: eventForm.repeat,
      attendees: eventForm.attendees
    };

    let updatedEvents;
    if (editingEvent) {
      updatedEvents = events.map(event => 
        event.id === editingEvent.id ? newEvent : event
      );
    } else {
      updatedEvents = [...events, newEvent];
    }

    saveEvents(updatedEvents);
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const deleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    saveEvents(updatedEvents);
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Day headers
    days.push(
      <div key="headers" className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, index) => (
          <div key={index} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
    );

    // Calendar days
    const calendarDays = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="aspect-square"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isSelected = selectedDate && isSameDay(date, selectedDate);
      const isTodayDate = isToday(date);

      calendarDays.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`aspect-square p-1 rounded-lg text-sm relative transition-colors ${
            isTodayDate
              ? 'bg-red-500 text-white font-semibold'
              : isSelected
              ? 'bg-blue-500 text-white'
              : 'hover:bg-gray-100'
          }`}
        >
          <span className="block">{day}</span>
          {dayEvents.length > 0 && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
              {dayEvents.slice(0, 3).map((event, index) => (
                <div
                  key={index}
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: event.color }}
                />
              ))}
              {dayEvents.length > 3 && (
                <div className="w-1 h-1 rounded-full bg-gray-400" />
              )}
            </div>
          )}
        </button>
      );
    }

    days.push(
      <div key="calendar" className="grid grid-cols-7 gap-1">
        {calendarDays}
      </div>
    );

    return days;
  };

  const renderEventForm = () => (
    <div className="absolute inset-0 bg-white z-50 flex flex-col" style={{ borderRadius: '40px' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => setShowEventForm(false)}
          className="text-red-500 text-lg"
        >
          Cancel
        </button>
        <h1 className="text-lg font-semibold">
          {editingEvent ? 'Edit Event' : 'New Event'}
        </h1>
        <button
          onClick={saveEvent}
          className="text-red-500 text-lg font-semibold"
        >
          Done
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <div>
          <input
            type="text"
            placeholder="Event Title"
            value={eventForm.title}
            onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
            className="w-full text-xl font-medium border-none outline-none bg-gray-50 rounded-lg p-3"
          />
        </div>

        {/* All Day Toggle */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <span className="text-lg">All-day</span>
          <button
            onClick={() => setEventForm(prev => ({ ...prev, allDay: !prev.allDay }))}
            className={`w-12 h-7 rounded-full transition-colors ${
              eventForm.allDay ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                eventForm.allDay ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Date */}
        <div className="flex items-center py-3 border-b border-gray-100">
          <CalendarIcon size={20} className="text-gray-500 mr-3" />
          <input
            type="date"
            value={eventForm.date}
            onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
            className="flex-1 text-lg outline-none"
          />
        </div>

        {/* Time */}
        {!eventForm.allDay && (
          <div className="space-y-3">
            <div className="flex items-center py-3 border-b border-gray-100">
              <Clock size={20} className="text-gray-500 mr-3" />
              <span className="text-lg mr-4">Starts</span>
              <input
                type="time"
                value={eventForm.startTime}
                onChange={(e) => setEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                className="text-lg outline-none"
              />
            </div>
            <div className="flex items-center py-3 border-b border-gray-100">
              <div className="w-5 mr-3" />
              <span className="text-lg mr-4">Ends</span>
              <input
                type="time"
                value={eventForm.endTime}
                onChange={(e) => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                className="text-lg outline-none"
              />
            </div>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center py-3 border-b border-gray-100">
          <MapPin size={20} className="text-gray-500 mr-3" />
          <input
            type="text"
            placeholder="Location"
            value={eventForm.location}
            onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
            className="flex-1 text-lg outline-none"
          />
        </div>

        {/* Color */}
        <div className="py-3 border-b border-gray-100">
          <div className="flex items-center mb-3">
            <div 
              className="w-5 h-5 rounded-full mr-3"
              style={{ backgroundColor: eventForm.color }}
            />
            <span className="text-lg">Color</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {eventColors.map((color) => (
              <button
                key={color}
                onClick={() => setEventForm(prev => ({ ...prev, color }))}
                className={`w-8 h-8 rounded-full border-2 ${
                  eventForm.color === color ? 'border-gray-800' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Reminder */}
        <div className="flex items-center py-3 border-b border-gray-100">
          <Bell size={20} className="text-gray-500 mr-3" />
          <span className="text-lg mr-4">Alert</span>
          <select
            value={eventForm.reminder}
            onChange={(e) => setEventForm(prev => ({ ...prev, reminder: Number(e.target.value) }))}
            className="text-lg outline-none text-gray-600"
          >
            <option value={0}>None</option>
            <option value={5}>5 minutes before</option>
            <option value={15}>15 minutes before</option>
            <option value={30}>30 minutes before</option>
            <option value={60}>1 hour before</option>
            <option value={1440}>1 day before</option>
          </select>
        </div>

        {/* Repeat */}
        <div className="flex items-center py-3 border-b border-gray-100">
          <Repeat size={20} className="text-gray-500 mr-3" />
          <span className="text-lg mr-4">Repeat</span>
          <select
            value={eventForm.repeat}
            onChange={(e) => setEventForm(prev => ({ ...prev, repeat: e.target.value as any }))}
            className="text-lg outline-none text-gray-600"
          >
            <option value="none">Never</option>
            <option value="daily">Every Day</option>
            <option value="weekly">Every Week</option>
            <option value="monthly">Every Month</option>
            <option value="yearly">Every Year</option>
          </select>
        </div>

        {/* Notes */}
        <div className="py-3">
          <textarea
            placeholder="Notes"
            value={eventForm.notes}
            onChange={(e) => setEventForm(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full h-24 text-lg outline-none bg-gray-50 rounded-lg p-3 resize-none"
          />
        </div>

        {/* Delete Button (for editing) */}
        {editingEvent && (
          <button
            onClick={() => deleteEvent(editingEvent.id)}
            className="w-full bg-red-500 text-white rounded-lg py-3 font-semibold"
          >
            Delete Event
          </button>
        )}
      </div>
    </div>
  );

  const renderEventsList = () => {
    if (!selectedDate) return null;

    const dayEvents = getEventsForDate(selectedDate);

    return (
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {formatDateShort(selectedDate)}
          </h3>
          <button
            onClick={() => openEventForm(selectedDate)}
            className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
          >
            <Plus size={16} className="text-white" />
          </button>
        </div>

        {dayEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No events</p>
        ) : (
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => editEvent(event)}
                className="w-full text-left p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-gray-600">
                      {event.allDay ? 'All day' : `${event.startTime} - ${event.endTime}`}
                      {event.location && ` • ${event.location}`}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (showEventForm) {
    return renderEventForm();
  }

  return (
    <div 
      className="absolute inset-0 bg-white z-50 flex flex-col overflow-hidden"
      style={{ borderRadius: '40px' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="text-red-500 text-lg"
          >
            Done
          </button>
          <h1 className="text-lg font-semibold">Calendar</h1>
          <button
            onClick={() => openEventForm()}
            className="text-red-500 text-lg"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2"
          >
            <ChevronLeft size={24} className="text-red-500" />
          </button>
          
          <h2 className="text-2xl font-bold">
            {formatDate(currentDate)}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2"
          >
            <ChevronRight size={24} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {renderCalendarGrid()}
        </div>

        {/* Events List */}
        {renderEventsList()}
      </div>

      {/* Today Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            setCurrentDate(new Date());
            setSelectedDate(new Date());
          }}
          className="w-full bg-red-500 text-white rounded-lg py-3 font-semibold"
        >
          Today
        </button>
      </div>
    </div>
  );
};

export default CalendarApp;