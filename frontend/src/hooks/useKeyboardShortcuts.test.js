import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import useKeyboardShortcuts from "./useKeyboardShortcuts";

describe("useKeyboardShortcuts", () => {
  let originalActiveElement;

  beforeEach(() => {
    // Store original active element
    originalActiveElement = document.activeElement;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls handler for matching key", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "a", handler }])
    );

    fireEvent.keyDown(document, { key: "a" });

    expect(handler).toHaveBeenCalled();
  });

  it("calls handler with ctrl modifier", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "s", ctrl: true, handler }])
    );

    // Without ctrl - should not call
    fireEvent.keyDown(document, { key: "s" });
    expect(handler).not.toHaveBeenCalled();

    // With ctrl - should call
    fireEvent.keyDown(document, { key: "s", ctrlKey: true });
    expect(handler).toHaveBeenCalled();
  });

  it("calls handler with meta key (Mac cmd)", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "s", ctrl: true, handler }])
    );

    fireEvent.keyDown(document, { key: "s", metaKey: true });

    expect(handler).toHaveBeenCalled();
  });

  it("calls handler with shift modifier", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "s", shift: true, handler }])
    );

    // Without shift - should not call
    fireEvent.keyDown(document, { key: "s" });
    expect(handler).not.toHaveBeenCalled();

    // With shift - should call
    fireEvent.keyDown(document, { key: "s", shiftKey: true });
    expect(handler).toHaveBeenCalled();
  });

  it("calls handler with alt modifier", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "s", alt: true, handler }])
    );

    // Without alt - should not call
    fireEvent.keyDown(document, { key: "s" });
    expect(handler).not.toHaveBeenCalled();

    // With alt - should call
    fireEvent.keyDown(document, { key: "s", altKey: true });
    expect(handler).toHaveBeenCalled();
  });

  it("calls handler with multiple modifiers", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "s", ctrl: true, shift: true, handler }])
    );

    // Only ctrl - should not call
    fireEvent.keyDown(document, { key: "s", ctrlKey: true });
    expect(handler).not.toHaveBeenCalled();

    // Only shift - should not call
    fireEvent.keyDown(document, { key: "s", shiftKey: true });
    expect(handler).not.toHaveBeenCalled();

    // Both ctrl and shift - should call
    fireEvent.keyDown(document, { key: "s", ctrlKey: true, shiftKey: true });
    expect(handler).toHaveBeenCalled();
  });

  it("does not call handler when key does not match", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "a", handler }])
    );

    fireEvent.keyDown(document, { key: "b" });

    expect(handler).not.toHaveBeenCalled();
  });

  it("does not call handler when modifiers do not match", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "s", ctrl: true, handler }])
    );

    // Key matches but modifier doesn't
    fireEvent.keyDown(document, { key: "s", shiftKey: true });

    expect(handler).not.toHaveBeenCalled();
  });

  it("ignores events when focused on input", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "a", handler }])
    );

    // Create and focus an input
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    fireEvent.keyDown(input, { key: "a" });

    expect(handler).not.toHaveBeenCalled();

    // Cleanup
    document.body.removeChild(input);
  });

  it("ignores events when focused on textarea", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "a", handler }])
    );

    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.focus();

    fireEvent.keyDown(textarea, { key: "a" });

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it("ignores events when focused on contenteditable", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "a", handler }])
    );

    const div = document.createElement("div");
    div.contentEditable = "true";
    document.body.appendChild(div);
    div.focus();

    // Create event with target that has isContentEditable property
    // JSDOM doesn't fully support contentEditable, so we need to manually
    // set up the event target properly
    const event = new KeyboardEvent("keydown", {
      key: "a",
      bubbles: true,
      cancelable: true,
    });

    // Override target's isContentEditable for the test
    Object.defineProperty(event, "target", {
      value: { ...div, isContentEditable: true, tagName: "DIV" },
      writable: false,
    });

    document.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(div);
  });

  it("allows Escape key even in input", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "Escape", handler }])
    );

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    fireEvent.keyDown(input, { key: "Escape" });

    expect(handler).toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it("handles multiple shortcuts", () => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([
        { key: "a", handler: handlerA },
        { key: "b", handler: handlerB },
      ])
    );

    fireEvent.keyDown(document, { key: "a" });
    expect(handlerA).toHaveBeenCalled();
    expect(handlerB).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: "b" });
    expect(handlerB).toHaveBeenCalled();
  });

  it("prevents default for matched shortcuts", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "s", ctrl: true, handler }])
    );

    const event = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    document.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("matches key case-insensitively", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "A", handler }])
    );

    fireEvent.keyDown(document, { key: "a" });

    expect(handler).toHaveBeenCalled();
  });

  it("cleans up event listeners on unmount", () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([{ key: "a", handler }])
    );

    unmount();

    fireEvent.keyDown(document, { key: "a" });

    expect(handler).not.toHaveBeenCalled();
  });

  it("updates handler when deps change", () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    let currentHandler = handler1;

    const { rerender } = renderHook(
      ({ handler }) =>
        useKeyboardShortcuts([{ key: "a", handler }], [handler]),
      { initialProps: { handler: handler1 } }
    );

    fireEvent.keyDown(document, { key: "a" });
    expect(handler1).toHaveBeenCalledTimes(1);

    // Update handler via rerender
    rerender({ handler: handler2 });

    fireEvent.keyDown(document, { key: "a" });
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it("passes event to handler", () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([{ key: "a", handler }])
    );

    fireEvent.keyDown(document, { key: "a" });

    expect(handler).toHaveBeenCalledWith(expect.any(Object));
    expect(handler.mock.calls[0][0].key).toBe("a");
  });

  it("stops processing after first match", () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([
        { key: "a", handler: handler1 },
        { key: "a", handler: handler2 }, // Same key, different handler
      ])
    );

    fireEvent.keyDown(document, { key: "a" });

    expect(handler1).toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });
});
