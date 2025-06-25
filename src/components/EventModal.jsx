import React, { useState, useEffect } from "react";
import { format, parseISO, isSameDay, isBefore, isAfter } from "date-fns";
import { X, AlertTriangle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const EventModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  editingEvent,
  existingEvents,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    description: "",
    category: "personal",
    recurrence: {
      type: "none",
      interval: 1,
      daysOfWeek: [],
      endDate: "",
    },
  });

  const [conflicts, setConflicts] = useState([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      if (editingEvent) {
        const eventDate = parseISO(editingEvent.date);
        const eventYear = eventDate.getFullYear(); 
        const eventMonth = String(eventDate.getMonth() + 1).padStart(2, "0");
        const eventDay = String(eventDate.getDate()).padStart(2, "0");
        const eventDateString = `${eventYear}-${eventMonth}-${eventDay}`;

        setFormData({
          title: editingEvent.title || "",
          date: eventDateString,
          time: editingEvent.time || "",
          description: editingEvent.description || "",
          category: editingEvent.category || "personal",
          recurrence: editingEvent.recurrence || {
            type: "none",
            interval: 1,
            daysOfWeek: [],
            endDate: "",
          },
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          date: dateString,
          title: "",
          time: "",
          description: "",
          category: "personal",
          recurrence: {
            type: "none",
            interval: 1,
            daysOfWeek: [],
            endDate: "",
          },
        }));
      }
    }
  }, [selectedDate, editingEvent]);

  useEffect(() => {
    checkConflicts();
  }, [formData.date, formData.time, formData.title]);

  const checkConflicts = () => {
    if (!formData.date || !formData.time || !formData.title.trim()) {
      setConflicts([]);
      setShowConflictWarning(false);
      return;
    }

    const eventDate = parseISO(formData.date);
    const conflictingEvents = existingEvents.filter((event) => {
      if (editingEvent && event.id === editingEvent.id) return false;

      const existingEventDate = parseISO(event.date);
      return (
        isSameDay(eventDate, existingEventDate) && event.time === formData.time
      );
    });

    setConflicts(conflictingEvents);
    setShowConflictWarning(conflictingEvents.length > 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested recurrence fields
    if (name.startsWith("recurrence.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        recurrence: {
          ...prev.recurrence,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleRecurrenceChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        [field]: value,
      },
    }));
  };

  const handleDaysOfWeekChange = (day) => {
    const dayNumber = parseInt(day);
    setFormData((prev) => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        daysOfWeek: prev.recurrence.daysOfWeek.includes(dayNumber)
          ? prev.recurrence.daysOfWeek.filter((d) => d !== dayNumber)
          : [...prev.recurrence.daysOfWeek, dayNumber],
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      formData.recurrence &&
      formData.recurrence.type !== "none" &&
      !formData.recurrence.endDate
    ) {
      setValidationError("Recurrence end date is required.");
      return;
    }

    setValidationError("");

    if (!formData.title.trim() || !formData.date) {
      alert("Please fill in all required fields");
      return;
    }

    if (
      showConflictWarning &&
      !window.confirm(
        "There are conflicting events at this time. Do you want to continue?"
      )
    ) {
      return;
    }

    const eventData = {
      id: editingEvent ? editingEvent.id : uuidv4(),
      title: formData.title.trim(),
      date: formData.date,
      time: formData.time,
      description: formData.description.trim(),
      category: formData.category,
      recurrence: formData.recurrence,
      createdAt: editingEvent
        ? editingEvent.createdAt
        : new Date().toISOString(),
    };

    onSave(eventData);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      onDelete(editingEvent.id);
    }
  };

  if (!isOpen) return null;

  const daysOfWeek = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingEvent ? "Edit Event" : "Add New Event"}</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        {showConflictWarning && (
          <div className="conflict-warning">
            <AlertTriangle size={16} />
            <span>
              Conflict detected! There are {conflicts.length} event(s) at this
              time:
            </span>
            <ul>
              {conflicts.map((event) => (
                <li key={event.id}>{event.title}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter event title"
              maxLength={39}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Time</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Enter event description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="family">Family</option>
              <option value="health">Health</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="recurrence-type">Recurrence</label>
            <select
              id="recurrence-type"
              value={formData.recurrence.type}
              onChange={(e) => handleRecurrenceChange("type", e.target.value)}
            >
              <option value="none">No Recurrence</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {formData.recurrence.type === "weekly" && (
            <div className="form-group">
              <label>Days of Week</label>
              <div className="days-selector">
                {daysOfWeek.map((day) => (
                  <label key={day.value} className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.recurrence.daysOfWeek.includes(
                        day.value
                      )}
                      onChange={() => handleDaysOfWeekChange(day.value)}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {formData.recurrence.type === "custom" && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="interval">Repeat every</label>
                <input
                  type="number"
                  id="interval"
                  value={formData.recurrence.interval}
                  onChange={(e) =>
                    handleRecurrenceChange("interval", parseInt(e.target.value))
                  }
                  min="1"
                />
                <span>days</span>
              </div>
            </div>
          )}

          {formData.recurrence.type !== "none" && (
            <div className="form-group">
              <label htmlFor="end-date">End Date *</label>
              <input
                type="date"
                id="end-date"
                name="recurrence.endDate"
                value={formData.recurrence.endDate || ""}
                onChange={handleInputChange}
                min={formData.date}
              />
            </div>
          )}

          {validationError && (
            <div
              className="validation-error"
              style={{ color: "red", marginBottom: 8 }}
            >
              {validationError}
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            {editingEvent && (
              <button
                type="button"
                onClick={handleDelete}
                className="delete-button"
              >
                Delete
              </button>
            )}
            <button type="submit" className="save-button">
              {editingEvent ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
