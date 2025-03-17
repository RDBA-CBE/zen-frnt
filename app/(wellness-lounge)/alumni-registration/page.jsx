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
    <div className="flex items-center justify-center">
      <AlumniRegistrationForm />
    </div>
  );
}
