import { createContext, useContext } from "react";
import { useToast } from "@chakra-ui/react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const toast = useToast();

  const showToast = {
    success: (message, title = "Success") => {
      toast({
        title,
        description: message,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    },
    error: (message, title = "Error") => {
      toast({
        title,
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    },
    warning: (message, title = "Warning") => {
      toast({
        title,
        description: message,
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    },
    info: (message, title = "Info") => {
      toast({
        title,
        description: message,
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    },
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
    </ToastContext.Provider>
  );
}

export function useAppToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useAppToast must be used within a ToastProvider");
  }
  return context;
}

export default ToastContext;
