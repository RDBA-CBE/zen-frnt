"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
export function CheckboxDemo({
  label,
  value,
  selectedValues,
  onChange,
  isMulti,
}: {
  label: string;
  value: string;
  selectedValues: { value: string; label: string }[];
  onChange: (newSelectedValues: { value: string; label: string }[]) => void;
  isMulti: boolean;
}) {
  const handleCheckboxChange = (checked: boolean) => {
    let newSelectedValues;

    const selectedItem = { value, label };

    if (isMulti) {
      if (checked) {
        newSelectedValues = [...selectedValues, selectedItem];
      } else {
        newSelectedValues = selectedValues?.filter(
          (item) => item.value !== value,
        );
      }
    } else {
      newSelectedValues = checked ? [selectedItem] : [];
    }

    onChange(newSelectedValues);
  };

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={value}
        checked={selectedValues?.some((item) => item.value === value)}
        onCheckedChange={handleCheckboxChange}
      />
      <label
        htmlFor={value}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
      >
        {label}
      </label>
    </div>
  );
}
