'use client'
import React, { useState } from "react";
import CustomFullCalendar from "@/components/ui/custom-full-calendar";
function App() {
  const [events, setEvents] = useState([]);

  return (
    <div>
      <CustomFullCalendar events={events} setEvents={setEvents} />
    </div>
  );
}

export default App;
