'use client'
import React, { useState } from "react";
import CustomFullCalendar from "@/components/ui/custom-full-calendar";
function Calendar() {
  const [events, setEvents] = useState([]);

  return (
    <div className="pb-5">
      <CustomFullCalendar events={events} setEvents={setEvents} />
    </div>
  );
}

export default Calendar;
