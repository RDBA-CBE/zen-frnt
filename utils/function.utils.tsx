import moment from "moment";
import { useState } from "react";
import { ROLES } from "./constant.utils";

export const useSetState = (initialState: any) => {
  const [state, setState] = useState(initialState);

  const newSetState = (newState: any) => {
    setState((prevState: any) => ({ ...prevState, ...newState }));
  };
  return [state, newSetState];
};

export const objIsEmpty = (obj: object) => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
};

export const capitalizeFLetter = (string = "") => {
  if (string.length > 0) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  return string;
};

export const Dropdown = (arr: any, label: string) => {
  const array = arr?.map((item: any) => ({
    value: item?.id,
    label: item[label],
  }));
  return array;
};

export const DropdownCode = (items, labelKey) => {
  return items?.map((item) => ({
    value: item?.id, // or whatever you use as unique value
    label: item?.[labelKey], // "name"
    code: item?.code, // <-- extra field
  }));
};

export const MultiDropdown = (arr: any, label: string) => {
  const array = arr?.map((item: any) => ({
    value: item?.id,
    name: item[label],
  }));
  return array;
};

export const UserDropdown = (arr: any, labelFn: (item: any) => string) => {
  const array = arr?.map((item: any) => ({
    value: item?.id,
    label: labelFn(item),
  }));
  return array;
};

export const getFileNameFromUrl = (url: string) => {
  const urlObject = new URL(url);
  const pathname = urlObject.pathname;
  const filename = pathname.substring(pathname.lastIndexOf("/") + 1);
  return filename;
};

export const convertUrlToFile = async (url: any, filename: any) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

export const isValidImageUrl = (url: string) => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
  return imageExtensions.some((ext) => url?.toLowerCase().endsWith(ext));
};

export const getTimeOnly = (date: Date | null) => {
  return date ? new Date(0, 0, 0, date.getHours(), date.getMinutes()) : null;
};

export const createTime = (date: Date | string | number | null) => {
  const source = date ? new Date(date) : new Date(); // ensure it's a Date object

  if (isNaN(source.getTime())) {
    // fallback in case the date is invalid
    const now = new Date();
    return new Date(0, 0, 0, now.getHours(), now.getMinutes());
  }

  return new Date(0, 0, 0, source.getHours(), source.getMinutes());
};

export const isToday = (date: Date | null) => {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const generateCalendar = (currentMonth) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const days = [];

  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  return days;
};

export const formatDate = (date) => {
  if (!date) return "";
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
};

export const formatNumber = (num) => {
  return Number(num) % 1 === 0 ? parseInt(num) : Number(num);
};

export const transformSlots = (data) => {
  return Object.entries(data).map(([date, slots]) => ({
    date,
    slot: slots,
  }));
};

export const timeFormat = (time) => {
  return time.length > 5 ? time.slice(0, 5) : time;
};

export const getUnmatchedSlots = (firstArr: any[], secondArr: any[]) => {
  return secondArr?.flatMap((event) => {
    const matchedDate = firstArr?.find((f) => f.date === event.date);

    if (!matchedDate) {
      return event.slots?.filter((slot) => !slot.booked);
    }

    const unmatchedSlots = event.slots?.filter((slot) => {
      if (slot.booked) return false;
      const slotTime = slot.start_time?.slice(0, 5);
      return !matchedDate.slot?.includes(slotTime);
    });

    return unmatchedSlots;
  });
};

