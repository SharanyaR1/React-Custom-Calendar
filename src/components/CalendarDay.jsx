import React, { useState } from "react";
import { format } from "date-fns";

const CalendarDay = ({
    date,
    isCurrentMonth,
    isToday,
}) => {
    const dayClasses = [
        "calendar-day",
        !isCurrentMonth && "other-month",
        isToday && "today",
    ]
    .filter(Boolean)
    .join(" ");

    return(
        <div className="dayClasses">
            <div className="day-number">{format(date, "d")}</div>
        </div>
    );
};

export default CalendarDay;