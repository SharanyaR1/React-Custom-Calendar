import React from "react";
import { useDrag } from "react-dnd";
import { format, parseISO } from "date-fns";

const EventItem = ({ event, onClick, isDraggable = true }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "event",
    item: { eventId: event.originalId || event.id },
    canDrag: isDraggable,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleClick = (e) => {
    e.stopPropagation();
    onClick();
  };

  const getCategoryColor = (category) => {
    const colors = {
      personal: "#4CAF50",
      work: "#2196F3",
      family: "#FF9800",
      health: "#E91E63",
      other: "#9C27B0",
    };
    return colors[category] || colors.other;
  };

  const eventStyle = {
    backgroundColor: getCategoryColor(event.category),
    borderLeft: `4px solid ${getCategoryColor(event.category)}`,
    opacity: isDragging ? 0.5 : 1,
  };

  const eventTime = event.time
    ? format(parseISO(`2000-01-01T${event.time}`), "h:mm a")
    : "";

  return (
    <div
      ref={isDraggable ? drag : null}
      className={`event-item ${isDraggable ? "draggable" : "non-draggable"} ${
        event.isRecurring ? "recurring" : ""
      }`}
      style={eventStyle}
      onClick={handleClick}
      title={`${event.title}${eventTime ? ` (${eventTime})` : ""}${
        event.description ? `\n${event.description}` : ""
      }`}
    >
      <div className="event-title">
        {event.title}
        {event.isRecurring && <span className="recurring-indicator">↻</span>}
      </div>
      {eventTime && <div className="event-time">{eventTime}</div>}
    </div>
  );
};

export default EventItem;
