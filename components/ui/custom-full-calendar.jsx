"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./button"; // Custom button component
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip"; // Import Tooltip components
import Models from "@/imports/models.import";
import moment from "moment";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import { useRouter } from "next/navigation";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Dropdown, useSetState } from "@/utils/function.utils";
import CustomSelect from "../common-components/dropdown";
import { CalendarClock, XIcon } from "lucide-react";
import { Info } from "../common-components/toast";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Function to get the first day of the month (i.e., which day the 1st falls on)
const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

// Function to get the number of days in the month
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const CustomFullCalendar = ({ events, setEvents }) => {
  console.log("✌️events --->", events);
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
  });
  const [lougeList, setLoungeList] = useState([]); // store events data fetched from the API
  const [token, setToken] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [state, setState] = useSetState({
    categoryList: [],
    loading: false,
    lounge_type: null,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      getLoungeList(); // Fetch data when the component mounts
      getCategoryList();
    }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      getLoungeList(); // Fetch data when the component mounts
    }
  }, [state.lounge_type]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const Token = localStorage?.getItem("zentoken");
      setToken(Token);
    }
  }, []);

  const getLoungeList = async () => {
    try {
      let body = bodyData();
      const res = await Models.session.calendar(body);
      setLoungeList(res); // Update loungeList state with fetched data
      setEvents(res); // Also update events from the fetched data
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const getCategoryList = async () => {
    try {
      setState({ loading: true });

      const res = await Models.category.catDropDownList();
      const dropdowns = Dropdown(res?.results, "name");
      setState({ categoryList: dropdowns, loading: false });
    } catch (error) {
      setState({ loading: false });

      console.log("error: ", error);
    }
  };

  const bodyData = () => {
    let body = {};
    if (state.lounge_type) {
      body.lounge_type = state.lounge_type?.value;
    }

    return body;
  };

  // Navigate between months
  const handleNavigate = (monthOffset) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + monthOffset);
    setSelectedDate(newDate);
  };

  // Handle day click
  const handleDayClick = (day, event) => {
    console.log("event", event);

    const clickedDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      day
    );

    setNewEvent({ ...newEvent, date: clickedDate.toISOString().split("T")[0] });

    // Check if there are any events for the clicked day
    const eventsForClickedDay = getEventsForDate(day);
    console.log(eventsForClickedDay, "eventsForClickedDay");

    if (eventsForClickedDay.length > 0) {
      setModalIsOpen(true);
      setSelectedEvent(event);
      // setSelectedEvent(eventsForClickedDay[0]); // Store the first event
    } else {
      setModalIsOpen(false); // Close the modal if no events for that day
    }
  };

  console.log(selectedEvent, "selectedEvent");

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
      localStorage?.setItem("eventId", selectedEvent.id);
      router.push("/login");
    }
    setModalIsOpen(false);
  };

  // Get the first day of the month and the number of days in the month
  const firstDayOfMonth = getFirstDayOfMonth(
    selectedDate.getFullYear(),
    selectedDate.getMonth()
  );
  const daysInMonth = getDaysInMonth(
    selectedDate.getFullYear(),
    selectedDate.getMonth()
  );

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
    const selectedDayDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      day
    );

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
        selectedDayDate >= eventStartDate && selectedDayDate <= eventEndDate
      );
    });
  };

  const handleSignUp = () => {
    setModalIsOpen(false);
    router?.push("/student-registration");
  };
  const isPastEvent = (event) => {
    const end = new Date(`${event.end_date}T${event.end_time}`);
    const now = new Date();
    return end < now;
  };

  const isOngoingEvent = (event) => {
    const start = new Date(`${event.start_date}T${event.start_time}`);
    const end = new Date(`${event.end_date}T${event.end_time}`);
    const now = new Date();
    return now >= start && now <= end;
  };

  const isFutureEvent = (event) => {
    const start = new Date(`${event.start_date}T${event.start_time}`);
    const now = new Date();
    return start > now;
  };

  return (
    <div className="container mt-0 mx-auto calendar-wrapper md:p-4">
      
      {/* Calendar Header */}
      <div className="md:flex md:justify-between items-center mb-10">
        <div>
          <h2 className="text-xl font-semibold text-left ">
            {new Date(selectedDate).toLocaleString("default", {
              month: "long",
            })}{" "}
            {selectedDate.getFullYear()}
          </h2>
        </div>
        <div className="md:flex md:gap-10 ">
          <div className="md:w-[200px] w-full mb-2 md:mb-0">
            <CustomSelect
              options={state.categoryList}
              value={state.lounge_type?.value || ""}
              onChange={(value) => setState({ lounge_type: value })}
              placeholder="Lounge Type"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleNavigate(-1)}
              className="text-white bg-themeGreen hover:bg-themeGreen p-2 rounded"
            >
              Previous
            </Button>

            <Button
              onClick={() => handleNavigate(1)}
              className="text-white bg-themeGreen hover:bg-themeGreen p-2 rounded"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      {state.lounge_type && (
        <div className="text-start mb-5 flex">
          <div className="flex bg-themePurple px-2 py-1 rounded-lg ites-center">
            <p className=" text-xs text-white">{state.lounge_type?.label}</p>
            <XIcon
              className="text-white h-4 w-4 ml-2 pointer"
              onClick={() => setState({ lounge_type: null })}
            />
          </div>
        </div>
      )}

      <div className="flex justify-center items-center mb-8 flex-wrap gap-x-5 gap-y-2">
        <div className="flex items-center">
          <span className="event inline-block w-[15px] h-[15px] border rounded-lg mr-2 bg-[#8f87871f]"></span>
          <span className="text-black text-sm font-medium">
            Completed Events
          </span>
        </div>

        <div className="flex items-center">
          <span className="event inline-block w-[15px] h-[15px] border rounded-lg mr-2 bg-[#48badb]"></span>
          <span className="text-black text-sm font-medium">Ongoing Events</span>
        </div>

        <div className="flex items-center">
          <span className="event inline-block w-[15px] h-[15px] border rounded-lg mr-2 bg-[#7f4099]"></span>
          <span className="text-black text-sm font-medium">
            Meditation Lounge Events
          </span>
        </div>

        <div className="flex items-center ">
          <span className="event inline-block w-[15px] h-[15px] border rounded-lg mr-2 bg-[#e25197]"></span>
          <span className="text-black text-sm font-medium">
            Yoga Lounge Events
          </span>
        </div>

        <div className="flex items-center ">
          <span className="event inline-block w-[15px] h-[15px] border rounded-lg mr-2 bg-[#834ae9]"></span>
          <span className="text-black text-sm font-medium">
            Mentorship Lounge Events
          </span>
        </div>

        <div className="flex items-center">
          <span className="event inline-block w-[15px] h-[15px] border rounded-lg mr-2 bg-[#88c742]"></span>
          <span className="text-black text-sm font-medium">
            Tales & Echoes Lounge Events
          </span>
        </div>
      </div>

      {/* Calendar Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse table-auto">
          <thead>
            <tr>
              {daysOfWeek.map((day, index) => (
                <th
                  key={index}
                  className="p-2 border border-gray-300 text-center font-semibold text-gray-700 bg-fuchsia-100"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, index) => (
              <tr key={index}>
                {week?.map((day, dayIndex) => {
                  return (
                    <td
                      key={dayIndex}
                      className={`p-4 h-[100px] w-[200px] relative border border-gray-300 cursor-pointer ${
                        day ? "hover:bg-fuchsia-100" : "bg-gray-100"
                      }`}
                      // onClick={() => day && handleDayClick(day)}
                    >
                      <div className="text-end">{day}</div>
                      {/* Only show events for this specific day */}
                      {day && (
                        <div
                          className="events-container overflow-y-auto"
                          // style={{ position: "absolute", top: "10px", left: "10px" }}
                        >
                          <TooltipProvider>
                            {getEventsForDate(day).map((event) => {
                              return (
                                <Tooltip key={event.id}>
                                  <TooltipTrigger>
                                    <div
                                      onClick={() => {
                                        if (day && isFutureEvent(event)) {
                                          handleDayClick(day, event);
                                        } else if (isOngoingEvent(event)) {
                                          Info(
                                            <>
                                              The selected session is{" "}
                                              <strong
                                                style={{ color: "green" }}
                                              >
                                                currently in progress{" "}
                                              </strong>{" "}
                                              and can no longer be accessed.
                                              Please select a session scheduled
                                              for a future date. For more
                                              information or assistance, feel
                                              free to contact the admin at
                                              viji.zenwellnesslounge@gmail.com.
                                            </>
                                          );
                                        } else if (isPastEvent(event)) {
                                          Info(
                                            <>
                                              The selected session has already{" "}
                                              <strong
                                                style={{ color: "green" }}
                                              >
                                                concluded
                                              </strong>{" "}
                                              and is no longer accessible.
                                              Please select a session scheduled
                                              for a future date. For more
                                              information or assistance, feel
                                              free to contact the admin at
                                              viji.zenwellnesslounge@gmail.com.
                                            </>
                                          );
                                        }
                                      }}
                                      className="event p-0 border  rounded-lg bg-fuchsia-900 mr-2"
                                      style={{
                                        backgroundColor: isPastEvent(event)
                                          ? "#8f87871f"
                                          : isOngoingEvent(event)
                                          ? "#48badb"
                                          : event.lounge_type?.id === 11
                                          ? "#7f4099" // fuchsia-900 hex color
                                          : event.lounge_type?.id === 6
                                          ? "#88c742" // fuchsia-500 hex color
                                          : event.lounge_type?.id === 7
                                          ? "#834ae9" // fuchsia-300 hex color
                                          : event.lounge_type?.id === 8
                                          ? "#e25197" // fuchsia-100 hex color
                                          : "#023e98",
                                      }}
                                    >
                                      <h4
                                        className={`text-xs ${
                                          isPastEvent(event)
                                            ? "text-black"
                                            : "text-white"
                                        } py-1 px-2 truncate max-w-[15ch]`}
                                      >
                                        {event.title}
                                      </h4>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="w-[300px]">
                                    <div className="flex flex-col flex-wrap mb-3 gap-x-2">
                                      <h4 className="font-bold text-[18px] leading-[22px]  font-marce">
                                        {event.title}
                                      </h4>
                                      <p className="text-[15px] mt-1">
                                        {event.lounge_type?.name}
                                      </p>
                                    </div>

                                    <blockquote className="mb-2 border-l-2 pl-6 ">
                                      <div className="flex gap-1 mb-4">
                                        <span className="flex gap-1 ">
                                          <CalendarClock
                                            height={14}
                                            width={14}
                                            className="relative top-[0px]"
                                          />{" "}
                                          Starts -
                                        </span>
                                        <span className="font-bold">
                                          {moment(event.start_date).format(
                                            "DD MMM YYYY"
                                          )}
                                          , {""}
                                          {moment(
                                            event.start_time,
                                            "HH:mm:ss"
                                          ).format("hh:mm A")}
                                        </span>{" "}
                                      </div>

                                      <div className="flex gap-x-1">
                                        <span className="flex gap-1">
                                          <CalendarClock
                                            height={14}
                                            width={14}
                                            className="relative top-[0px]"
                                          />
                                          Ends -{" "}
                                        </span>
                                        <span className="font-bold ">
                                          {moment(event.end_date).format(
                                            "DD MMM YYYY"
                                          )}
                                          , {""}
                                          {moment(
                                            event?.end_time,
                                            "HH:mm:ss"
                                          ).format("hh:mm A")}
                                        </span>
                                      </div>
                                    </blockquote>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </TooltipProvider>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Event Modal */}
      <Dialog open={modalIsOpen} onOpenChange={setModalIsOpen}>
        <DialogContent className="bg-white p-6 rounded-lg md:w-96 w-full">
          <DialogTitle className="text-lg font-semibold mb-2">
            {/* Here you can enroll or sign up for the course. */}
            <div className="flex flex-col flex-wrap mb-2 gap-x-2">
              <p className="font-[400] text-[25px] leading-[22px]  font-marce">
                {selectedEvent?.title}
              </p>
              <p
                className="font-[400] text-[14px] leading-[22px]"
                style={{ paddingTop: "4px" }}
              >
                {" "}
                {selectedEvent?.lounge_type?.name}
              </p>
            </div>

            <div className="font-[400]" style={{ fontSize: "15px" }}>
              <div className="flex gap-x-1">
                <span className="flex gap-1 ">
                  <CalendarClock
                    height={14}
                    width={14}
                    className="relative top-[7px]"
                  />{" "}
                  Starts -
                </span>
                <span className="font-bold" style={{ color: "#4a4a4a" }}>
                  {moment(selectedEvent?.start_date).format("DD MMM YYYY")},{" "}
                  {""}
                  {moment(selectedEvent?.start_time, "HH:mm:ss").format(
                    "hh:mm A"
                  )}
                </span>{" "}
              </div>
              <div className="flex gap-x-1">
                <span className="flex gap-1">
                  <CalendarClock
                    height={14}
                    width={14}
                    className="relative top-[7px]"
                  />
                  Ends -{" "}
                </span>
                <span className="font-bold " style={{ color: "#4a4a4a" }}>
                  {moment(selectedEvent?.end_date).format("DD MMM YYYY")}, {""}
                  {moment(selectedEvent?.end_time, "HH:mm:ss").format(
                    "hh:mm A"
                  )}
                </span>
              </div>
            </div>
          </DialogTitle>
          <Button
            onClick={handleEnroll}
            className="p-2 rounded bg-themePurple hover:bg-themePurple text-white"
          >
            Read More
          </Button>
          {/* <Button
            onClick={handleSignUp}
            className="p-2 rounded bg-themeGreen hover:bg-themeGreen text-white"
          >
            Sign Up
          </Button> */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomFullCalendar;
