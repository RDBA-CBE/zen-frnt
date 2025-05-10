'use client'
import React, { useState } from "react";
import CustomFullCalendar from "@/components/ui/custom-full-calendar";
import ProtectedRoute from "@/components/common-components/privateRouter";
function CalendarPage() {
  const [events, setEvents] = useState([]);

  return (
    <div className="pb-5"><CustomFullCalendar events={events} setEvents={setEvents} /></div>
  );
}

export default ProtectedRoute(CalendarPage);
