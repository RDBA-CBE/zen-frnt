"use client";

import LoginForm from "@/components/ui/login-form";
import { useState } from "react";
import ChangePasswordConfirmForm from "../../../components/common-components/ChangePasswordConfirm";
import ForgotPasswordForm from "../../../components/common-components/ForgotPasswordPasswordForm";

export default function Login() {
    // const [isAuthenticated, setIsAuthenticated] = useState(
    //   !!localStorage.getItem("token") // Check for token
    // );


    return (
        <div className="flex items-center justify-center ">
            {/* {!isAuthenticated ? ( */}
            <ForgotPasswordForm />
            {/* ) : (
        <p className="text-lg font-semibold">Redirecting...</p>
      )} */}
        </div>
    );
}
