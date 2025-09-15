import ProtectedRoute from "@/components/common-components/privateRouter";
import React from "react";
import Calendar from "../calendar/page";

const Booking = () => {
  return <Calendar />;
};

export default ProtectedRoute(Booking);
