import React from "react";
import { render } from "@testing-library/react";
import { UserContext } from "./UserContext";
import Home from "./Home";

describe("Home", () => {
  it("should render the welcome message if currentUser is defined", () => {
    const currentUser = { firstName: "John", username: "johndoe" };
    const { getByText } = render(
      <UserContext.Provider value={{ currentUser }}>
        <Home />
      </UserContext.Provider>
    );
    expect(getByText(`Welcome, ${currentUser.firstName}!`)).toBeInTheDocument();
  });
});
