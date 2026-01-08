import { useState, useCallback } from "react";

function useFormValidation(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback(
    (fieldName, fieldValue) => {
      const rules = validationRules[fieldName];
      if (!rules) return "";

      for (const rule of rules) {
        const error = rule(fieldValue, values);
        if (error) return error;
      }
      return "";
    },
    [validationRules, values]
  );

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((fieldName) => {
      const error = validate(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values, validate]);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === "checkbox" ? checked : value;

      setValues((prev) => ({ ...prev, [name]: fieldValue }));

      if (touched[name]) {
        const error = validate(name, fieldValue);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validate]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validate(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validate]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setFieldValue,
    setValues,
  };
}

export const validators = {
  required: (message = "This field is required") => (value) =>
    !value || (typeof value === "string" && !value.trim()) ? message : "",

  minLength: (min, message) => (value) =>
    value && value.length < min
      ? message || `Must be at least ${min} characters`
      : "",

  maxLength: (max, message) => (value) =>
    value && value.length > max
      ? message || `Must be no more than ${max} characters`
      : "",

  email: (message = "Invalid email address") => (value) =>
    value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? message : "",

  pattern: (regex, message = "Invalid format") => (value) =>
    value && !regex.test(value) ? message : "",

  number: (message = "Must be a number") => (value) =>
    value && isNaN(Number(value)) ? message : "",

  min: (min, message) => (value) =>
    value && Number(value) < min
      ? message || `Must be at least ${min}`
      : "",

  max: (max, message) => (value) =>
    value && Number(value) > max
      ? message || `Must be no more than ${max}`
      : "",
};

export default useFormValidation;
