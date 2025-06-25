import React, { useState, useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Calendar from "./components/Calendar";
import EventModal from "./components/EventModal";
import EventStorage from "./utils/EventStorage";
import { format } from "date-fns";
import "./App.css";

function App() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const hasLoaded = useRef(false);

  useEffect(() => {
    const storedEvents = EventStorage.getAllEvents();
    const normalizedEvents = storedEvents.map((event) => ({
      ...event,
      date: event.date.slice(0, 10),
    }));
    setEvents(normalizedEvents);
  }, []);

  useEffect(() => {
    if (events.length > 0 || EventStorage.getAllEvents().length === 0) {
      hasLoaded.current = true;
    }
  }, [events]);

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

    const sameNameAndTime = events.some(
      (event) =>
        event.id !== eventId &&
        event.date === newDateString &&
        event.title === movedEvent.title &&
        event.time === movedEvent.time &&
        event.time
    );

    const sameTime = events.some(
      (event) =>
        event.id !== eventId &&
        event.date === newDateString &&
        event.time === movedEvent.time &&
        event.time
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

  return(
  <DndProvider backend={HTML5Backend}>
    <div className="app">
      <header className="app-header">
        <h1>React Event Calendar</h1>
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

export default App;
