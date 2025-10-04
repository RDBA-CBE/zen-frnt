"use client";

import React from "react";
import Select, { components } from "react-select";

// Custom MenuList to detect scroll to bottom
const CustomMenuList = (props) => {
  const { children, selectProps } = props;

  const handleScroll = (e) => {
    const target = e.target;
    // Check if scrolled to bottom
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 5) {
      if (selectProps.hasMore && !selectProps.loading) {
        selectProps.onLoadMore?.();
      }
    }
  };

  return (
    <components.MenuList {...props} onScroll={handleScroll}>
      {children}
      {/* Optional loading indicator */}
      {selectProps.loading && (
        <div className="text-center py-2 text-gray-500">Loading...</div>
      )}
    </components.MenuList>
  );
};

const CustomSelectDropdown = (props) => {
  const {
    value,
    onChange,
    options = [],
    placeholder = "Select options",
    isMulti = false,
    isClearable = true,
    isSearchable = true,
    isDisabled = false,
    onLoadMore = () => {},
    hasMore = false,
    loading = false, // pass loading state for scroll fetch

    label,
    required = false,
    error,
    errorMessage,

    className = "",
    menuPortalTarget = typeof document !== "undefined" ? document.body : null,
    menuHeight = "40px",

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
          menuList: (base) => ({
            ...base,
            maxHeight: 160,
            paddingTop: 0,
            paddingBottom: 0,
          }),
          option: (base) => ({
            ...base,
            fontSize: "16px",
            padding: "6px 10px",
            minHeight: "28px",
            cursor: "pointer",
          }),
        }}
        components={{ MenuList: CustomMenuList }}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        loading={loading}
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
