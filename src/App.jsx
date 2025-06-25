import React, { useState, useEffect, useRef } from "react";
import Calendar from "./components/Calendar";
import { format } from "date-fns";
import "./App.css";

function App() {
  const [events, setEvents] = useState([]);

  return(
    <div className="app">
    <header className="app-header">
      <h1>Event Calendar</h1>
    </header>

    <Calendar
      events={events}
    />
    </div>
  )
}

export default App;
