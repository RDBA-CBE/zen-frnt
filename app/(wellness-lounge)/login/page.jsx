"use client";

import LoginForm from "@/components/ui/login-form";
import { useState } from "react";

export default function Login() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem("token") // Check for token
  );


  return (
    <div className="flex items-center justify-center ">
      {/* {!isAuthenticated ? ( */}
      <LoginForm className={""} />
      {/* ) : (
        <p className="text-lg font-semibold">Redirecting...</p>
      )} */}
    </div>
  );
}
