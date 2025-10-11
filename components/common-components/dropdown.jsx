"use client";

import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

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
    <div className="w-full">
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
          {/* Remove the default chevron icon when we have a value */}
          <SelectTrigger
            className={value ? "[&_[data-role=icon]]]:hidden pr-8" : ""}
          >
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

        {/* Clear button - only show when there's a value */}
        {value && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-sm bg-transparent hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default CustomSelect;
