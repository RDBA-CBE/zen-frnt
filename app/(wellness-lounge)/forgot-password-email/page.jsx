"use client";

import LoginForm from "@/components/ui/login-form";
import { useState } from "react";
import ForgotPasswordEmailForm from "../../../components/common-components/ForgotPasswordMailForm";

export default function ForgotPasswordEmail() {
    // const [isAuthenticated, setIsAuthenticated] = useState(
    //   !!localStorage.getItem("token") // Check for token
    // );


    return (
        <div className="flex md:min-h-[70vh] min-h-[60vh] w-full items-center justify-center md:p-6 ">
            {/* {!isAuthenticated ? ( */}
            <ForgotPasswordEmailForm />
            {/* ) : (hytjhyjuyjmyu     cc v fZ
        <p className="text-lg font-semibold">Redirecting...</p>
      )} */}
        </div>
    );
}
