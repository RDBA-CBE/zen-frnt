"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./button";
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";
import moment from "moment";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import { useRouter } from "next/navigation";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  isFutureEvent,
  isOngoingEvent,
  isPastEvent,
  useSetState,
} from "@/utils/function.utils";
import { CalendarClock, XIcon } from "lucide-react";
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

const getLoungeTypeColor = (loungeTypeId) => {
  const colorMap = {
    15: "#e25197", // Ayurvedic One-on-One Counseling Lounge - Pink
    14: "#7f4099", // Yoga/Meditation Lounge - Purple
    7: "#834ae9", // Mentorship Lounge - Light Purple
    6: "#88c742", // Tales & Echoes Lounge - Green
  };

  return colorMap[loungeTypeId] || "#48badb"; // Default color
};

const AdminCalendar = ({ registrations }) => {
  const router = useRouter();

  const now = new Date();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
  });
  const [token, setToken] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [state, setState] = useSetState({
    categoryList: [],
    loading: false,
    lounge_type: null,
    role: null,
  });

  const getOrderCountsByDate = () => {
    const counts = {};

    registrations.forEach((registration) => {
      const date = moment(
        registration?.slot?.event_slot?.date || registration?.registration_date
      ).format("YYYY-MM-DD");
      counts[date] = (counts[date] || 0) + 1;
    });

    return counts;
  };

  // Add this state to store the order counts
  const [orderCounts, setOrderCounts] = useState({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      getRole();
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const Token = localStorage?.getItem("zentoken");
      setToken(Token);
    }
  }, []);

  // Update the order counts when registrations change
  useEffect(() => {
    setOrderCounts(getOrderCountsByDate());
  }, [registrations]);

  const getRole = async () => {
    try {
      const body = localStorage.getItem("group");
      setState({ role: body });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const getOrderCountForDay = (day) => {
    if (!day) return 0;

    const selectedDayDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      day
    );

    const formattedDate = moment(selectedDayDate).format("YYYY-MM-DD");
    return orderCounts[formattedDate] || 0;
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

    if (eventsForClickedDay.length > 0) {
      setModalIsOpen(true);
      setSelectedEvent({
        ...event,
        eventDate: moment(
          `${event?.start_date} ${event?.start_time}`,
          "YYYY-MM-DD HH:mm:ss"
        )?.toDate(),
      });
    } else {
      setModalIsOpen(false);
    }
  };

  // Save the event and close the modal
  const handleEnroll = () => {
    if (token) {
      if (selectedEvent) {
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

  const handleEditEvent = () => {
    if (token) {
      if (selectedEvent) {
        router.push(`/update-lounge?id=${selectedEvent.id}`);
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

    return registrations.filter((event) => {
      const eventStartDate = new Date(event.start_date);
      const eventEndDate = new Date(event.end_date);

      eventStartDate.setHours(0, 0, 0, 0);
      eventEndDate.setHours(0, 0, 0, 0);

      return (
        selectedDayDate >= eventStartDate && selectedDayDate <= eventEndDate
      );
    });
  };

  // Function to get registrations for a specific date
  const getRegistrationsForDate = (day) => {
    const selectedDayDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      day
    );

    const formattedDate = moment(selectedDayDate).format("YYYY-MM-DD");

    return registrations.filter((registration) => {
      // Check if slot exists and has event_slot with date
      if (registration.slot && registration.slot.event_slot) {
        return (
          moment(registration.slot.event_slot.date).format("YYYY-MM-DD") ===
          formattedDate
        );
      }

      // Fallback to registration_date if slot data is not available
      return (
        moment(registration.registration_date).format("YYYY-MM-DD") ===
        formattedDate
      );
    });
  };


  const handleOrderClick = (item) => {
    console.log("✌️item --->", item);
    if (item?.lounge_type?.id == AYURVEDIC_LOUNGE) {
      router.push(`/view-paid-order/?id=${item?.id}`);
    } else {
      router.push(`/view-order/?id=${item?.id}`);
    }
  };

  return (
    <div className="">
      <div className="flex gap-2 justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-left ">
            {new Date(selectedDate).toLocaleString("default", {
              month: "long",
            })}{" "}
            {selectedDate.getFullYear()}
          </h2>
        </div>
        <div className="flex gap-2  items-center">
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
                      className={`p-4 h-[120px] w-[200px] relative border border-gray-300 cursor-pointer ${
                        day ? "hover:bg-fuchsia-100" : "bg-gray-100"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-end">{day}</div>

                        {/* Show order count badge if count > 0 */}
                        {day && getOrderCountForDay(day) > 0 && (
                          <div className="absolute top-1 right-8 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {getOrderCountForDay(day)}
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
                                  // addNewEvent(cellDate);
                                }}
                                className="absolute top-1 right-1 ml-2 text-white bg-green-600 hover:bg-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm"
                              >
                                +
                              </button>
                            );
                          })()} 
                      </div>
                      {day && (
                        <div className="events-container overflow-y-auto max-h-[80px]">
                          <TooltipProvider>
                            {/* Show events for this date */}
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
                                                Session is currently in progress
                                              </h2>
                                              The selected session is{" "}
                                              <strong
                                                style={{ color: "green" }}
                                              >
                                                currently in progress{" "}
                                              </strong>{" "}
                                              and can no longer be accessed.
                                              Please select a session scheduled
                                              for a future date.
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
                                              Please select a session scheduled
                                              for a future date.
                                            </>
                                          );
                                        }
                                      }}
                                      className="event p-0 border rounded-lg mr-2 mb-1"
                                      style={{
                                        backgroundColor: getLoungeTypeColor(
                                          event.lounge_type?.id
                                        ),
                                      }}
                                    >
                                      <h4
                                        className={`text-xs text-white py-1 px-2 truncate max-w-[15ch]`}
                                      >
                                        {event.title}
                                      </h4>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="w-[300px]">
                                    <div className="flex flex-col flex-wrap mb-3 gap-x-2">
                                      <h4 className="font-bold text-[18px] leading-[22px] font-marce">
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
                                          ).format("hh:mm A")}{" "}
                                          (IST)
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
                                          ).format("hh:mm A")}{" "}
                                          (IST)
                                        </span>
                                      </div>
                                    </blockquote>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}

                            {/* Show registrations for this date */}
                            {getRegistrationsForDate(day).map(
                              (registration) => {
                                const event = registration.event;
                                return (
                                  <Tooltip key={registration.id}>
                                    <TooltipTrigger>
                                      <div
                                        className="event p-0 border rounded-lg mr-2 mb-1"
                                        style={{
                                          backgroundColor: getLoungeTypeColor(
                                            event.lounge_type?.id
                                          ),
                                          opacity: 0.7,
                                          border: "2px dashed white",
                                        }}
                                        onClick={() => handleOrderClick(event)}
                                      >
                                        <h4
                                          className={`text-xs text-white py-1 px-2 truncate max-w-[15ch]`}
                                        >
                                          {event.title}
                                        </h4>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="w-[300px]">
                                      <div className="flex flex-col flex-wrap mb-3 gap-x-2">
                                        <h4 className="font-bold text-[18px] leading-[22px] font-marce">
                                          {event.title}
                                        </h4>
                                        <p className="text-[15px] mt-1">
                                          {event.lounge_type?.name}
                                        </p>
                                        <div className="pt-3">
                                          <p className="text-sm text-white-600">
                                            Registered by:{" "}
                                            {registration.user.first_name}{" "}
                                            {registration.user.last_name}
                                          </p>
                                          <p className="text-sm text-white-600">
                                            Date:{" "}
                                            {moment(
                                              registration.slot == null
                                                ? registration.registration_date
                                                : registration?.slot?.event_slot
                                                    ?.date
                                            ).format("DD MMM YYYY")}
                                          </p>
                                          {registration.slot != null && (
                                            <p className="text-sm text-white-600">
                                              Slot:{" "}
                                              {registration?.slot?.start_time}
                                            </p>
                                          )}
                                          <p className="text-sm text-white-600">
                                            Status:{" "}
                                            {registration.registration_status}
                                          </p>
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              }
                            )}
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
                  )}{" "}
                  (IST)
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
                  )}{" "}
                  (IST)
                </span>
              </div>
            </div>
          </DialogTitle>
          <div className="flex gap-4 mt-4 w-full">
            <Button
              onClick={handleEnroll}
              className="flex-1 p-2 rounded bg-themePurple hover:bg-themePurple text-white"
            >
              Read More
            </Button>
            {selectedEvent?.eventDate > now && (
              <Button
                onClick={handleEditEvent}
                className="flex-1 p-2 rounded bg-themeGreen hover:bg-themeGreen text-white"
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

export default AdminCalendar;
