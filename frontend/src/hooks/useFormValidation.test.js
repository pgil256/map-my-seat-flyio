import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useFormValidation, { validators } from "./useFormValidation";

describe("useFormValidation", () => {
  describe("initial state", () => {
    it("initializes with provided values", () => {
      const initialValues = { email: "test@test.com", password: "123456" };
      const { result } = renderHook(() =>
        useFormValidation(initialValues, {})
      );

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
    });
  });

  describe("handleChange", () => {
    it("updates field value on change", () => {
      const { result } = renderHook(() =>
        useFormValidation({ name: "" }, {})
      );

      act(() => {
        result.current.handleChange({
          target: { name: "name", value: "John", type: "text" },
        });
      });

      expect(result.current.values.name).toBe("John");
    });

    it("handles checkbox inputs", () => {
      const { result } = renderHook(() =>
        useFormValidation({ agree: false }, {})
      );

      act(() => {
        result.current.handleChange({
          target: { name: "agree", checked: true, type: "checkbox" },
        });
      });

      expect(result.current.values.agree).toBe(true);
    });

    it("validates field on change if already touched", () => {
      const rules = {
        email: [(value) => (!value.includes("@") ? "Invalid email" : "")],
      };
      const { result } = renderHook(() =>
        useFormValidation({ email: "" }, rules)
      );

      // Mark field as touched first
      act(() => {
        result.current.handleBlur({
          target: { name: "email", value: "" },
        });
      });

      // Now change should trigger validation
      act(() => {
        result.current.handleChange({
          target: { name: "email", value: "invalid", type: "text" },
        });
      });

      expect(result.current.errors.email).toBe("Invalid email");
    });

    it("does not validate untouched fields on change", () => {
      const rules = {
        email: [(value) => (!value.includes("@") ? "Invalid email" : "")],
      };
      const { result } = renderHook(() =>
        useFormValidation({ email: "" }, rules)
      );

      act(() => {
        result.current.handleChange({
          target: { name: "email", value: "invalid", type: "text" },
        });
      });

      expect(result.current.errors.email).toBeUndefined();
    });
  });

  describe("handleBlur", () => {
    it("marks field as touched on blur", () => {
      const { result } = renderHook(() =>
        useFormValidation({ name: "" }, {})
      );

      act(() => {
        result.current.handleBlur({
          target: { name: "name", value: "" },
        });
      });

      expect(result.current.touched.name).toBe(true);
    });

    it("validates field on blur", () => {
      const rules = {
        name: [(value) => (!value ? "Required" : "")],
      };
      const { result } = renderHook(() =>
        useFormValidation({ name: "" }, rules)
      );

      act(() => {
        result.current.handleBlur({
          target: { name: "name", value: "" },
        });
      });

      expect(result.current.errors.name).toBe("Required");
    });

    it("clears error when value becomes valid on blur", () => {
      const rules = {
        name: [(value) => (!value ? "Required" : "")],
      };
      const { result } = renderHook(() =>
        useFormValidation({ name: "" }, rules)
      );

      // First blur with empty value
      act(() => {
        result.current.handleBlur({
          target: { name: "name", value: "" },
        });
      });
      expect(result.current.errors.name).toBe("Required");

      // Blur with valid value
      act(() => {
        result.current.handleBlur({
          target: { name: "name", value: "John" },
        });
      });
      expect(result.current.errors.name).toBe("");
    });
  });

  describe("validateAll", () => {
    it("returns true when all fields are valid", () => {
      const rules = {
        email: [(value) => (!value.includes("@") ? "Invalid email" : "")],
        password: [(value) => (value.length < 6 ? "Too short" : "")],
      };
      const { result } = renderHook(() =>
        useFormValidation({ email: "test@test.com", password: "123456" }, rules)
      );

      let isValid;
      act(() => {
        isValid = result.current.validateAll();
      });

      expect(isValid).toBe(true);
      expect(result.current.errors).toEqual({});
    });

    it("returns false when any field is invalid", () => {
      const rules = {
        email: [(value) => (!value.includes("@") ? "Invalid email" : "")],
        password: [(value) => (value.length < 6 ? "Too short" : "")],
      };
      const { result } = renderHook(() =>
        useFormValidation({ email: "invalid", password: "123" }, rules)
      );

      let isValid;
      act(() => {
        isValid = result.current.validateAll();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.email).toBe("Invalid email");
      expect(result.current.errors.password).toBe("Too short");
    });

    it("runs multiple validation rules in order", () => {
      const rules = {
        password: [
          (value) => (!value ? "Required" : ""),
          (value) => (value && value.length < 6 ? "Too short" : ""),
        ],
      };
      const { result } = renderHook(() =>
        useFormValidation({ password: "" }, rules)
      );

      act(() => {
        result.current.validateAll();
      });

      // Should stop at first error
      expect(result.current.errors.password).toBe("Required");
    });
  });

  describe("reset", () => {
    it("resets values to initial state", () => {
      const initialValues = { name: "initial" };
      const { result } = renderHook(() =>
        useFormValidation(initialValues, {})
      );

      act(() => {
        result.current.handleChange({
          target: { name: "name", value: "changed", type: "text" },
        });
      });
      expect(result.current.values.name).toBe("changed");

      act(() => {
        result.current.reset();
      });
      expect(result.current.values.name).toBe("initial");
    });

    it("clears errors on reset", () => {
      const rules = {
        name: [(value) => (!value ? "Required" : "")],
      };
      const { result } = renderHook(() =>
        useFormValidation({ name: "" }, rules)
      );

      act(() => {
        result.current.validateAll();
      });
      expect(result.current.errors.name).toBe("Required");

      act(() => {
        result.current.reset();
      });
      expect(result.current.errors).toEqual({});
    });

    it("clears touched state on reset", () => {
      const { result } = renderHook(() =>
        useFormValidation({ name: "" }, {})
      );

      act(() => {
        result.current.handleBlur({
          target: { name: "name", value: "" },
        });
      });
      expect(result.current.touched.name).toBe(true);

      act(() => {
        result.current.reset();
      });
      expect(result.current.touched).toEqual({});
    });
  });

  describe("setFieldValue", () => {
    it("sets a single field value", () => {
      const { result } = renderHook(() =>
        useFormValidation({ name: "", email: "" }, {})
      );

      act(() => {
        result.current.setFieldValue("email", "test@test.com");
      });

      expect(result.current.values.email).toBe("test@test.com");
      expect(result.current.values.name).toBe("");
    });
  });

  describe("setValues", () => {
    it("sets all values", () => {
      const { result } = renderHook(() =>
        useFormValidation({ name: "", email: "" }, {})
      );

      act(() => {
        result.current.setValues({ name: "John", email: "john@test.com" });
      });

      expect(result.current.values).toEqual({
        name: "John",
        email: "john@test.com",
      });
    });
  });
});

describe("validators", () => {
  describe("required", () => {
    it("returns error for empty string", () => {
      const validate = validators.required();
      expect(validate("")).toBe("This field is required");
    });

    it("returns error for whitespace-only string", () => {
      const validate = validators.required();
      expect(validate("   ")).toBe("This field is required");
    });

    it("returns empty string for valid value", () => {
      const validate = validators.required();
      expect(validate("test")).toBe("");
    });

    it("returns error for null/undefined", () => {
      const validate = validators.required();
      expect(validate(null)).toBe("This field is required");
      expect(validate(undefined)).toBe("This field is required");
    });

    it("uses custom message", () => {
      const validate = validators.required("Please fill this field");
      expect(validate("")).toBe("Please fill this field");
    });
  });

  describe("minLength", () => {
    it("returns error when value is too short", () => {
      const validate = validators.minLength(5);
      expect(validate("abc")).toBe("Must be at least 5 characters");
    });

    it("returns empty string when value meets minimum", () => {
      const validate = validators.minLength(5);
      expect(validate("abcde")).toBe("");
    });

    it("returns empty string for empty value (use with required)", () => {
      const validate = validators.minLength(5);
      expect(validate("")).toBe("");
    });

    it("uses custom message", () => {
      const validate = validators.minLength(5, "Too short!");
      expect(validate("abc")).toBe("Too short!");
    });
  });

  describe("maxLength", () => {
    it("returns error when value is too long", () => {
      const validate = validators.maxLength(3);
      expect(validate("abcd")).toBe("Must be no more than 3 characters");
    });

    it("returns empty string when value meets maximum", () => {
      const validate = validators.maxLength(3);
      expect(validate("abc")).toBe("");
    });

    it("uses custom message", () => {
      const validate = validators.maxLength(3, "Too long!");
      expect(validate("abcd")).toBe("Too long!");
    });
  });

  describe("email", () => {
    it("returns error for invalid email", () => {
      const validate = validators.email();
      expect(validate("notanemail")).toBe("Invalid email address");
      expect(validate("missing@domain")).toBe("Invalid email address");
      expect(validate("@nodomain.com")).toBe("Invalid email address");
    });

    it("returns empty string for valid email", () => {
      const validate = validators.email();
      expect(validate("test@example.com")).toBe("");
      expect(validate("user.name@domain.co.uk")).toBe("");
    });

    it("returns empty string for empty value", () => {
      const validate = validators.email();
      expect(validate("")).toBe("");
    });

    it("uses custom message", () => {
      const validate = validators.email("Bad email!");
      expect(validate("invalid")).toBe("Bad email!");
    });
  });

  describe("pattern", () => {
    it("returns error when pattern does not match", () => {
      const validate = validators.pattern(/^[A-Z]+$/);
      expect(validate("abc")).toBe("Invalid format");
    });

    it("returns empty string when pattern matches", () => {
      const validate = validators.pattern(/^[A-Z]+$/);
      expect(validate("ABC")).toBe("");
    });

    it("uses custom message", () => {
      const validate = validators.pattern(/^[A-Z]+$/, "Must be uppercase");
      expect(validate("abc")).toBe("Must be uppercase");
    });
  });

  describe("number", () => {
    it("returns error for non-numeric value", () => {
      const validate = validators.number();
      expect(validate("abc")).toBe("Must be a number");
    });

    it("returns empty string for numeric value", () => {
      const validate = validators.number();
      expect(validate("123")).toBe("");
      expect(validate("12.34")).toBe("");
      expect(validate("-5")).toBe("");
    });

    it("returns empty string for empty value", () => {
      const validate = validators.number();
      expect(validate("")).toBe("");
    });
  });

  describe("min", () => {
    it("returns error when value is below minimum", () => {
      const validate = validators.min(10);
      expect(validate("5")).toBe("Must be at least 10");
    });

    it("returns empty string when value meets minimum", () => {
      const validate = validators.min(10);
      expect(validate("10")).toBe("");
      expect(validate("15")).toBe("");
    });

    it("uses custom message", () => {
      const validate = validators.min(10, "Value too low");
      expect(validate("5")).toBe("Value too low");
    });
  });

  describe("max", () => {
    it("returns error when value exceeds maximum", () => {
      const validate = validators.max(10);
      expect(validate("15")).toBe("Must be no more than 10");
    });

    it("returns empty string when value meets maximum", () => {
      const validate = validators.max(10);
      expect(validate("10")).toBe("");
      expect(validate("5")).toBe("");
    });

    it("uses custom message", () => {
      const validate = validators.max(10, "Value too high");
      expect(validate("15")).toBe("Value too high");
    });
  });
});
