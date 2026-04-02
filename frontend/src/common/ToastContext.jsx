import { createContext, useContext } from "react";
import { useToast } from "@chakra-ui/react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const toast = useToast();

  // Default toast options following design system
  const defaultOptions = {
    duration: 4000,
    isClosable: true,
    position: "bottom-right",
    variant: "left-accent", // White background with colored left bar
  };

  const showToast = {
    success: (message, title = "Success") => {
      toast({
        ...defaultOptions,
        title,
        description: message,
        status: "success", // Uses accent.600 (teal) via theme
      });
    },
    error: (message, title = "Error") => {
      toast({
        ...defaultOptions,
        title,
        description: message,
        status: "error", // Uses error.500 (red) via theme
      });
    },
    warning: (message, title = "Warning") => {
      toast({
        ...defaultOptions,
        title,
        description: message,
        status: "warning",
      });
    },
    info: (message, title = "Info") => {
      toast({
        ...defaultOptions,
        title,
        description: message,
        status: "info", // Uses brand.600 (slate) via theme
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
