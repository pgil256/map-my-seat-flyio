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

    const _TestComponent = () => {
      const [formData, setFormData] = useState({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        title: currentUser.title,
        username: currentUser.username,
        password: "",
      });

      const _handlePasswordChange = (event) => {
        setFormData({ ...formData, password: event.target.value });
      };
    };
  });
});
