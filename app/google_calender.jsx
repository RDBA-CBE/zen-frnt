"use client";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CalendarClock, Users } from "lucide-react";
import { BACKEND_URL } from "@/utils/constant.utils";

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

export default function GoogleCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(
        `${BACKEND_URL}zen/events/google-events/?calendar_id=info@zenwellnesslounge.com`
      );
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error("Failed to fetch google events", err);
    }
  };

  const handleNavigate = (offset) => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + offset);
    setSelectedDate(d);
  };

  const getEventsForDay = (day) => {
    const dateStr = moment(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
    ).format("YYYY-MM-DD");
    return events.filter((e) =>
      moment(e.start.dateTime).format("YYYY-MM-DD") === dateStr
    );
  };

  // Build weeks
  const firstDay = getFirstDayOfMonth(selectedDate.getFullYear(), selectedDate.getMonth());
  const daysInMonth = getDaysInMonth(selectedDate.getFullYear(), selectedDate.getMonth());
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeks = [];
  let week = Array(firstDay).fill(null);
  days.forEach((day) => {
    if (week.length === 7) { weeks.push(week); week = []; }
    week.push(day);
  });
  if (week.length) weeks.push(week);

  return (
    <div className="p-4">
      {/* Header */}
      <p className="text-sm text-black">Users Registered via Google Form and Calendar Slot Selection</p>
      <div className="flex justify-between items-center mb-6">
        
        <h2 className="text-xl font-semibold">
          {selectedDate.toLocaleString("default", { month: "long" })} {selectedDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <Button onClick={() => handleNavigate(-1)} className="bg-themeGreen hover:bg-themeGreen text-white">
            Previous
          </Button>
          <Button onClick={() => handleNavigate(1)} className="bg-themeGreen hover:bg-themeGreen text-white">
            Next
          </Button>
        </div>
      </div>

      {/* Calendar Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse table-auto">
          <thead>
            <tr>
              {daysOfWeek.map((d) => (
                <th key={d} className="p-2 border border-gray-300 text-center font-semibold text-gray-700 bg-fuchsia-100">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((w, wi) => (
              <tr key={wi}>
                {w.map((day, di) => {
                  const dayEvents = day ? getEventsForDay(day) : [];
                  return (
                    <td
                      key={di}
                      className={`p-2 h-[120px] w-[200px] relative border border-gray-300 align-top ${
                        day ? "hover:bg-fuchsia-50 cursor-pointer" : "bg-gray-100"
                      }`}
                    >
                      <span className="text-sm text-gray-600">{day}</span>
                      <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                        {dayEvents.map((ev) => (
                          <div
                            key={ev.id}
                            onClick={() => setSelectedEvent(ev)}
                            className="text-xs text-white px-2 py-1 rounded truncate max-w-full"
                            style={{ backgroundColor: "#834ae9" }}
                          >
                            {ev.summary}
                          </div>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Event Detail Popup */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="bg-white p-6 rounded-lg md:w-100 w-full">
          <DialogTitle className="text-lg font-semibold mb-3">
            {selectedEvent?.summary}
          </DialogTitle>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex gap-2 items-center">
              <CalendarClock size={14} />
              <span>
                <strong>Start :</strong>{" "}
                {moment(selectedEvent?.start?.dateTime).format("DD MMM YYYY, hh:mm A")}
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <CalendarClock size={14} />
              <span>
                <strong>End :</strong>{" "}
                {moment(selectedEvent?.end?.dateTime).format("DD MMM YYYY, hh:mm A")}
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <Users size={14} />
              <span>
                <strong>Email</strong>
              </span>
            </div>
            <ul className="ml-6 list-disc space-y-1">
              {selectedEvent?.attendees
                ?.filter((a) => a.email !== "info@zenwellnesslounge.com")
                .map((a) => (
                  <li key={a.email} className="flex items-center gap-2">
                    {a.email}
                    {/* <span
                      className={`text-xs px-1 rounded ${
                        a.responseStatus === "accepted"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {a.responseStatus}
                    </span> */}
                  </li>
                ))}
            </ul>
          </div>
          <Button
            onClick={() => setSelectedEvent(null)}
            className="mt-4 w-full bg-themePurple hover:bg-themePurple text-white"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
