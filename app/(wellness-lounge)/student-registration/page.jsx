"use client";

// import LoginForm from "@/components/ui/login-form";
// import RegistrationForm from "@/components/ui/registration-form";
import StudentRegistrationForm from "@/components/ui/student-registration-form";
// import { useState } from "react";

export default function studentRegistration() {
    // const [isAuthenticated, setIsAuthenticated] = useState(
    //     !!localStorage.getItem("token") // Check for token
    // );


    return (
        <div className="flex items-center justify-center ">
            {/* {!isAuthenticated ? ( */}
            <StudentRegistrationForm  />
            {/* ) : (
        <p className="text-lg font-semibold">Redirecting...</p>
      )} */}
        </div>
    );
}
