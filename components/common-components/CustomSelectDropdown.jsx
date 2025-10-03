"use client";

import React from "react";
import Select from "react-select";

const CustomSelectDropdown = (props) => {
  const {
    // Required props
    value,
    onChange,
    options = [],

    // Optional props with defaults
    placeholder = "Select options",
    isMulti = false,
    isClearable = true,
    isSearchable = true,
    isDisabled = false,

    // Label and error handling
    label,
    required = false,
    error,
    errorMessage,

    // Styling
    className = "",
    menuPortalTarget = typeof document !== "undefined" ? document.body : null,
    menuHeight = "40px",

    // Additional Select props
    ...selectProps
  } = props;

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Select Component */}
      <Select
        value={value}
        isMulti={isMulti}
        options={options}
        placeholder={placeholder}
        onChange={onChange}
        isClearable={isClearable}
        isSearchable={isSearchable}
        isDisabled={isDisabled}
        className={`text-sm ${className}`}
        menuPlacement="bottom"
        menuPosition="fixed"
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),

          // 👇 reduce total dropdown height
          menuList: (base) => ({
            ...base,
            maxHeight: 160, // total height for dropdown
            paddingTop: 0,
            paddingBottom: 0,
          }),

          // 👇 reduce option row height
          option: (base, { isFocused }) => ({
            ...base,
            fontSize: "16px",
            padding: "6px 10px", // tighter padding
            minHeight: "28px",
            cursor: "pointer",
          }),
        }}
        menuPortalTarget={menuPortalTarget}
        {...selectProps}
      />

      {/* Error Message */}
      {(error || errorMessage) && (
        <p className="mt-2 text-sm text-red-600">{errorMessage || error}</p>
      )}
    </div>
  );
};

export default CustomSelectDropdown;
