// "use client";

// import { useState } from 'react';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import dayjs from 'dayjs';

// export default function MUIDateTimePicker() {
//   const [selectedDateTime, setSelectedDateTime] = useState(null);

//   const formatTimeWithAMPM = (date) => {
//     if (!date) return 'Not selected';
//     return dayjs(date).format('hh:mm A'); // 12-hour format
//   };

//   const formatTime24Hour = (date) => {
//     if (!date) return 'Not selected';
//     return dayjs(date).format('HH:mm'); // 24-hour format
//   };

//   return (
//     <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
//       <h2 className="text-xl font-semibold mb-4">Event Date & Time</h2>

//       <LocalizationProvider dateAdapter={AdapterDayjs}>
//         <DateTimePicker
//           label="Select date and time (24-hour)"
//           value={selectedDateTime}
//           onChange={setSelectedDateTime}
//           format="DD-MMM-YYYY HH:mm"
//           ampm={false} // 24-hour mode
//           slotProps={{
//             textField: {
//               fullWidth: true,
//               size: 'small',
//             },
//           }}
//         />
//       </LocalizationProvider>

//       {/* <div className="bg-gray-50 p-4 mt-4 rounded-lg">
//         <p className="mb-2">
//           <span className="font-medium">Selected Date:</span> {selectedDateTime ? dayjs(selectedDateTime).format('YYYY-MM-DD') : 'Not selected'}
//         </p>
//         <p className="mb-2">
//           <span className="font-medium">Time (24-hour):</span> {formatTime24Hour(selectedDateTime)}
//         </p>
//         <p>
//           <span className="font-medium">Time (12-hour with AM/PM):</span> {formatTimeWithAMPM(selectedDateTime)}
//         </p>
//       </div> */}
//     </div>
//   );
// }

'use client';
import dynamic from 'next/dynamic';
// import MUIDateTimeClient from '../../../components/common-components/MUIDateTimeClient';

const MUIDateTimeClient = dynamic(() => import('../../../components/common-components/MUIDateTimeClient'), { ssr: false });

export default function Page() {
  return (
    <main>
      <MUIDateTimeClient />
    </main>
  );
}

