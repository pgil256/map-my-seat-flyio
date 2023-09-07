import React, { useState, useEffect } from "react";
import {
  Alert,
  AlertDescription,
} from "@chakra-ui/react";

const MakeAlert = ({ messages = [] }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 5000); 

    return () => clearTimeout(timeout);
  }, []);

  if (!isVisible) return null;

  return (
    <Alert
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      position="absolute"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      zIndex="tooltip"
      backgroundColor="teal.200"
      maxWidth="250px"
      width="100%"
    >
      <AlertDescription maxWidth="225px"> 
          {messages.map((error) => (
            <p key={error}>{error}</p>
          ))}
      </AlertDescription>
    </Alert>
  );
};

export default MakeAlert;
