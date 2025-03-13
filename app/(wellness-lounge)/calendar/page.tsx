'use client'
import React, { useState } from "react";
import CustomFullCalendar from "@/components/ui/custom-full-calendar";
function Calendar() {
  const [events, setEvents] = useState([]);

  return (
    <div>
      <CustomFullCalendar events={events} setEvents={setEvents} />
    </div>
  );
}

export default Calendar;
