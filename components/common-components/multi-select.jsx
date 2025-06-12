"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";

// interface Option {
//     value: string;
//     label: string;
// }

// interface CustomMultiSelectProps {
//     options: Option[];
//     value: string[];
//     onChange: (selected: string[]) => void;
//     placeholder?: string;
//     required?: boolean;
//     title?: string;
//     error?: string;
// }

const CustomMultiSelect = ({
    options,
    value,
    onChange,
    placeholder = "Select options",
    title,
    required,
    error,
}) => {
    const handleSelectChange = (val) => {
        const newSelection = value.includes(val)
            ? value.filter((item) => item !== val) // Remove item
            : [...value, val]; // Add item
        onChange(newSelection);
    };

    const handleClear = () => {
        onChange([]); // Clear all selections
    };

    return (
        <div className="w-full" >
            {title && (
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    {title} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <Popover.Root>
                <Popover.Trigger asChild>
                    <button className="border rounded-lg px-4 py-2 w-full flex justify-between items-center">
                        <span>{value.length > 0 ? `${value.length} selected` : placeholder}</span>
                        <ChevronDown />
                    </button>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content className="bg-white border shadow-md rounded-md p-2 w-[100%]" style={{maxHeight:"340px", overflowY:"scroll", scrollbarWidth:"thin"}}>
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSelectChange(option.value)}
                            >
                                <input
                                    type="checkbox"
                                    checked={value.includes(option.value)}
                                    readOnly
                                    className="mr-2"
                                />
                                {option.label}
                            </div>
                        ))}
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>

            <div className="flex items-center justify-start gap-2">
                {/* Clear button */}
                {value.length > 0 && (
                    <button
                        onClick={handleClear}
                        className="text-red-500 bg-red-100 px-2 py-1 rounded-md hover:text-gray-700 mt-2 text-xs"
                    >
                        Clear All
                    </button>
                )}

                {/* Selected items as pills */}
                {value.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2" >
                        {value.map((val) => {
                            const selectedOption = options.find((option) => option.value === val);
                            return (
                                selectedOption && (
                                    <span
                                        key={val}
                                        className="px-2 py-1 bg-gray-200 rounded-md text-xs flex items-center gap-1"
                                    >
                                        {selectedOption.label}
                                        <X
                                            className="w-4 h-4 cursor-pointer"
                                            onClick={() => handleSelectChange(val)}
                                        />
                                    </span>
                                )
                            );
                        })}
                    </div>
                )}
            </div>




            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default CustomMultiSelect;