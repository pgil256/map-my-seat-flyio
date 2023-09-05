import { render, fireEvent } from "@testing-library/react";
import { useState } from "react";

describe("formData", () => {
  it("should update fields on change", () => {
    const currentUser = {
      firstName: "John",
      lastName: "Doe",
      email: "ex@example.com",
      title: "Mr.",
      username: "jd123",
    };

    const TestComponent = () => {
      const [formData, setFormData] = useState({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        title: currentUser.title,
        username: currentUser.username,
        password: "",
      });

      const handlePasswordChange = (event) => {
        setFormData({ ...formData, password: event.target.value });
      };
    };
  });
});
