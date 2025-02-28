"use client";

import { Toaster, toast } from "sonner";

interface ToastProps {
  message: string;
  duration?: number;
}

// Background colors based on type
const toastStyles = {
  success: { background: "#22C55E", color: "#FFFFFF" }, // Green
  error: { background: "#DC2626", color: "#FFFFFF" }, // Red
  info: { background: "#2563EB", color: "#FFFFFF" }, // Blue
};

// Success Message
export function Success(message: string, duration = 3000) {
  toast(message, {
    duration,
    style: toastStyles.success,
  });
}

// Error Message
export function Failure(message: string, duration = 3000) {
  toast(message, {
    duration,
    style: toastStyles.error,
  });
}

// Info Message
export function Info(message: string, duration = 3000) {
  toast(message, {
    duration,
    style: toastStyles.info,
  });
}

// Global Toaster (should be placed at the root of your app)
export function ToastContainer() {
  return <Toaster position="top-center" />;
}
