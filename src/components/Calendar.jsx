import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CalendarDay from "./CalendarDay";
import RecurrenceUtils from "../utils/RecurrenceUtils";

const Calendar = ({events,  onDateClick, onEventClick, onEventDrop}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderHeader = () => {
    return (
      <div className="calendar-header">
        <button onClick={previousMonth} className="nav-button">
          <ChevronLeft size={20} />
        </button>
        <h2 className="month-year">{format(currentMonth, "MMMM yyyy")}</h2>
        <button onClick={nextMonth} className="nav-button">
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  const renderDaysOfWeek = () => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="days-of-week">
        {daysOfWeek.map((day) => (
          <div key={day} className="day-of-week">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const getEventsForDate = (date) => {
    const dayEvents = [];

    events.forEach((event) => {
      const eventDate = parseISO(event.date);

      if (isSameDay(eventDate, date)) {
        dayEvents.push(event);
      }

      if (event.recurrence && event.recurrence.type !== "none") {
        if (RecurrenceUtils.shouldEventOccurOnDate(event, date)) {
          dayEvents.push({
            ...event,
            id: `${event.id}-${format(date, "yyyy-MM-dd")}`,
            isRecurring: true,
            originalId: event.id,
          });
        }
      }
    });

    return dayEvents;
  };

  const renderCalendarDays = () => {
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const currentDay = new Date(day); 
      const dayEvents = getEventsForDate(currentDay);

      days.push(
        <CalendarDay
          key={currentDay.toISOString()}
          date={currentDay}
          events={dayEvents}
          isCurrentMonth={isSameMonth(currentDay, monthStart)}
          isToday={isToday(currentDay)}
          onClick={() => onDateClick(currentDay)}
          onEventClick={onEventClick}
          onEventDrop={onEventDrop}
        />
      );
      day = addDays(day, 1);
    }

    return <div className="calendar-grid">{days}</div>;
  };

    return (
    <div className="calendar">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCalendarDays()}
    </div>
  );
};

export default Calendar;
