"use client";

import { DateTimePickerComponent } from '@syncfusion/ej2-react-calendars';
import { useState } from 'react';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-react-calendars/styles/material.css';

export default function SyncfusionDateTimePicker() {
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  const formatTimeWithAMPM = (date) => {
    if (!date) return 'Not selected';
    
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    // Convert to 12-hour format with AM/PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12
    
    return `${hours12}:${minutes} ${ampm}`;
  };

  const formatTime24Hour = (date) => {
    if (!date) return 'Not selected';
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Event Date & Time</h2>
      
      <div className="mb-4">
        <DateTimePickerComponent
          placeholder="Select date and time (24-hour format)"
          value={selectedDateTime}
          change={(args) => setSelectedDateTime(args.value)}
          format="dd-MMM-yyyy HH:mm" 
          timeFormat="HH:mm"         
          step={15}                 
          cssClass="e-outline"
        />
      </div>
      
      {/* <div className="bg-gray-50 p-4 rounded-lg">
        <p className="mb-2">
          <span className="font-medium">Selected Date:</span> {selectedDateTime ? selectedDateTime.toISOString().split('T')[0] : 'Not selected'}
        </p>
        <p className="mb-2">
          <span className="font-medium">Time (24-hour):</span> {formatTime24Hour(selectedDateTime)}
        </p>
        <p>
          <span className="font-medium">Time (12-hour with AM/PM):</span> {formatTimeWithAMPM(selectedDateTime)}
        </p>
      </div> */}
    </div>
  );
}