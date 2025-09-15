"use client";

import { X } from "lucide-react"; // Import clear icon
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import React, { useState } from "react";

// interface CustomSelectProps {
//   options: { value: string; label: string }[];
//   value: string;
//   onChange: (selected: { value: string; label: string } | null) => void;
//   placeholder?: string;
//   required?: boolean;
//   title?: string;
//   error?:string

// }

const CustomSelect = (props) => {
  const {
    options,
    value,
    onChange,
    placeholder = "Select an option",
    title,
    required,
    error,
    disabled,
  } = props;
  const selectedOption = options?.find((option) => option.value === value);

  return (
    <div className="w-full ">
      {title && (
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <Select
          onValueChange={(val) => {
            const selected = options?.find((option) => option.value === val);
            if (selected) {
              onChange(selected);
            }
          }}
          value={value}
          disabled={disabled}
        >
          <SelectTrigger hideIcon={!!value}>
            {" "}
            {/* Space for clear icon */}
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedOption && !disabled && (
          <button
            onClick={() => onChange(null)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error} {/* Display the error message if it exists */}
        </p>
      )}
    </div>
  );
};

export default CustomSelect;
