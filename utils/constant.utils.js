export const BASEURL = "https://zenbkad.zenwellnesslounge.com/api";

export const AYURVEDIC_LOUNGE = 15;

export const CLIENT_ID =
  "652976835328-gr64duovnelh6j0tmts52huqa7aiodrc.apps.googleusercontent.com";

export const welness_data = [
  {
    id: 1,
    img: "https://github.com/shadcn.png",
    title: "Yoga",
    price: "20000",
    duration: "30 Days",
    lounge_type: "Online",
    opening_date: "09-12-2024",
    closing_date: "20-02-2025",
    status: "Publish",
  },
  {
    id: 2,
    img: "https://github.com/shadcn.png",
    title: "Pilates",
    price: 25000,
    duration: "45 Days",
    lounge_type: "Offline",
    opening_date: "15-01-2025",
    closing_date: "28-02-2025",
    status: "Draft",
  },
  {
    id: 3,
    img: "https://github.com/shadcn.png",
    title: "Zumba",
    price: 18000,
    duration: "30 Days",
    lounge_type: "Online",
    opening_date: "10-03-2025",
    closing_date: "10-04-2025",
    status: "Publish",
  },
  {
    id: 4,
    img: "https://github.com/shadcn.png",
    title: "CrossFit",
    price: 30000,
    duration: "60 Days",
    lounge_type: "Offline",
    opening_date: "05-02-2025",
    closing_date: "05-04-2025",
    status: "Publish",
  },
  {
    id: 5,
    img: "https://github.com/shadcn.png",
    title: "Meditation",
    price: 15000,
    duration: "20 Days",
    lounge_type: "Online",
    opening_date: "12-04-2025",
    closing_date: "02-05-2025",
    status: "Draft",
  },
  {
    id: 6,
    img: "https://github.com/shadcn.png",
    title: "Strength Training",
    price: 28000,
    duration: "50 Days",
    lounge_type: "Offline",
    opening_date: "20-03-2025",
    closing_date: "08-05-2025",
    status: "Publish",
  },
  {
    id: 7,
    img: "https://github.com/shadcn.png",
    title: "Aerobics",
    price: 19000,
    duration: "30 Days",
    lounge_type: "Online",
    opening_date: "25-02-2025",
    closing_date: "27-03-2025",
    status: "Publish",
  },
  {
    id: 8,
    img: "https://github.com/shadcn.png",
    title: "Kickboxing",
    price: 22000,
    duration: "40 Days",
    lounge_type: "Offline",
    opening_date: "10-05-2025",
    closing_date: "20-06-2025",
    status: "Draft",
  },
  {
    id: 9,
    img: "https://github.com/shadcn.png",
    title: "Bodybuilding",
    price: 35000,
    duration: "70 Days",
    lounge_type: "Offline",
    opening_date: "01-06-2025",
    closing_date: "10-08-2025",
    status: "Publish",
  },
  {
    id: 10,
    img: "https://github.com/shadcn.png",
    title: "Cycling",
    price: 17000,
    duration: "25 Days",
    lounge_type: "Online",
    opening_date: "15-07-2025",
    closing_date: "10-08-2025",
    status: "Publish",
  },
];

export const categories_data = [
  {
    id: 1,
    img: "https://github.com/shadcn.png",
    name: "Yoga",
    parent_category: "Wellness",
    description: "lorem",
    wellness_lounge: "5",
    status: "Publish",
  },
  {
    id: 2,
    img: "https://github.com/shadcn.png",
    name: "Pilates",
    parent_category: "Fitness",
    description: "lorem",
    wellness_lounge: "3",
    status: "Publish",
  },
  {
    id: 3,
    img: "https://github.com/shadcn.png",
    name: "Meditation",
    parent_category: "Mindfulness",
    description: "lorem",
    wellness_lounge: "4",
    status: "Publish",
  },
  {
    id: 4,
    img: "https://github.com/shadcn.png",
    name: "Nutrition",
    parent_category: "Wellness",
    description: "lorem",
    wellness_lounge: "2",
    status: "Publish",
  },
  {
    id: 5,
    img: "https://github.com/shadcn.png",
    name: "Mental Health",
    parent_category: "Mindfulness",
    description: "lorem",
    wellness_lounge: "6",
    status: "Publish",
  },
  {
    id: 6,
    img: "https://github.com/shadcn.png",
    name: "Strength Training",
    parent_category: "Fitness",
    description: "lorem",
    wellness_lounge: "7",
    status: "Publish",
  },
  {
    id: 7,
    img: "https://github.com/shadcn.png",
    name: "Massage Therapy",
    parent_category: "Relaxation",
    description: "lorem",
    wellness_lounge: "5",
    status: "Publish",
  },
  {
    id: 8,
    img: "https://github.com/shadcn.png",
    name: "Aromatherapy",
    parent_category: "Relaxation",
    description: "lorem",
    wellness_lounge: "3",
    status: "Publish",
  },
  {
    id: 9,
    img: "https://github.com/shadcn.png",
    name: "Reiki",
    parent_category: "Energy Healing",
    description: "lorem",
    wellness_lounge: "4",
    status: "Publish",
  },
  {
    id: 10,
    img: "https://github.com/shadcn.png",
    name: "Acupuncture",
    parent_category: "Alternative Therapy",
    description: "lorem",
    wellness_lounge: "2",
    status: "Publish",
  },
];

export const orderStatusList = [
  {
    label: "Pending",
    value: "Pending",
  },
  {
    label: "Completed",
    value: "Completed",
  },
  {
    label: "Failed",
    value: "Failed",
  },
];

export const mentorList = [
  {
    label: "Yes",
    value: "Yes",
  },
  {
    label: "No",
    value: "No",
  },
];

export const ROLE = [
  {
    name: "Student Registration",
    value: "student",
  },
  {
    name: "Alumni Registration",
    value: "alumni",
  },
];

export const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getTimeIntervals = [
  { label: "30 Minutes", value: 30 },
  { label: "1 Hour", value: 60 },
  { label: "1.5 Hours", value: 90 },
  { label: "2 Hours", value: 120 },
  { label: "2.5 Hours", value: 150 },
  { label: "3 Hours", value: 180 },
];
