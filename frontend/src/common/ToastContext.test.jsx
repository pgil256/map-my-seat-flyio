import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { ToastProvider, useAppToast } from "./ToastContext";

// Test component that uses the toast context
function TestConsumer() {
  const toast = useAppToast();

  return (
    <div>
      <button onClick={() => toast.success("Success message")}>Show Success</button>
      <button onClick={() => toast.error("Error message")}>Show Error</button>
      <button onClick={() => toast.warning("Warning message")}>Show Warning</button>
      <button onClick={() => toast.info("Info message")}>Show Info</button>
      <button onClick={() => toast.success("Custom title", "Custom Title")}>Custom Title</button>
    </div>
  );
}

// Wrapper component that provides both Chakra and Toast contexts
function TestWrapper({ children }) {
  return (
    <ChakraProvider>
      <ToastProvider>{children}</ToastProvider>
    </ChakraProvider>
  );
}

describe("ToastContext", () => {
  describe("ToastProvider", () => {
    it("renders children", () => {
      render(
        <TestWrapper>
          <div data-testid="child">Child content</div>
        </TestWrapper>
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("provides toast methods to children", () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );

      // Verify all buttons render (meaning context is available)
      expect(screen.getByText("Show Success")).toBeInTheDocument();
      expect(screen.getByText("Show Error")).toBeInTheDocument();
      expect(screen.getByText("Show Warning")).toBeInTheDocument();
      expect(screen.getByText("Show Info")).toBeInTheDocument();
    });

    it("success toast can be triggered", () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );

      // Click should not throw
      fireEvent.click(screen.getByText("Show Success"));
    });

    it("error toast can be triggered", () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText("Show Error"));
    });

    it("warning toast can be triggered", () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText("Show Warning"));
    });

    it("info toast can be triggered", () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText("Show Info"));
    });

    it("toast with custom title can be triggered", () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText("Custom Title"));
    });
  });

  describe("useAppToast", () => {
    it("throws error when used outside ToastProvider", () => {
      // Suppress console.error for this test since we expect an error
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(
          <ChakraProvider>
            <TestConsumer />
          </ChakraProvider>
        );
      }).toThrow("useAppToast must be used within a ToastProvider");

      consoleSpy.mockRestore();
    });

    it("returns toast object with all methods", () => {
      let toastMethods = null;

      function CaptureToast() {
        toastMethods = useAppToast();
        return null;
      }

      render(
        <TestWrapper>
          <CaptureToast />
        </TestWrapper>
      );

      expect(toastMethods).toBeDefined();
      expect(typeof toastMethods.success).toBe("function");
      expect(typeof toastMethods.error).toBe("function");
      expect(typeof toastMethods.warning).toBe("function");
      expect(typeof toastMethods.info).toBe("function");
    });
  });
});
