import * as React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// interface TimePickerProps {
//   placeholder?: string;
//   name?: string;
//   className?: string;
//   required?: boolean;
//   title?: string;
//   error?: string;
//   onChange: any;
//   value: any;
// }

export default function TimePicker(props) {
  const {
    placeholder = "Select Time",
    title,
    required,
    error,
    onChange,
    value,
  } = props;

  return (
    <div className="w-full">
      {title && (
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start gap-3 text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarClock height={20} width={20} />
            {value ? format(value, "HH:mm") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DatePicker
            selected={value}
            onChange={(date) => onChange(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15} // Set time interval (e.g., every 15 minutes)
            timeCaption="Time"
            // dateFormat="HH:mm"
            timeFormat="HH:mm"
            className="w-full p-2 border rounded-md focus:outline-none"
          />
        </PopoverContent>
      </Popover>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
