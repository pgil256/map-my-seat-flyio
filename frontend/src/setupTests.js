import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock console.debug to reduce noise in tests
vi.spyOn(console, "debug").mockImplementation(() => {});

// Suppress CSS parsing errors from Chakra UI/emotion in jsdom
// These are known issues with CSS-in-JS and jsdom's CSS parser
const originalError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString() || "";
  // Suppress known Chakra UI CSS parsing warnings in jsdom
  if (
    message.includes("border-width") ||
    message.includes("Insertion") ||
    message.includes("cssstyle")
  ) {
    return;
  }
  originalError.apply(console, args);
};

// Patch CSSStyleDeclaration.setProperty to prevent TypeError from Chakra UI CSS variables
// This is necessary because jsdom's cssstyle cannot parse CSS variables like 'var(--chakra-borders-1px)'
if (typeof CSSStyleDeclaration !== "undefined") {
  const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty = function (property, value, priority) {
    try {
      // Skip properties with CSS variables that cssstyle can't parse
      if (value && typeof value === "string" && value.includes("var(--chakra")) {
        return;
      }
      return originalSetProperty.call(this, property, value, priority);
    } catch (e) {
      // Silently ignore CSS parsing errors from Chakra UI
      if (e.message && e.message.includes("border-width")) {
        return;
      }
      throw e;
    }
  };
}
