import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import ErrorBoundary from "./ErrorBoundary";

// Suppress console.error for cleaner test output since ErrorBoundary logs errors
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});
afterAll(() => {
  console.error = originalError;
});

// Component that throws an error
function BrokenComponent({ error = new Error("Test error") }) {
  throw error;
}

// Component that works normally
function WorkingComponent() {
  return <div>Working content</div>;
}

const renderWithProviders = (ui) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe("ErrorBoundary", () => {
  describe("when no error occurs", () => {
    it("renders children normally", () => {
      renderWithProviders(
        <ErrorBoundary>
          <WorkingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText("Working content")).toBeInTheDocument();
    });

    it("does not show error UI", () => {
      renderWithProviders(
        <ErrorBoundary>
          <WorkingComponent />
        </ErrorBoundary>
      );

      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("when error occurs", () => {
    it("catches error and renders fallback UI", () => {
      renderWithProviders(
        <ErrorBoundary>
          <BrokenComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it("shows descriptive error message", () => {
      renderWithProviders(
        <ErrorBoundary>
          <BrokenComponent />
        </ErrorBoundary>
      );

      expect(
        screen.getByText(/unexpected error occurred/i)
      ).toBeInTheDocument();
    });

    it("renders Return to Home button", () => {
      renderWithProviders(
        <ErrorBoundary>
          <BrokenComponent />
        </ErrorBoundary>
      );

      expect(
        screen.getByRole("button", { name: /return to home/i })
      ).toBeInTheDocument();
    });

    it("does not render children when error occurs", () => {
      renderWithProviders(
        <ErrorBoundary>
          <BrokenComponent />
        </ErrorBoundary>
      );

      expect(screen.queryByText("Working content")).not.toBeInTheDocument();
    });
  });

  describe("error details in development mode", () => {
    it("displays error message in dev mode", () => {
      // In test environment, import.meta.env.DEV is true
      renderWithProviders(
        <ErrorBoundary>
          <BrokenComponent error={new Error("Custom test error")} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/custom test error/i)).toBeInTheDocument();
    });
  });

  describe("handleReset", () => {
    it("clicking Return to Home triggers navigation", () => {
      // Mock window.location.href
      const originalLocation = window.location;
      delete window.location;
      window.location = { href: "" };

      renderWithProviders(
        <ErrorBoundary>
          <BrokenComponent />
        </ErrorBoundary>
      );

      const homeButton = screen.getByRole("button", { name: /return to home/i });
      fireEvent.click(homeButton);

      expect(window.location.href).toBe("/");

      // Restore window.location
      window.location = originalLocation;
    });
  });

  describe("error boundary behavior", () => {
    it("catches errors from nested components", () => {
      function ParentComponent() {
        return (
          <div>
            <span>Parent</span>
            <BrokenComponent />
          </div>
        );
      }

      renderWithProviders(
        <ErrorBoundary>
          <ParentComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.queryByText("Parent")).not.toBeInTheDocument();
    });

    it("renders error boundary with proper styling", () => {
      renderWithProviders(
        <ErrorBoundary>
          <BrokenComponent />
        </ErrorBoundary>
      );

      // Check that the alert with error status is rendered
      const alertElement = screen.getByRole("alert");
      expect(alertElement).toBeInTheDocument();
    });
  });
});
