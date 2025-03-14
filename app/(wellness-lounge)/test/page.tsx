import React from "react";

const Test: React.FC = () => {
  return (
      <div className="iframe-container mt-4">
        <iframe
          src="http://localhost:3000/calendar" // Ensure this URL is correct
          style={{ border: "0", width: "100%", height: "600px" }}
          title="Calendar"
        ></iframe>
      </div>
  );
};

export default Test;
