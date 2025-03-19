"use client";

import LoginForm from "@/components/ui/login-form";
import { useState } from "react";
import ChangePasswordEmailForm from "../../../components/common-components/changePasswordEmailForm";

export default function Login() {
    // const [isAuthenticated, setIsAuthenticated] = useState(
    //   !!localStorage.getItem("token") // Check for token
    // );


    return (
        <div className="flex items-center justify-center ">
            {/* {!isAuthenticated ? ( */}
            <ChangePasswordEmailForm />
            {/* ) : (
        <p className="text-lg font-semibold">Redirecting...</p>
      )} */}
        </div>
    );
}
