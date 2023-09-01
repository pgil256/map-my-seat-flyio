import React from "react";

//Component that populates error messages on screen upon error encounter
const Alert = ({ messages = [] }) => {
  return (
    <div>
      {messages.map((error) => (
        <p key={error}>{error}</p>
      ))}
    </div>
  );
};

export default Alert;
