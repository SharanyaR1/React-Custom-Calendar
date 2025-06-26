import React, { useState } from "react";
import { useDrop } from "react-dnd";
import { format } from "date-fns";
import EventItem from "./EventItem";

const CalendarDay = ({
    date,
    isCurrentMonth,
    isToday,
    events,
    onClick,
    onEventClick,
    onEventDrop,
}) => {
    const [showAll, setShowAll] = useState(false);
    const [{ isOver }, drop] = useDrop({
        accept: "event",
        drop: (item) => {
        if (item.eventId) {
            onEventDrop(item.eventId, date);
        }
        },
        collect: (monitor) => ({
        isOver: monitor.isOver(),
        }),
    });

    const handleDateClick = (e) => {
        if (e.target.closest(".event-item")) return;
        onClick();
    };

    const dayClasses = [
        "calendar-day",
        !isCurrentMonth && "other-month",
        isToday && "today",
        isOver && "drag-over",
        events.length > 0 && "has-events",
    ]
    .filter(Boolean)
    .join(" ");

    return(
        <div ref={drop} className={dayClasses} onClick={handleDateClick}>
            <div className="day-number">{format(date, "d")}</div>
            <div className="events-container">
                {(showAll ? events : events.slice(0, 3)).map((event, index) => (
                <EventItem
                    key={event.id}
                    event={event}
                    onClick={() => onEventClick(event)}
                    isDraggable={!event.isRecurring}
                />
                ))}
                {events.length > 3 && !showAll && (
                <div
                    className="more-events"
                    onClick={(e) => {
                    e.stopPropagation();
                    setShowAll(true);
                    }}
                    style={{ cursor: "pointer", color: "#007bff" }}
                >
                    +{events.length - 3} more
                </div>
                )}
                {showAll && (
                <div
                    className="less-events"
                    onClick={(e) => {
                    e.stopPropagation();
                    setShowAll(false);
                    }}
                    style={{ cursor: "pointer", color: "#007bff" }}
                >
                    Show less
                </div>
                )}
            </div>
        </div>
    );
};

export default CalendarDay;