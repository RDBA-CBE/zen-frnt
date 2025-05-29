"use client";

import { Toaster, toast } from "sonner";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Toast styles
const toastStyles = {
  success: { background: "#22C55E", color: "#FFFFFF" },
  error: { background: "#DC2626", color: "#FFFFFF" },
  info: { background: "#2563EB", color: "#FFFFFF" },
};

// Dismiss and Show
// function dismissAndToast(message, style) {
//   toast.dismiss(); // Dismiss existing toasts
//   toast(message, {
//     duration: 5000,
//     style,
//     action: {
//       label: "x",
//       onClick: () => toast.dismiss(),
//     },
//   });
// }

// // Success
// export function Success(message) {
//   dismissAndToast(message, toastStyles.success);
// }

function dismissAndToast(message, style,onClick) {
  toast.dismiss(); // Dismiss existing toasts
  toast(message, {
    duration: 5000,
    style,
    action: {
      label: "x",
      onClick: () => onClick,
    },
  });
}

Success
export function Success(message,onClick) {
  dismissAndToast(message, toastStyles.success,onClick);
}

// export function InfinitySuccess(message,onClick) {
//   toast.dismiss()
//   toast(message, {
//     duration: Infinity,
//     style: toastStyles.success,
//       action: {
//             label: "x",
//             onClick: onClick,
//           },
//   });
// }

export function InfinitySuccess(message, onClick) {
  toast.dismiss();
  toast(message, {
    duration: Infinity,
    style: toastStyles.success,
    action: {
      label: "x",
      onClick: () => {
        toast.dismiss();
        if (onClick) onClick();
      },
    },
  });
}

// Failure
export function Failure(message) {
  dismissAndToast(message, toastStyles.error);
}

// Info
export function Info(message) {
  dismissAndToast(message, toastStyles.info);
}



// Toaster with route change handler
export function ToastContainer() {
  const pathname = usePathname();

  

  useEffect(() => {
    toast.dismiss(); // Clear toasts on route change
  }, [pathname]);

  return <Toaster position="top-center" />;
}
