import {
  parseISO,
  addDays,
  addWeeks,
  addMonths,
  isSameDay,
  isBefore,
  isAfter,
  getDay,
  differenceInDays,
  startOfDay,
} from "date-fns";

class RecurrenceUtils {
  /**
   * Check if a recurring event should occur on a specific date
   * @param {Object} event - The event object with recurrence settings
   * @param {Date} checkDate - The date to check
   * @returns {boolean} - Whether the event should occur on this date
   */
  static shouldEventOccurOnDate(event, checkDate) {
    if (!event.recurrence || event.recurrence.type === "none") {
      return false;
    }

    const eventStartDate = parseISO(event.date);
    const recurrence = event.recurrence;
    const checkDateStart = startOfDay(checkDate);
    const eventStartDateStart = startOfDay(eventStartDate);

    // Event hasn't started yet
    if (isBefore(checkDateStart, eventStartDateStart)) {
      return false;
    }

    // Check if we've passed the end date
    if (recurrence.endDate) {
      const endDate = startOfDay(parseISO(recurrence.endDate));
      if (isAfter(checkDateStart, endDate)) {
        return false;
      }
    }

    // Don't show on the original date (that's handled separately)
    if (isSameDay(checkDateStart, eventStartDateStart)) {
      return false;
    }

    switch (recurrence.type) {
      case "daily":
        return this._checkDailyRecurrence(
          eventStartDateStart,
          checkDateStart,
          recurrence
        );

      case "weekly":
        return this._checkWeeklyRecurrence(
          eventStartDateStart,
          checkDateStart,
          recurrence
        );

      case "monthly":
        return this._checkMonthlyRecurrence(
          eventStartDateStart,
          checkDateStart,
          recurrence
        );

      case "custom":
        return this._checkCustomRecurrence(
          eventStartDateStart,
          checkDateStart,
          recurrence
        );

      default:
        return false;
    }
  }

  /**
   * Check daily recurrence
   */
  static _checkDailyRecurrence(startDate, checkDate, recurrence) {
    const daysDiff = differenceInDays(checkDate, startDate);
    const interval = recurrence.interval || 1;
    return daysDiff > 0 && daysDiff % interval === 0;
  }

  /**
   * Check weekly recurrence
   */
  static _checkWeeklyRecurrence(startDate, checkDate, recurrence) {
    const daysOfWeek = recurrence.daysOfWeek || [];

    if (daysOfWeek.length === 0) {
      // If no specific days are selected, default to the original day of the week
      const originalDayOfWeek = getDay(startDate);
      daysOfWeek.push(originalDayOfWeek);
    }

    const checkDayOfWeek = getDay(checkDate);

    // Check if this day of the week is selected
    if (!daysOfWeek.includes(checkDayOfWeek)) {
      return false;
    }

    // Check if enough weeks have passed
    const daysDiff = differenceInDays(checkDate, startDate);
    const weeksDiff = Math.floor(daysDiff / 7);
    const interval = recurrence.interval || 1;

    return weeksDiff > 0 && weeksDiff % interval === 0;
  }

  /**
   * Check monthly recurrence
   */
  static _checkMonthlyRecurrence(startDate, checkDate, recurrence) {
    const startDay = startDate.getDate();
    const checkDay = checkDate.getDate();

    // Must be the same day of the month
    if (startDay !== checkDay) {
      return false;
    }

    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const checkYear = checkDate.getFullYear();
    const checkMonth = checkDate.getMonth();

    const monthsDiff = (checkYear - startYear) * 12 + (checkMonth - startMonth);
    const interval = recurrence.interval || 1;

    return monthsDiff > 0 && monthsDiff % interval === 0;
  }

  /**
   * Check custom recurrence (every N days)
   */
  static _checkCustomRecurrence(startDate, checkDate, recurrence) {
    const daysDiff = differenceInDays(checkDate, startDate);
    const interval = recurrence.interval || 1;
    return daysDiff > 0 && daysDiff % interval === 0;
  }

  /**
   * Generate all occurrences of a recurring event within a date range
   * @param {Object} event - The event object
   * @param {Date} startDate - Start of date range
   * @param {Date} endDate - End of date range
   * @returns {Array} - Array of event occurrences
   */
  static generateOccurrences(event, startDate, endDate) {
    if (!event.recurrence || event.recurrence.type === "none") {
      return [];
    }

    const occurrences = [];
    const eventStartDate = parseISO(event.date);
    let currentDate = new Date(
      Math.max(startDate.getTime(), eventStartDate.getTime())
    );

    // Generate occurrences up to 1000 to prevent infinite loops
    let maxOccurrences = 1000;
    let count = 0;

    while (currentDate <= endDate && count < maxOccurrences) {
      if (this.shouldEventOccurOnDate(event, currentDate)) {
        occurrences.push({
          ...event,
          id: `${event.id}-${currentDate.toISOString().split("T")[0]}`,
          date: currentDate.toISOString(),
          isRecurringInstance: true,
          originalEventId: event.id,
        });
      }

      currentDate = addDays(currentDate, 1);
      count++;
    }

    return occurrences;
  }

  /**
   * Get the next occurrence of a recurring event after a given date
   * @param {Object} event - The event object
   * @param {Date} afterDate - Date after which to find the next occurrence
   * @returns {Date|null} - Next occurrence date or null if none
   */
  static getNextOccurrence(event, afterDate = new Date()) {
    if (!event.recurrence || event.recurrence.type === "none") {
      return null;
    }

    const eventStartDate = parseISO(event.date);
    let currentDate = new Date(
      Math.max(afterDate.getTime(), eventStartDate.getTime())
    );

    // Check up to 365 days ahead
    for (let i = 0; i <= 365; i++) {
      if (this.shouldEventOccurOnDate(event, currentDate)) {
        return currentDate;
      }
      currentDate = addDays(currentDate, 1);
    }

    return null;
  }

  /**
   * Get a human-readable description of the recurrence pattern
   * @param {Object} recurrence - The recurrence object
   * @returns {string} - Human-readable description
   */
  static getRecurrenceDescription(recurrence) {
    if (!recurrence || recurrence.type === "none") {
      return "No recurrence";
    }

    const interval = recurrence.interval || 1;

    switch (recurrence.type) {
      case "daily":
        return interval === 1 ? "Daily" : `Every ${interval} days`;

      case "weekly":
        const daysOfWeek = recurrence.daysOfWeek || [];
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        if (daysOfWeek.length === 0) {
          return interval === 1 ? "Weekly" : `Every ${interval} weeks`;
        }

        const dayString = daysOfWeek.map((day) => dayNames[day]).join(", ");
        const weekString =
          interval === 1 ? "Weekly" : `Every ${interval} weeks`;
        return `${weekString} on ${dayString}`;

      case "monthly":
        return interval === 1 ? "Monthly" : `Every ${interval} months`;

      case "custom":
        return `Every ${interval} days`;

      default:
        return "Custom recurrence";
    }
  }
}

export default RecurrenceUtils;
