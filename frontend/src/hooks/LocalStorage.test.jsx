import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useLocalStorage from "./LocalStorage";

describe("useLocalStorage", () => {
  // The global localStorage is mocked in setupTests.js with vi.fn()
  // We need to control the mock behavior in each test

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    // Default: getItem returns null (nothing stored)
    localStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns initial value when localStorage is empty", () => {
    localStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    expect(result.current[0]).toBe("default");
    expect(localStorage.getItem).toHaveBeenCalledWith("test-key");
  });

  it("returns value from localStorage if it exists", () => {
    localStorage.getItem.mockReturnValue("stored-value");

    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    expect(result.current[0]).toBe("stored-value");
    expect(localStorage.getItem).toHaveBeenCalledWith("test-key");
  });

  it("updates localStorage when value changes", async () => {
    localStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {
      result.current[1]("new-value");
    });

    await waitFor(() => {
      expect(result.current[0]).toBe("new-value");
    });

    // useEffect should have called setItem
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith("test-key", "new-value");
    });
  });

  it("removes key from localStorage when set to null", async () => {
    localStorage.getItem.mockReturnValue("existing");

    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    expect(result.current[0]).toBe("existing");

    act(() => {
      result.current[1](null);
    });

    await waitFor(() => {
      expect(result.current[0]).toBeNull();
    });

    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith("test-key");
    });
  });

  it("returns null as initial value when no default provided", () => {
    localStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage("empty-key"));

    expect(result.current[0]).toBeNull();
  });

  it("handles different keys independently", async () => {
    // Set up mock to return different values for different keys
    localStorage.getItem.mockImplementation((key) => {
      if (key === "key1") return null;
      if (key === "key2") return null;
      return null;
    });

    const { result: result1 } = renderHook(() =>
      useLocalStorage("key1", "value1")
    );
    const { result: result2 } = renderHook(() =>
      useLocalStorage("key2", "value2")
    );

    expect(result1.current[0]).toBe("value1");
    expect(result2.current[0]).toBe("value2");

    act(() => {
      result1.current[1]("updated1");
    });

    await waitFor(() => {
      expect(result1.current[0]).toBe("updated1");
    });

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith("key1", "updated1");
    });
  });

  it("persists value across re-renders", async () => {
    localStorage.getItem.mockReturnValue(null);

    const { result, rerender } = renderHook(() =>
      useLocalStorage("persist-key", "initial")
    );

    act(() => {
      result.current[1]("persisted");
    });

    await waitFor(() => {
      expect(result.current[0]).toBe("persisted");
    });

    rerender();

    expect(result.current[0]).toBe("persisted");

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith("persist-key", "persisted");
    });
  });

  it("calls setItem on initial render with default value", async () => {
    localStorage.getItem.mockReturnValue(null);

    renderHook(() => useLocalStorage("new-key", "default-value"));

    // The useEffect should set the item in localStorage
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith("new-key", "default-value");
    });
  });
});
