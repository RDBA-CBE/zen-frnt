"use client";

import LoginForm from "@/components/ui/login-form";
import RegistrationForm from "@/components/ui/registration-form";
import { useState } from "react";

export default function Registration() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
        !!localStorage.getItem("token") // Check for token
    );


    return (
        <div className="flex items-center justify-center ">
            {/* {!isAuthenticated ? ( */}
            <RegistrationForm className={""} />
            {/* ) : (
        <p className="text-lg font-semibold">Redirecting...</p>
      )} */}
        </div>
    );
}
