"use client";

import React, { useEffect, useState } from "react";
import { AsyncPaginate } from "react-select-async-paginate";

const LoadMoreDropdown = (props) => {
  const {
    value,
    onChange,
    loadOptions,
    placeholder = "Select an option",
    required,
    title,
    error,
    height,
    placeholderSize = "14px",
    disabled,
    reRender,
    position
  } = props;

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (reRender) {
      setRefreshKey((prev) => prev + 1);
      loadOptions("", [], { page: 1 });
    }
  }, [reRender]);
  
  return (
    <div className="w-full">
      {title && (
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <AsyncPaginate
        key={refreshKey}
        value={value}
        loadOptions={loadOptions}
        onChange={onChange}
        additional={{ page: 1 }}
        placeholder={placeholder}
        isClearable
        isDisabled={disabled}
        debounceTimeout={300}
        menuPlacement={position}    
        styles={{
          control: (base) => ({
            ...base,
            borderColor: error ? "#dc2626" : base.borderColor,
            fontSize: "16px",
            color: "black",
            height: height ? height : "40px",
            borderRadius: "0.5rem",
          }),
          placeholder: (base) => ({
            ...base,
            color: "#9C9C9C",
            fontSize: placeholderSize ? placeholderSize : "16px",
          }),
          singleValue: (base) => ({
            ...base,
            color: "black",
            fontSize: "16px",
            borderRadius: "10px",
          }),
          input: (base) => ({
            ...base,
            fontSize: "14px",
            color: "#111827",
            borderRadius: "10px",
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          menuList: (base) => ({
            ...base,
            maxHeight: "160px",
            marginTop: 10,
            paddingBottom: 0,
          }),
          option: (base, { isFocused }) => ({
            ...base,
            fontSize: "16px",
            padding: "6px 10px", // tighter padding
            minHeight: "28px",
            cursor: "pointer",
          }),
          // Add this to ensure the dropdown container respects the height
          menu: (base) => ({
            ...base,
            marginTop: "2px",
            marginBottom: 0,
          }),
          // Add this to handle loading and no options states
          loadingMessage: (base) => ({
            ...base,
            fontSize: "14px",
            padding: "2px 8px",
            height: "24px",
            display: "flex",
            alignItems: "center",
          }),
          noOptionsMessage: (base) => ({
            ...base,
            fontSize: "14px",
            padding: "2px 8px",
            height: "24px",
            display: "flex",
            alignItems: "center",
          }),
        }}
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default LoadMoreDropdown;