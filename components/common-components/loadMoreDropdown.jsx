"use client";

import React from "react";
import { AsyncPaginate } from "react-select-async-paginate";

const LoadMoreDropdown = ({
  value,
  onChange,
  loadOptions,
  placeholder = "Select an option",
  required,
  title,
  error,
}) => {
  return (
    <div className="w-full">
      {title && (
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <AsyncPaginate
        value={value}
        loadOptions={loadOptions}
        onChange={onChange}
        additional={{ page: 1 }}
        placeholder={placeholder}
        isClearable
        debounceTimeout={300}
        styles={{
          control: (base) => ({
            ...base,
            borderColor: error ? "#dc2626" : base.borderColor,
          }),
        }}
      />

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default LoadMoreDropdown;
