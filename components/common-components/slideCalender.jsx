import React, { useState, useRef, useEffect, useMemo } from "react";
import moment from "moment";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Checkboxs from "../ui/singleCheckbox";
import { transformSlots } from "@/utils/function.utils";

export default function SlideCalender({
  startDate,
  endDate,
  slotInterval = 60,
  getSlots,
  error,
  eventSlot = [],
}) {
  const [selectedDate, setSelectedDate] = useState(
    moment(startDate).format("YYYY-MM-DD")
  );

  const [selectedSlots, setSelectedSlots] = useState({});
  const [disabledSlots, setDisabledSlots] = useState({});
  const [applyAll, setApplyAll] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (selectedSlots && Object.keys(selectedSlots).length > 0) {
      getSlots(transformSlots(selectedSlots));
    }
  }, [selectedSlots]);

  useEffect(() => {
    const initialSlots = {};
    const disabled = {};
    const start = moment(startDate);
    const end = moment(endDate);

    for (let m = moment(start); m.isSameOrBefore(end); m.add(1, "days")) {
      const formatted = m.format("YYYY-MM-DD");
      initialSlots[formatted] = [];
      disabled[formatted] = [];
    }

    eventSlot.forEach((event) => {
      const eventDate = moment(event.date).format("YYYY-MM-DD");

      if (initialSlots.hasOwnProperty(eventDate)) {
        const availableSlots = [];
        const bookedSlots = [];

        event.slots.forEach((slot) => {
          const timeSlot = slot.start_time.substring(0, 5);
          if (slot.booked) {
            bookedSlots.push(timeSlot);
          } else {
            availableSlots.push(timeSlot);
          }
        });

        initialSlots[eventDate] = availableSlots;
        disabled[eventDate] = bookedSlots;
      }
    });

    setSelectedSlots((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(initialSlots)) {
        return initialSlots;
      }
      return prev;
    });

    setDisabledSlots((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(disabled)) {
        return disabled;
      }
      return prev;
    });
  }, [startDate, endDate, eventSlot]);

  useEffect(() => {
    if (eventSlot?.length < 0 && slotInterval) {
      setSelectedSlots((prev) => {
        const resetSlots = {};
        Object.keys(prev).forEach((date) => {
          resetSlots[date] = [];
        });
        return resetSlots;
      });
    }
  }, [slotInterval]);

  const days = useMemo(() => {
    const start = moment(startDate);
    const end = moment(endDate).add(1, "day"); // Include the end date
    const arr = [];

    for (let m = moment(start); m.isBefore(end); m.add(1, "days")) {
      arr.push(moment(m));
    }

    return arr;
  }, [startDate, endDate]);

  const generateSlots = () => {
    const slots = [];
    let time = moment("09:00", "HH:mm");
    const endTime = moment("18:00", "HH:mm");
    while (time.isBefore(endTime)) {
      slots.push(time.format("HH:mm"));
      time.add(slotInterval, "minutes");
    }
    return slots;
  };

  const slots = generateSlots();

  const toggleSlot = (date, slot) => {
    if (disabledSlots[date]?.includes(slot)) {
      return; // prevent editing disabled slots
    }

    setSelectedSlots((prev) => {
      const currentSlots = prev[date] || [];
      let updatedSlots;

      if (currentSlots.includes(slot)) {
        updatedSlots = currentSlots.filter((s) => s !== slot);
      } else {
        updatedSlots = [...currentSlots, slot];
      }

      if (applyAll) {
        const allDatesUpdate = {};
        days.forEach((d) => {
          const formatted = d.format("YYYY-MM-DD");
          allDatesUpdate[formatted] = updatedSlots;
        });
        return allDatesUpdate;
      }

      return { ...prev, [date]: updatedSlots };
    });
  };

  // useEffect(() => {
  //   if (applyAll) {
  //     const slotsForSelected = selectedSlots[selectedDate] || [];
  //     const allDatesUpdate = {};
  //     days.forEach((d) => {
  //       const formatted = d.format("YYYY-MM-DD");
  //       allDatesUpdate[formatted] = slotsForSelected;
  //     });

  //     const isSame =
  //       JSON.stringify(allDatesUpdate) === JSON.stringify(selectedSlots);
  //     if (!isSame) setSelectedSlots(allDatesUpdate);
  //   }
  // }, [applyAll, selectedDate, days, selectedSlots]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center gap-2">
        <Checkboxs
          label={" Apply selected slots to all dates"}
          checked={applyAll}
          onChange={(val) => {
            setApplyAll(val);
          }}
        />
      </div> */}

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
            const hasSlots = selectedSlots[formatted]?.length > 0;

            return (
              <div
                key={formatted}
                onClick={() => setSelectedDate(formatted)}
                className={`min-w-[70px] p-2 text-center rounded-xl cursor-pointer snap-center 
                  ${
                    isSelected
                      ? "bg-red-500 text-white font-bold"
                      : hasSlots
                      ? "bg-blue-100 text-black border border-blue-300"
                      : "bg-gray-100 text-black"
                  }`}
              >
                <div className="text-sm">{day.format("ddd")}</div>
                <div className="text-lg">{day.format("D")}</div>
                {hasSlots && (
                  <div className="text-xs mt-1">
                    {selectedSlots[formatted].length} slots
                  </div>
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
      {error && <p className=" text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {slots?.map((slot) => {
          const isSelected = selectedSlots[selectedDate]?.includes(slot);
          const isDisabled = disabledSlots[selectedDate]?.includes(slot);

          return (
            <div
              key={slot}
              onClick={() => toggleSlot(selectedDate, slot)}
              className={`p-2 text-center rounded-lg select-none 
                ${
                  isDisabled
                    ? "bg-gray-400 text-white cursor-not-allowed opacity-60"
                    : isSelected
                    ? "bg-green-500 text-white font-bold cursor-pointer"
                    : "bg-gray-200 text-black cursor-pointer"
                }`}
            >
              {slot}
            </div>
          );
        })}
      </div>
    </div>
  );
}
