"use client";

import { Toaster, toast } from "sonner";

// interface ToastProps {
//   message: string;
//   duration?: number;
// }


// Background colors based on type
const toastStyles = {
  success: { background: "#22C55E", color: "#FFFFFF" }, // Green
  error: { background: "#DC2626", color: "#FFFFFF" }, // Red
  info: { background: "#2563EB", color: "#FFFFFF" }, // Blue
};

// function getCloseAction(dismiss) {
//   return {
//     label: "Close",
//     onClick: dismiss,
//   };
// }

// Success Message
export function Success(message) {
  toast(message, {
    duration: Infinity,
    style: toastStyles.success,
      action: {
            label: "x",
            onClick: () => console.log("Undo"),
          },
  });
}

// Error Message
export function Failure(message) {
  toast(message, {
    duration: Infinity,
    style: toastStyles.error,
    action: {
            label: "x",
            onClick: () => console.log("Undo"),
          },
  });
}

// Info Message
export function Info(message) {
  toast(message, {
    duration: Infinity,
    style: toastStyles.info,
  action: {
            label: "x",
            onClick: () => console.log("Undo"),
          },
  });
}

// Global Toaster (should be placed at the root of your app)
export function ToastContainer() {
  return <Toaster position="top-center" />;
}
