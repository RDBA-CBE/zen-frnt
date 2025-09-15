import React, { useState, useRef, useEffect, useMemo } from "react";
import moment from "moment";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Checkboxs from "../ui/singleCheckbox";
import { transformSlots } from "@/utils/function.utils";
import Models from "@/imports/models.import";

export default function BookingSlots({
  startDate,
  endDate,
  slotInterval = 60,
  getSlots,
  error,
  eventSlot = [],
  eventId,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [disabledSlots, setDisabledSlots] = useState({});
  const [availableSlots, setAvailableSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const disabled = {};

    eventSlot.forEach((event) => {
      const eventDate = moment(event.date).format("YYYY-MM-DD");
      const bookedSlots = [];

      event.slots.forEach((slot) => {
        if (slot.booked) {
          const timeSlot = slot.start_time.substring(0, 5); 
          bookedSlots.push(timeSlot);
        }
      });

      if (bookedSlots.length > 0) {
        disabled[eventDate] = bookedSlots;
      }
    });

    setDisabledSlots(disabled);
  }, [eventSlot]);

  useEffect(() => {
    if (selectedSlot) {
      getSlots(selectedSlot);
    } else {
      getSlots(null);
    }
  }, [selectedSlot]);

  useEffect(() => {
    setSelectedSlot(null);
    setSelectedDate(null);
  }, [eventId]);

  const days = useMemo(() => {
    const start = moment(startDate);
    const end = moment(endDate).add(1, "day");
    const arr = [];

    for (let m = moment(start); m.isBefore(end); m.add(1, "days")) {
      arr.push(moment(m));
    }

    return arr;
  }, [startDate, endDate]);

  const isToday = (date) => {
    return moment(date).isSame(moment(), "day");
  };

  const generateSlotsForDate = (date) => {
    // Check if the date is within the range
    const currentDate = moment(date);
    const start = moment(startDate);
    const end = moment(endDate);

    if (currentDate.isBefore(start) || currentDate.isAfter(end)) {
      return [];
    }

    return [];
  };

  const isPastTimeSlot = (time) => {
    if (!selectedDate || !isToday(selectedDate)) return false;

    const currentTime = moment();
    const slotTime = moment(time, "HH:mm");
    const currentDateTime = moment().set({
      hour: currentTime.hour(),
      minute: currentTime.minute(),
      second: currentTime.second(),
    });
    const slotDateTime = moment(selectedDate).set({
      hour: slotTime.hour(),
      minute: slotTime.minute(),
      second: 0,
    });

    return slotDateTime.isBefore(currentDateTime);
  };

  const toggleSlot = (date, slotTime, fullSlot) => {
    // Check if slot is disabled (booked)
    if (disabledSlots[date]?.includes(slotTime) || isPastTimeSlot(slotTime)) {
      return;
    }

    setSelectedSlot((prev) => {
      if (prev && prev.date === date && prev.slotTime === slotTime) {
        return null;
      }

      return {
        date,
        slotTime,
        fullSlot, 
      };
    });
  };

  const isDateDisabled = (date) => {
    const currentDate = moment().startOf("day"); 
    const targetDate = moment(date).startOf("day"); 

    return targetDate.isBefore(currentDate);
  };

  const handleDateSelect = async (date) => {
    try {
      if (isDateDisabled(date)) {
        return;
      }
      setSelectedDate(date);
      setLoading(true);

      const res = await Models.slot.list(eventId);

      if (res?.results?.length > 0) {
        const dateData = res.results.find(
          (d) => d.date === moment(date).format("YYYY-MM-DD")
        );

        if (dateData && dateData.slots) {
          const slotsWithFullData = dateData.slots.map((slot) => ({
            time: slot.start_time.substring(0, 5),
            fullSlot: slot,
          }));

          setAvailableSlots((prev) => ({
            ...prev,
            [date]: slotsWithFullData,
          }));
        } else {
          setAvailableSlots((prev) => ({
            ...prev,
            [date]: [],
          }));
        }
      } else {
        setAvailableSlots((prev) => ({
          ...prev,
          [date]: [],
        }));
      }
    } catch (error) {
      console.log("Error fetching slots:", error);
      setAvailableSlots((prev) => ({
        ...prev,
        [date]: [],
      }));
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const hasSelectedSlot = (date) => {
    return selectedSlot && selectedSlot.date === date;
  };

  const hasBookedSlots = (date) => {
    return disabledSlots[date] && disabledSlots[date].length > 0;
  };

  const getSlotsForSelectedDate = () => {
    return availableSlots[selectedDate] || [];
  };

  const currentDateSlots = getSlotsForSelectedDate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 w-full">
        <button
          onClick={() => scroll("left")}
          className="p-1 rounded-full hover:bg-gray-200"
        >
          <ChevronLeft size={28} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-hidden px-2 py-3 scroll-smooth snap-x snap-mandatory w-full"
        >
          {days.map((day) => {
            const formatted = day.format("YYYY-MM-DD");
            const isSelected = formatted === selectedDate;
            const hasSlot = hasSelectedSlot(formatted);
            const hasBooked = hasBookedSlots(formatted);
            const isPastDate = isDateDisabled(formatted);

            return (
              <div
                key={formatted}
                onClick={() => !isPastDate && handleDateSelect(formatted)}
                className={`min-w-[70px] p-2 text-center rounded-xl cursor-pointer snap-center 
                 ${
                   isPastDate
                     ? "bg-gray-200 text-gray-500 cursor-not-allowed opacity-60"
                     : isSelected
                     ? "bg-red-500 text-white font-bold"
                     : hasSlot
                     ? "bg-blue-100 text-black border border-blue-300"
                     : hasBooked
                     ? "bg-gray-300 text-gray-600 opacity-75"
                     : "bg-white-100 text-black"
                 }`}
              >
                <div className="text-sm">{day.format("ddd")}</div>
                <div className="text-lg">{day.format("D")}</div>
                {hasSlot && (
                  <div className="text-xs mt-1">{selectedSlot.slotTime}</div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => scroll("right")}
          className="p-1 rounded-full hover:bg-gray-200"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <h4 className="font-medium mb-3">Select Time Slot:</h4>
        {loading ? (
          <div className="text-center py-4">Loading slots...</div>
        ) : currentDateSlots.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {selectedDate
              ? "No slots available for this date"
              : "Select a date to see available slots"}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {currentDateSlots.map((slotData) => {
              const slotTime = slotData.time;
              const fullSlot = slotData.fullSlot;

              const isDisabled =
                disabledSlots[selectedDate]?.includes(slotTime);
              const isSelected =
                selectedSlot &&
                selectedSlot.date === selectedDate &&
                selectedSlot.slotTime === slotTime;

              const isPastTime = isPastTimeSlot(slotTime);

              return (
                <div
                  key={slotTime}
                  onClick={() =>
                    !isDisabled && toggleSlot(selectedDate, slotTime, fullSlot)
                  }
                  className={`p-2 text-center rounded-lg select-none transition-colors
                    ${
                      isDisabled
                        ? "bg-gray-400 text-white cursor-not-allowed opacity-60"
                        : isPastTime
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                        : isSelected
                        ? "bg-green-500 text-white font-bold cursor-pointer"
                        : "bg-gray-200 text-black cursor-pointer hover:bg-gray-300"
                    }`}
                >
                  {slotTime}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
