class EventStorage {
  static STORAGE_KEY = "calendar_events";

  static saveEvents(events) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
      return true;
    } catch (error) {
      console.error("Failed to save events:", error);
      return false;
    }
  }

  static getAllEvents() {
    try {
      const events = localStorage.getItem(this.STORAGE_KEY);
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error("Failed to load events:", error);
      return [];
    }
  }

  static saveEvent(event) {
    const events = this.getAllEvents();
    const existingEventIndex = events.findIndex((e) => e.id === event.id);

    if (existingEventIndex >= 0) {
      events[existingEventIndex] = event;
    } else {
      events.push(event);
    }

    return this.saveEvents(events);
  }

  static deleteEvent(eventId) {
    const events = this.getAllEvents();
    const filteredEvents = events.filter((event) => event.id !== eventId);
    return this.saveEvents(filteredEvents);
  }

  static clearAllEvents() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Failed to clear events:", error);
      return false;
    }
  }

  static exportEvents() {
    const events = this.getAllEvents();
    const dataStr = JSON.stringify(events, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `calendar_events_${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }

  static importEvents(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const events = JSON.parse(e.target.result);
          if (Array.isArray(events)) {
            this.saveEvents(events);
            resolve(events);
          } else {
            reject(new Error("Invalid file format"));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }
}

export default EventStorage;
