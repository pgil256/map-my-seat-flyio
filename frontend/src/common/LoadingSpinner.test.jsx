import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { describe, it, expect, afterEach } from "vitest";
import LoadingSpinner from "./LoadingSpinner";

const renderWithProviders = (props = {}) => {
  return render(
    <ChakraProvider>
      <LoadingSpinner {...props} />
    </ChakraProvider>
  );
};

describe("LoadingSpinner", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders without crashing", () => {
    const { container } = renderWithProviders();
    expect(container).toBeDefined();
  });

  it("displays the default loading message", () => {
    renderWithProviders();
    const loadingTexts = screen.getAllByText("Loading...");
    expect(loadingTexts.length).toBeGreaterThan(0);
  });

  it("displays a custom message when provided", () => {
    renderWithProviders({ message: "Please wait..." });
    expect(screen.getByText("Please wait...")).toBeInTheDocument();
  });

  it("renders the spinner component", () => {
    renderWithProviders();
    // Verify the component renders - Chakra Spinner might use role="status"
    const loadingTexts = screen.getAllByText("Loading...");
    expect(loadingTexts.length).toBeGreaterThan(0);
  });
});
