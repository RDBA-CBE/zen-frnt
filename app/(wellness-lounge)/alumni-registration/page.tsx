"use client";

import AlumniRegistrationForm from "@/components/ui/alumni-registration-form";
import LoginForm from "@/components/ui/login-form";
import RegistrationForm from "@/components/ui/registration-form";
import StudentRegistrationForm from "@/components/ui/student-registration-form";
import { useState } from "react";

export default function Registration() {

    return (
        <div className="flex items-center justify-center ">
            {/* {!isAuthenticated ? ( */}
            <AlumniRegistrationForm className={""} />
            {/* ) : (
        <p className="text-lg font-semibold">Redirecting...</p>
      )} */}
        </div>
    );
}
