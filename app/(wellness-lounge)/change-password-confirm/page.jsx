"use client";

import LoginForm from "@/components/ui/login-form";
import { useState } from "react";
import ChangePasswordConfirmForm from "../../../components/common-components/ChangePasswordConfirm";

export default function Login() {
    // const [isAuthenticated, setIsAuthenticated] = useState(
    //   !!localStorage.getItem("token") // Check for token
    // );


    return (
        <div className="flex md:min-h-[70vh] min-h-[60vh] w-full items-center justify-center md:p-6">
            {/* {!isAuthenticated ? ( */}
            <ChangePasswordConfirmForm />
            {/* ) : (
        <p className="text-lg font-semibold">Redirecting...</p>
      )} */}
        </div>
    );
}
