import React, { useState, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import Calendar from "../components/Calendar";
import EventModal from "../components/EventModal";
import EventStorage from "../utils/EventStorage";
import "../assets/CalendarApp.css";

function CalendarApp() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const hasLoaded = useRef(false);

  // Load events from storage on initial render
  useEffect(() => {
    const storedEvents = EventStorage.getAllEvents();
    const normalizedEvents = storedEvents.map((event) => ({
      ...event,
      date: event.date.slice(0, 10),
    }));
    setEvents(normalizedEvents);
  }, []);

  // Set hasLoaded only after events are loaded from storage
  useEffect(() => {
    if (events.length > 0 || EventStorage.getAllEvents().length === 0) {
      hasLoaded.current = true;
    }
  }, [events]);

  // Save events to storage whenever events change, but not on first load
  useEffect(() => {
    if (hasLoaded.current) {
      EventStorage.saveEvents(events);
    }
  }, [events]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event) => {
    setEditingEvent(event);
    setSelectedDate(new Date(event.date));
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData) => {
    if (editingEvent) {
      // Update existing event
      const updatedEvents = events.map((event) =>
        event.id === editingEvent.id
          ? { ...eventData, id: editingEvent.id }
          : event
      );
      setEvents(updatedEvents);
    } else {
      // Add new event
      setEvents([...events, eventData]);
    }
    setIsModalOpen(false);
    setEditingEvent(null);
    setSelectedDate(null);
  };

  const handleDeleteEvent = (eventId) => {
    const updatedEvents = events.filter((event) => event.id !== eventId);
    setEvents(updatedEvents);
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleEventDrop = (eventId, newDate) => {
    const movedEvent = events.find((event) => event.id === eventId);
    const newDateString =
      typeof newDate === "string" ? newDate : format(newDate, "yyyy-MM-dd");

    // 1. Check for conflict: same date, same name, same time, different id
    const sameNameAndTime = events.some(
      (event) =>
        event.id !== eventId &&
        event.date === newDateString &&
        event.title === movedEvent.title &&
        event.time === movedEvent.time &&
        event.time // Only check if time is set
    );

    // 2. Check for conflict: same date, same time, different id (regardless of name)
    const sameTime = events.some(
      (event) =>
        event.id !== eventId &&
        event.date === newDateString &&
        event.time === movedEvent.time &&
        event.time // Only check if time is set
    );

    if (sameNameAndTime) {
      const proceed = window.confirm(
        "An event with the same name and time already exists on this date. Do you want to continue?"
      );
      if (!proceed) return;
    } else if (sameTime) {
      const proceed = window.confirm(
        "An event with the same time already exists on this date. Do you want to continue?"
      );
      if (!proceed) return;
    }

    // If no conflict or user confirms, update the event's date
    const updatedEvents = events.map((event) =>
      event.id === eventId ? { ...event, date: newDateString } : event
    );
    setEvents(updatedEvents);
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || event.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["personal", "work", "family", "health", "other"];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="calendar-app">
        <header className="calendar-app-header">
          <div className="header-nav">
            <Link to="/" className="back-button">
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
          </div>
          <h1>Calendar</h1>
          <div className="controls">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </header>

        <Calendar
          events={filteredEvents}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
        />

        {isModalOpen && (
          <EventModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingEvent(null);
              setSelectedDate(null);
            }}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
            selectedDate={selectedDate}
            editingEvent={editingEvent}
            existingEvents={events}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default CalendarApp;
