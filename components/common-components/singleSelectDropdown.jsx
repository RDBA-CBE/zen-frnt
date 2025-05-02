import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const SingleSelectDropdown = ({
  options,
  placeholder,
  value,
  onChange,
  loadMore,
  moreLoading,
  headerText,
  required,
  color,
  headerSize,
  size,
  title
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (value) {
      setSelectedOption(value); // Expecting full object
    }
  }, [value]);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    onChange(option); // Return full object
    setIsOpen(false);
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const RenderFooter = () => {
    if (!moreLoading) return null;
    return (
      <div className="footer-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  };

  return (
    <div className="dropdown-wrapper" >
      <div className="dropdown-container">
      {title && (
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {title} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div
                  className="dropdown-toggle-btn rounded-md border border-input bg-background"

          onClick={handleToggleDropdown}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleToggleDropdown();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px",

            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            backgroundColor: "#fff",
            fontSize: "14px",
            marginTop:"8px",
          }}
        >
          <div className="selected-values">
            {selectedOption ? <span>{selectedOption.label}</span> : <span>{placeholder}</span>}
          </div>
          <span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4 opacity-50" />
            )}
          </span>
        </div>

        {isOpen && (
          <div
            className="dropdown-menu"
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "4px",
              backgroundColor: "#fff",
              maxHeight: "200px",
              overflowY: "auto",
              padding: "8px",
              zIndex: 9999,
              position: "absolute",
              width: "100%",
            }}
          >
            <input
              className="search-input"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "6px",
                marginBottom: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
            <div className="options-list">
              {filteredOptions.map((item) => (
                <div
                  key={item.value}
                  className="option-item"
                  onMouseDown={() => handleOptionSelect(item)} // ✅ use onMouseDown
                  style={{
                    padding: "6px 8px",
                    cursor: "pointer",
                    backgroundColor:
                      selectedOption?.value === item.value ? "#d0e0ff" : "#fff",
                    color: selectedOption?.value === item.value ? "#007bff" : "#000",
                    borderRadius: "4px",
                    marginBottom: "4px",
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
            {loadMore && <RenderFooter />}
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleSelectDropdown;
