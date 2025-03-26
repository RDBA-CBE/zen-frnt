"use client";

import LoginForm from "@/components/ui/login-form";
import { useState } from "react";
import ChangePasswordConfirmForm from "../../../components/common-components/ChangePasswordConfirm";
import ForgotPasswordEmailForm from "../../../components/common-components/ForgotPasswordMailForm";

export default function ForgotPasswordEmail() {
    // const [isAuthenticated, setIsAuthenticated] = useState(
    //   !!localStorage.getItem("token") // Check for token
    // );


    return (
        <div className="flex items-center justify-center ">
            {/* {!isAuthenticated ? ( */}
            <ForgotPasswordEmailForm />
            {/* ) : (
        <p className="text-lg font-semibold">Redirecting...</p>
      )} */}
        </div>
    );
}
