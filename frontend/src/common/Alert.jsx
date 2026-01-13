import {
  Alert as ChakraAlert,
  AlertIcon,
  AlertDescription,
  VStack,
} from "@chakra-ui/react";

// Component that displays error messages using the theme's Alert styling
// Uses the subtle variant which has left border styling defined in theme
const Alert = ({ messages = [], status = "error" }) => {
  if (messages.length === 0) {
    return null;
  }

  return (
    <VStack spacing={2} align="stretch" w="100%">
      {messages.map((message) => (
        <ChakraAlert
          key={message}
          status={status}
          variant="subtle"
          borderRadius="base"
        >
          <AlertIcon />
          <AlertDescription>{message}</AlertDescription>
        </ChakraAlert>
      ))}
    </VStack>
  );
};

export default Alert;
