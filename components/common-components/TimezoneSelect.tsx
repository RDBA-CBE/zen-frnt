"use client";

import { useMemo } from "react";
import moment from "moment-timezone";
import LoadMoreDropdown from "./LoadMoreDropdown";

export default function MomentTimezoneSelect(props) {
  const { title, required, value, onChange, placeholder, error, position } = props;

  // Precompute dropdown only once
  const dropdown = useMemo(() => {
    return moment.tz.names().map((tz) => {
      const offset = moment.tz(tz).format("Z"); // e.g. "-07:00"
      const label = `(GMT${offset}) ${tz.replace(/_/g, " ")}`;
      return { label, value: tz };
    });
  }, []);

  // Loader function with search support
  const loadMendorList = async (search, loadedOptions, additional) => {
    const page = additional?.page || 1;

    try {
      let options = moment.tz.names().map((tz) => {
        const offset = moment.tz(tz).format("Z");
        const label = `(GMT${offset}) ${tz.replace(/_/g, " ")}`;
        return { label, value: tz };
      });

      // ✅ filter by search text
      if (search) {
        const lower = search.toLowerCase();
        options = options.filter(
          (opt) =>
            opt.label.toLowerCase().includes(lower) ||
            opt.value.toLowerCase().includes(lower)
        );
      }

      return {
        options,
        hasMore: false,
        additional: { page: page + 1 },
      };
    } catch (error) {
      return {
        options: [],
        hasMore: false,
        additional: { page },
      };
    }
  };

  return (
    <div className="w-full">
      <LoadMoreDropdown
        value={value}
        onChange={onChange}
        height="30px"
        title={title}
        error={error}
        required={required}
        placeholder={placeholder || "Select Timezone"}
        loadOptions={loadMendorList}
        defaultOptions={dropdown}
        position={position} // top / bottom / auto
      />
    </div>
  );
}
