'use client';

import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

export default function MUIDateTimeClient() {
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Event Date & Time</h2>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          label="Select date and time"
          value={selectedDateTime}
          onChange={setSelectedDateTime}
          format="DD-MMM-YYYY HH:mm"
          ampm={false}
          slotProps={{
            textField: {
              fullWidth: true,
              size: 'small',
            },
          }}
        />
      </LocalizationProvider>
    </div>
  );
}
