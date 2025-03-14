"use client";

import AlumniRegistrationForm from "@/components/ui/alumni-registration-form";


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
