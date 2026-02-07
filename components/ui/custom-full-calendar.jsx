"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./button";
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";
import Models from "@/imports/models.import";
import moment from "moment";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import { useRouter } from "next/navigation";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Dropdown, isBeforeCurrentTimeBy30Min, useSetState } from "@/utils/function.utils";
import CustomSelect from "../common-components/dropdown";
import {
  Calendar1,
  CalendarClock,
  Clock,
  Clock10,
  MapPin,
  XIcon,
} from "lucide-react";
import { Info } from "../common-components/toast";
import { AYURVEDIC_LOUNGE } from "@/utils/constant.utils";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const CustomFullCalendar = ({ events, setEvents }) => {
  const router = useRouter();

  const now = new Date();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
  });
  const [lougeList, setLoungeList] = useState([]);
  const [token, setToken] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [state, setState] = useSetState({
    categoryList: [],
    loading: false,
    lounge_type: null,
    role: null,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      getLoungeList();
      getCategoryList();
      getRole();
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      getLoungeList();
    }
  }, [state.lounge_type]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const Token = localStorage?.getItem("zentoken");
      setToken(Token);
    }
  }, []);

  const getRole = async () => {
    try {
      let body = localStorage.getItem("group");
      console.log("✌️body --->", body);
      setState({ role: body });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const getLoungeList = async () => {
    try {
      let body = bodyData();
      const res = await Models.session.activeCalendar(body);
      setLoungeList(res);
      setEvents(res);
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
      setSelectedEvent({
        ...event,
        eventDate: moment(
          `${event?.start_date} ${event?.start_time}`,
          "YYYY-MM-DD HH:mm:ss" // adjust format based on your data
        )?.toDate(),
      });
      // setSelectedEvent(eventsForClickedDay[0]); // Store the first event
    } else {
      setModalIsOpen(false); // Close the modal if no events for that day
    }
  };

  // Save the event and close the modal
  const handleEnroll = () => {
    console.log("✌️selectedEvent --->", selectedEvent);

    if (token) {
      if (selectedEvent) {
        if (selectedEvent?.lounge_type?.id == AYURVEDIC_LOUNGE) {
          router.push(`/view-wellness-lounges?id=${selectedEvent.id}`);
        } else {
          router.push(`/view-wellness-lounge?id=${selectedEvent.id}`);
        }
      } else {
        console.log("No event selected.");
      }
    } else {
      localStorage?.setItem("eventId", selectedEvent.id);
      router.push("/login");
    }
    setModalIsOpen(false);
  };

  const handleEditEvent = () => {
     if (token) {
       const isEventBefore30Mins = isBeforeCurrentTimeBy30Min(
         selectedEvent?.start_date,
         selectedEvent?.start_time
       );
 
       const startDate = selectedEvent?.start_date;
       const startTime = selectedEvent?.start_time;
 
       if (!startDate || !startTime) {
         return "The event start time is not available";
       }
 
       const formattedDate = moment(startDate).format("DD-MM-YYYY");
       const formattedTime = moment(startTime, "HH:mm:ss").format("hh:mm A");
 
       if (isEventBefore30Mins) {
         Failure(
           `Session update can be enable only before 1 hour from event start time (${formattedDate} ${formattedTime})`
         );
       } else {
         console.log("selectedEvent", selectedEvent);
 
         if (selectedEvent) {
           router.push(`/update-lounge?id=${selectedEvent.id}`);
         } else {
           console.log("No event selected.");
         }
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
  let currentWeek = Array(firstDayOfMonth).fill(null);
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

    selectedDayDate.setHours(0, 0, 0, 0);

    return events.filter((event) => {
      const eventStartDate = new Date(event.start_date);
      const eventEndDate = new Date(event.end_date);

      eventStartDate.setHours(0, 0, 0, 0);
      eventEndDate.setHours(0, 0, 0, 0);

      return (
        selectedDayDate >= eventStartDate && selectedDayDate <= eventEndDate
      );
    });
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

  const addNewEvent = (clickedDate) => {
    const dateToUse = clickedDate || selectedDate;
    const now = new Date();
    const finalDate = new Date(dateToUse);
    finalDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    const formattedDate = moment(finalDate).format("DD-MM-YYYY HH:mm:ss");

    router.push(
      `/create-wellness-lounge?date=${encodeURIComponent(formattedDate)}`
    );
  };

  return (
    <div className="container mt-0 mx-auto calendar-wrapper md:p-4">
      {/* Calendar Header */}
      <div className="md:flex md:justify-between items-center  mb-6 md:mb-10">
        <div className="mb-5 md:mb-0 ">
          <h2 className="text-xl font-semibold text-left ">
            {new Date(selectedDate).toLocaleString("default", {
              month: "long",
            })}{" "}
            {selectedDate.getFullYear()}
          </h2>
        </div>
        <div className="md:flex md:gap-10 ">
          <div className="md:w-[200px] w-full mb-5 md:mb-0">
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

      <div className="flex justify-start md:justify-center items-center mb-8 flex-wrap gap-x-5 gap-y-2">
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
        {state.categoryList?.map((item, index) => (
          <div className="flex items-center " key={index}>
            <span
              className="event inline-block w-[15px] h-[15px] border rounded-lg mr-2"
              style={{
                backgroundColor:
                  item?.value == 22
                    ? "#e25197"
                    : item?.value == 14
                    ? "#7f4099"
                    : item?.value == 7
                    ? "#834ae9"
                    : item?.value == 6
                    ? "#88c742"
                    : "#48badb",
              }}
            ></span>

            <span className="text-black text-sm font-medium">
              {item?.label} Events
            </span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse table-auto rounded-lg">
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
                      className={`p-1 h-[100px] w-[200px] relative border border-gray-300 cursor-pointer ${
                        day ? "hover:bg-fuchsia-100" : "bg-gray-100"
                      }`}
                    >
                      <div className="flex justify-between items-start h-full">
                        <div className="text-end">{day}</div>
                        {day && (
                          <div className="events-container overflow-y-auto  w-full h-full max-h-[100px] flex justify-center items-center flex-wrap scrollbar-thin">
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
                                                <h2 className="text-black font-bold text-[15px] mb-3">
                                                  Session is currently in
                                                  progress
                                                </h2>
                                                The selected session is{" "}
                                                <strong
                                                  style={{ color: "green" }}
                                                >
                                                  currently in progress{" "}
                                                </strong>{" "}
                                                and can no longer be accessed.
                                                Please select a session
                                                scheduled for a future date. For
                                                more information or assistance,
                                                feel free to contact the admin
                                                at
                                                viji.zenwellnesslounge@gmail.com.
                                              </>
                                            );
                                          } else if (isPastEvent(event)) {
                                            Info(
                                              <>
                                                <h2 className="font-bold text-[15px] text-black mb-3">
                                                  Session has already concluded
                                                </h2>
                                                The selected session has already{" "}
                                                <strong
                                                  style={{ color: "green" }}
                                                >
                                                  concluded
                                                </strong>{" "}
                                                and is no longer accessible.
                                                Please select a session
                                                scheduled for a future date. For
                                                more information or assistance,
                                                feel free to contact the admin
                                                at
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
                                            : event.lounge_type?.id === 22
                                            ? "#e25197"
                                            : event.lounge_type?.id === 14
                                            ? "#7f4099"
                                            : event.lounge_type?.id === 6
                                            ? "#88c742"
                                            : event.lounge_type?.id === 7
                                            ? "#834ae9"
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
                                            <Calendar1
                                              height={14}
                                              width={14}
                                              className="relative top-[0px]"
                                            />{" "}
                                            Date -
                                          </span>
                                          <span className="font-bold">
                                            {moment(event.start_date).format(
                                              "DD MMM YYYY"
                                            )}
                                          </span>{" "}
                                        </div>

                                        <div className="flex gap-x-1 mb-4">
                                          <span className="flex gap-1">
                                            <Clock
                                              height={14}
                                              width={14}
                                              className="relative top-[0px]"
                                            />
                                            Start Time -{" "}
                                          </span>
                                          <span className="font-bold ">
                                            {moment(
                                              event?.start_time,
                                              "HH:mm:ss"
                                            ).format("hh:mm A")}{" "}
                                            (IST)
                                          </span>
                                        </div>

                                        <div className="flex gap-x-1 mb-4">
                                          <span className="flex gap-1">
                                            <Clock10
                                              height={14}
                                              width={14}
                                              className="relative top-[0px]"
                                            />
                                            End Time -{" "}
                                          </span>
                                          <span className="font-bold ">
                                            {moment(
                                              event?.end_time,
                                              "HH:mm:ss"
                                            ).format("hh:mm A")}{" "}
                                            (IST)
                                          </span>
                                        </div>
                                        <div className="flex gap-x-1 mb-4">
                                          <span className="flex gap-1">
                                            <MapPin
                                              height={14}
                                              width={14}
                                              className="relative top-[0px]"
                                            />
                                            Venue -{" "}
                                          </span>
                                          <span className="font-bold ">
                                            {`${event?.venue?.name}`}

                                            {/* {`${event?.venue?.university_name} (${event?.venue?.name})`} */}
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
                        {state.role == "Admin" &&
                          (() => {
                            if (!day) return null;

                            const cellDate = new Date(
                              selectedDate.getFullYear(),
                              selectedDate.getMonth(),
                              day
                            );

                            const showAdd = moment(cellDate)
                              .endOf("day")
                              .isSameOrAfter(moment());
                            if (!showAdd) return null;

                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addNewEvent(cellDate);
                                }}
                                className="absolute top-1 right-1 ml-2 text-white bg-green-600 hover:bg-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm"
                              >
                                +
                              </button>
                            );
                          })()}
                      </div>
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
                  <Calendar1
                    height={14}
                    width={14}
                    className="relative top-[7px]"
                  />{" "}
                  Date -
                </span>
                <span className="font-bold" style={{ color: "#4a4a4a" }}>
                  {moment(selectedEvent?.start_date).format("DD MMM YYYY")},{" "}
                </span>{" "}
              </div>
              <div className="flex gap-x-1">
                <span className="flex gap-1">
                  <Clock
                    height={14}
                    width={14}
                    className="relative top-[7px]"
                  />
                  Start Time -{" "}
                </span>
                <span className="font-bold " style={{ color: "#4a4a4a" }}>
                  {moment(selectedEvent?.start_time, "HH:mm:ss").format(
                    "hh:mm A"
                  )}{" "}
                  (IST)
                </span>
              </div>

              <div className="flex gap-x-1">
                <span className="flex gap-1">
                  <Clock10
                    height={14}
                    width={14}
                    className="relative top-[7px]"
                  />
                  End Time -{" "}
                </span>
                <span className="font-bold " style={{ color: "#4a4a4a" }}>
                  {moment(selectedEvent?.end_time, "HH:mm:ss").format(
                    "hh:mm A"
                  )}{" "}
                  (IST)
                </span>
              </div>

              <div className="flex gap-x-1">
                <span className="flex gap-1">
                  <MapPin
                    height={14}
                    width={14}
                    className="relative top-[7px]"
                  />
                  Venue -{" "}
                </span>
                <span className="font-bold " style={{ color: "#4a4a4a" }}>
                  {`${selectedEvent?.venue?.name}`}

                  {/* {`${selectedEvent?.venue?.university_name} (${selectedEvent?.venue?.name})`} */}
                </span>
              </div>
            </div>
          </DialogTitle>
          <div className="flex gap-4 mt-4 w-full">
            <Button
              onClick={handleEnroll}
              className="flex-1 p-2 rounded bg-themePurple hover:bg-[#b382c7] text-white"
            >
              Read More
            </Button>
            {selectedEvent?.eventDate > now && state.role == "Admin" && (
              <Button
                onClick={handleEditEvent}
                className="flex-1 p-2 rounded bg-themeGreen hover:bg-[#a9e06b] text-white"
              >
                Edit Session
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomFullCalendar;
