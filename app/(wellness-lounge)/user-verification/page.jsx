"use client";
import React from "react";
import { CheckCircle, ArrowRight, Mail } from "lucide-react";

const UserVerificationPage = () => {
  return (
    <div className=" from-green-50 via-white to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Verification Successful!
          </h1>
          <p className="text-gray-600 mb-2">
            Your email has been successfully verified.
          </p>
          <p className="text-gray-600 mb-8">
            You can now access your account and explore all features.
          </p>

          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-3"
          >
            <span>Continue to Login</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserVerificationPage;