export const formatTime = (minutes) => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} Hr${hours > 1 ? "s" : ""}`;
    } else {
      return `${hours} Hr${hours > 1 ? "s" : ""} ${remainingMinutes} Min${
        remainingMinutes > 1 ? "s" : ""
      }`;
    }
  } else {
    return `${minutes} Min${minutes > 1 ? "s" : ""}`;
  }
};

export const formatTimeRange = (date, time, intervalMinutes) => {
  // Combine date + time into one datetime string
  const start = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm:ss");
  const end = moment(start).add(intervalMinutes, "minutes");

  return `${start.format("MMMM D, YYYY")} at ${start.format(
    "h:mm A"
  )} - ${end.format("h:mm A")}`;
};

export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

export const isPastEvent = (event) => {
  const end = new Date(`${event.end_date}T${event.end_time}`);
  const now = new Date();
  return end < now;
};

export const isOngoingEvent = (event) => {
  const start = new Date(`${event.start_date}T${event.start_time}`);
  const end = new Date(`${event.end_date}T${event.end_time}`);
  const now = new Date();
  return now >= start && now <= end;
};

export const isFutureEvent = (event) => {
  const start = new Date(`${event.start_date}T${event.start_time}`);
  const now = new Date();
  return start > now;
};

export const extractZoomMeetingId = (url) => {
  if (!url || typeof url !== "string") return null;

  // try using the URL API if it's an absolute URL
  try {
    const u = new URL(url);

    // common pattern: /j/<meetingId>  (meetingId can include hyphens)
    let m = u.pathname.match(/\/j\/([0-9\-]+)/);
    if (m && m[1]) return m[1].replace(/\D/g, ""); // strip non-digits

    // sometimes meeting id sits directly in path segments (rare)
    m =
      u.pathname.match(/\/meeting\/([0-9\-]+)/) ||
      u.pathname.match(/\/m\/([0-9\-]+)/);
    if (m && m[1]) return m[1].replace(/\D/g, "");

    // fallback: look for a long digit sequence anywhere (9-13 digits)
    m = url.match(/([0-9]{9,13})/);
    return m ? m[1] : null;
  } catch (err) {
    // If URL() failed (maybe a partial string), fall back to regex on raw string
    let m = url.match(/\/j\/([0-9\-]+)/);
    if (m && m[1]) return m[1].replace(/\D/g, "");
    m = url.match(/([0-9]{9,13})/);
    return m ? m[1] : null;
  }
};

export const buildFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    // Arrays
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        formData.append(
          `${key}`,
          item instanceof File || item instanceof Blob ? item : String(item)
        );
      });
    }
    // Files / Blobs
    else if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    }
    // Objects → stringify
    else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    }
    // Primitives
    else {
      formData.append(key, String(value));
    }
  });

  return formData;
};

export const getTimeZone = (time) => {
  const tz = time.split(")")[1].trim();
  return tz;
};

export const getTime = (startDate, startTime) => {
  const date = new Date(startDate);
  const time = new Date(startTime);

  // Extract date components from the first date
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Extract time components from the second date
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const milliseconds = time.getMilliseconds();

  // Create new date with combined values
  const combinedDate = new Date(
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    milliseconds
  );
  return combinedDate;
};

export const extractTimeFromDateTime = (dateTimeString) => {
  if (!dateTimeString) return null;

  const timeMatch = dateTimeString.match(/(\d{1,2}):(\d{2}):(\d{2})/);
  if (timeMatch) {
    const [hours, minutes, seconds] = timeMatch[0].split(":").map(Number);
    const timeDate = new Date();
    timeDate.setHours(hours, minutes, seconds, 0);
    return timeDate;
  }

  return null;
};

export const formatDuration = (seconds: number | null | undefined) => {
  if (!seconds || seconds <= 0) return "";

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(seconds / 3600);

  if (hours > 0) {
    return `${hours} Hr${hours > 1 ? "s" : ""}`;
  } else {
    return `${minutes} Min${minutes > 1 ? "s" : ""}`;
  }
};

export const addHoursToTimeOnly = (startTime, hoursToAdd) => {
  console.log("✌️hoursToAdd --->", hoursToAdd);
  console.log("✌️startTime --->", startTime);
  const [hours, minutes, seconds] = startTime.split(":").map(Number);

  // Calculate new hours with 24-hour wrap-around
  const newHours = (hours + hoursToAdd) % 24;

  // Format back to HH:mm:ss
  const newTime = [
    newHours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");

  return newTime;
};

export const getHourOption = (startTime, endTime) => {
  const format = "HH:mm:ss";

  const start = moment(startTime, format);
  const end = moment(endTime, format);

  let totalHours = end.diff(start, "hours");

  if (totalHours <= 0) return null;

  const label = totalHours === 1 ? "1 Hr" : `${totalHours} Hrs`;

  return { value: totalHours, label };
};

export const isBeforeCurrentTimeBy30Min = (startDate, startTime) => {
  const startDateTime = moment(
    `${startDate} ${startTime}`,
    "YYYY-MM-DD HH:mm:ss"
  );
  const now = moment();

  // Enable 1 hour before start, and keep it true after
  const enableTime = startDateTime.clone().subtract(1, "hours");

  return now.isSameOrAfter(enableTime);
};

export const isRole = (role) => {
  const targetLabels = [ROLES.COUNSELOR, ROLES.MENTOR, ROLES.ALUMNI];
  const hasMatch = role.some((item) => targetLabels.includes(item.label));
  return hasMatch;
};

export const isMenOrAlumni = (role) => {
  const targetLabels = [ROLES.MENTOR, ROLES.ALUMNI];
  const hasMatch = role.some((item) => targetLabels.includes(item.label));
  return hasMatch;
};

export const isOnlyAlumniRole = (roles) => {
  const targetLabels = [ROLES.ALUMNI];

  return (
    roles.length > 0 &&
    roles.every((item) => targetLabels.includes(item.label)) &&
    roles.length ===
      roles.filter((item) => targetLabels.includes(item.label)).length
  );
};
