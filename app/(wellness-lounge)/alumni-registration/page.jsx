"use client";

import { useEffect, useState } from "react";
import AlumniRegistrationForm from "@/components/ui/alumni-registration-form";

export default function AlumniRegistration() {
  const [isClient, setIsClient] = useState(false);

  // Ensuring that the component only runs on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render nothing or a loading state while on the server
    return null;
  }

  return (
    <div className="flex md:min-h-[70vh] min-h-[60vh] w-full items-center justify-center md:p-6 alumini-form" >
      <AlumniRegistrationForm />
    </div>
  );
}
