import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import useAutosave from "./useAutosave";

describe("useAutosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls save function after delay when value changes", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ value }) => useAutosave(value, saveFn, 1000),
      { initialProps: { value: { name: "initial" } } }
    );

    // Change the value to trigger autosave
    rerender({ value: { name: "updated" } });

    // Before delay, save should not be called
    expect(saveFn).not.toHaveBeenCalled();

    // Advance timers past the delay
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(saveFn).toHaveBeenCalledWith({ name: "updated" });
    expect(saveFn).toHaveBeenCalledTimes(1);
  });

  it("does not call save when value has not changed", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ value }) => useAutosave(value, saveFn, 1000),
      { initialProps: { value: { name: "test" } } }
    );

    // Rerender with same value (deep equal)
    rerender({ value: { name: "test" } });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(saveFn).not.toHaveBeenCalled();
  });

  it("debounces rapid changes", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ value }) => useAutosave(value, saveFn, 1000),
      { initialProps: { value: { name: "a" } } }
    );

    // Make rapid changes
    rerender({ value: { name: "ab" } });
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    rerender({ value: { name: "abc" } });
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    rerender({ value: { name: "abcd" } });

    // Advance past the full delay from last change
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Should only be called once with the final value
    expect(saveFn).toHaveBeenCalledTimes(1);
    expect(saveFn).toHaveBeenCalledWith({ name: "abcd" });
  });

  it("does not call save when disabled", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ value, enabled }) => useAutosave(value, saveFn, 1000, enabled),
      { initialProps: { value: { name: "initial" }, enabled: false } }
    );

    rerender({ value: { name: "updated" }, enabled: false });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(saveFn).not.toHaveBeenCalled();
  });

  it("starts saving when enabled becomes true", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ value, enabled }) => useAutosave(value, saveFn, 1000, enabled),
      { initialProps: { value: { name: "initial" }, enabled: false } }
    );

    // Change value while disabled
    rerender({ value: { name: "updated" }, enabled: false });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(saveFn).not.toHaveBeenCalled();

    // Enable autosave with a new value change
    rerender({ value: { name: "final" }, enabled: true });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(saveFn).toHaveBeenCalledWith({ name: "final" });
  });

  it("provides saveNow function for immediate save", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ value }) => useAutosave(value, saveFn, 1000),
      { initialProps: { value: { name: "test" } } }
    );

    // Update value
    rerender({ value: { name: "immediate" } });

    // Call saveNow before timeout
    await act(async () => {
      await result.current.saveNow();
    });

    expect(saveFn).toHaveBeenCalledWith({ name: "immediate" });
  });

  it("saveNow cancels pending debounced save", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ value }) => useAutosave(value, saveFn, 1000),
      { initialProps: { value: { name: "initial" } } }
    );

    rerender({ value: { name: "updated" } });

    // Call saveNow immediately
    await act(async () => {
      await result.current.saveNow();
    });

    // Advance past the debounce delay
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Should only be called once (from saveNow), not twice
    expect(saveFn).toHaveBeenCalledTimes(1);
  });

  it("cleans up timeout on unmount", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { rerender, unmount } = renderHook(
      ({ value }) => useAutosave(value, saveFn, 1000),
      { initialProps: { value: { name: "initial" } } }
    );

    rerender({ value: { name: "updated" } });

    // Unmount before timeout fires
    unmount();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Save should not be called after unmount
    expect(saveFn).not.toHaveBeenCalled();
  });

  it("uses custom delay", async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ value }) => useAutosave(value, saveFn, 2000),
      { initialProps: { value: { name: "initial" } } }
    );

    rerender({ value: { name: "updated" } });

    // After 1 second, save should not be called yet
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(saveFn).not.toHaveBeenCalled();

    // After 2 seconds total, save should be called
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(saveFn).toHaveBeenCalledWith({ name: "updated" });
  });
});
