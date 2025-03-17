"use client"
import React, { useEffect, useState } from "react";
import { Button } from "./button"; // Custom button component
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip"; // Import Tooltip components
import Models from "@/imports/models.import";
import moment from "moment";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import { useRouter } from "next/navigation";
import { TooltipProvider } from "@radix-ui/react-tooltip";

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Function to get the first day of the month (i.e., which day the 1st falls on)
const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
};

// Function to get the number of days in the month
const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

const CustomFullCalendar = ({ events, setEvents }) => {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: "", description: "", date: "" });
    const [lougeList, setLoungeList] = useState([]); // store events data fetched from the API
    const [token, setToken] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            getLoungeList(); // Fetch data when the component mounts
        }
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const Token = localStorage?.getItem("token");
            setToken(Token);
        }
    }, []);

    const getLoungeList = async () => {
        try {
            const res = await Models.session.calendar();
            setLoungeList(res.results); // Update loungeList state with fetched data
            setEvents(res.results); // Also update events from the fetched data
        } catch (error) {
            console.log("error: ", error);
        }
    };

    // Navigate between months
    const handleNavigate = (monthOffset) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + monthOffset);
        setSelectedDate(newDate);
    };

    // Handle day click
    const handleDayClick = (day) => {
        const clickedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
        setNewEvent({ ...newEvent, date: clickedDate.toISOString().split("T")[0] });

        // Check if there are any events for the clicked day
        const eventsForClickedDay = getEventsForDate(day);
        if (eventsForClickedDay.length > 0) {
            setModalIsOpen(true); // Open the modal if there are events for the selected day
            setSelectedEvent(eventsForClickedDay[0]); // Store the first event
        } else {
            setModalIsOpen(false); // Close the modal if no events for that day
        }
    };

    // Handle form input changes for new events
    const handleEventChange = (e) => {
        const { name, value } = e.target;
        setNewEvent({ ...newEvent, [name]: value });
    };

    // Save the event and close the modal
    const handleEnroll = () => {
        if (token) {
            if (selectedEvent) {
                // Use the event ID and pass it dynamically to the URL
                router.push(`/view-wellness-lounge?id=${selectedEvent.id}`);
            } else {
                console.log("No event selected.");
            }
        } else {
            router.push("/login");
        }
        setModalIsOpen(false);
    };

    // Get the first day of the month and the number of days in the month
    const firstDayOfMonth = getFirstDayOfMonth(selectedDate.getFullYear(), selectedDate.getMonth());
    const daysInMonth = getDaysInMonth(selectedDate.getFullYear(), selectedDate.getMonth());

    // Generate an array of the days of the current month
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Generate the weeks with empty slots before the first day of the month
    const weeks = [];
    let currentWeek = Array(firstDayOfMonth).fill(null); // Fill empty slots before the first day
    days.forEach((day) => {
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
        currentWeek.push(day);
    });
    if (currentWeek.length) {
        weeks.push(currentWeek);
    }

    // Function to filter events for the selected date
    const getEventsForDate = (day) => {
        const selectedDayDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);

        // Set the time of selectedDayDate to midnight (00:00:00)
        selectedDayDate.setHours(0, 0, 0, 0);

        return events.filter((event) => {
            const eventStartDate = new Date(event.start_date);
            const eventEndDate = new Date(event.end_date);

            // Set the time of eventStartDate and eventEndDate to midnight
            eventStartDate.setHours(0, 0, 0, 0);
            eventEndDate.setHours(0, 0, 0, 0);

            // Check if the selectedDayDate is within the event's start and end date range
            return (
                selectedDayDate >= eventStartDate &&
                selectedDayDate <= eventEndDate
            );
        });
    };

    const handleSignUp = (() => {
        setModalIsOpen(false);
        router?.push("/student-registration");
    });

    return (
        <div className="container mx-auto calendar-wrapper p-4">
            {/* Calendar Header */}
            <div className="calendar-header flex justify-between items-center mb-4">
                <Button onClick={() => handleNavigate(-1)} className="bg-blue-500 text-white p-2 rounded">
                    Previous
                </Button>
                <h2 className="text-xl font-semibold">
                    {new Date(selectedDate).toLocaleString("default", { month: "long" })} {selectedDate.getFullYear()}
                </h2>
                <Button onClick={() => handleNavigate(1)} className="bg-blue-500 text-white p-2 rounded">
                    Next
                </Button>
            </div>

            {/* Calendar Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse table-auto">
                    <thead>
                        <tr>
                            {daysOfWeek.map((day, index) => (
                                <th
                                    key={index}
                                    className="p-2 border border-gray-300 text-center font-semibold text-gray-700 bg-gray-200"
                                >
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {weeks.map((week, index) => (
                            <tr key={index} >
                                {week.map((day, dayIndex) => (
                                    <td
                                        key={dayIndex}
                                        className={`p-4 h-[100px] w-[200px] relative border border-gray-300 cursor-pointer ${day ? "hover:bg-blue-100" : "bg-gray-100"
                                            }`}
                                        onClick={() => day && handleDayClick(day)}
                                    >
                                        <div className="text-end">{day}</div>
                                        {/* Only show events for this specific day */}
                                        {day && (
                                            <div
                                                className="events-container overflow-y-auto"
                                            // style={{ position: "absolute", top: "10px", left: "10px" }}
                                            >
                                                <TooltipProvider>
                                                    {getEventsForDate(day).map((event) => (
                                                        <Tooltip key={event.id}>
                                                            <TooltipTrigger>
                                                                <div className="event p-0 border border-gray-300 rounded-lg bg-gray-50 mr-2">
                                                                    <h4 className="text-xs text-gray-800 py-1 px-2">{event.title}</h4>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="w-[300px]">
                                                                <h4 className="font-bold text-[18px] leading-[22px] mb-2">
                                                                    {event.title} - {event.lounge_type?.name}
                                                                </h4>
                                                                <blockquote className="mb-2 border-l-2 pl-6 italic">
                                                                    Event Start Date and Time{" "}
                                                                    <span className="font-bold">{moment(event.start_date).format("YYYY-MMM-DD")}, {event.start_time}</span>
                                                                    <br />
                                                                    End Date and Time{" "}
                                                                    <span className="font-bold">{moment(event.end_date).format("YYYY-MMM-DD")}, {event.end_time}</span>
                                                                </blockquote>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    ))}
                                                </TooltipProvider>
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Event Modal */}
            <Dialog open={modalIsOpen} onOpenChange={setModalIsOpen}>
                <DialogContent className="bg-white p-6 rounded-lg w-96">
                    <DialogTitle className="text-lg font-semibold mb-2">Here you can enroll or sign up for the course.</DialogTitle>
                    <Button onClick={handleEnroll} className="p-2 rounded bg-blue-500 text-white">
                        Enroll
                    </Button>
                    <Button onClick={handleSignUp} className="p-2 rounded bg-gray-500 text-white">
                        Sign Up
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CustomFullCalendar;
