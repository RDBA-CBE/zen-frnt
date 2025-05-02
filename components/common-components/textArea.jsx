"use client";

import * as React from "react";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";

// interface ModalProps {
//   headerText?: string;
//   placeholder?: string;
//   type?: string;
//   value: any;
//   onChange: any;
//   title?: string;
//   error?: string;
//   name?: string;
//   required?: boolean;
//   className?: string;
//   disabled?: boolean
// }

export default function TextArea(props) {
  const {
    placeholder,
    value,
    onChange,
    title,
    error,
    name,
    required,
    className,
    disabled
  } = props;
  return (
    <div className="grid">
      {title && (
        <label className="block text-sm font-bold text-gray-700">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Textarea
        id="email"
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className={cn(
          "flex h-30 w-full rounded-md border border-input bg-background px-3  text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        disabled={disabled}
      />

      {error && (
        <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
          {error} {/* Display the error message if it exists */}
        </p>
      )}
    </div>
  );
}
