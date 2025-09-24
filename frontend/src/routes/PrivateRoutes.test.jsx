import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserContext from "../auth/UserContext";
import PrivateRoute from "./PrivateRoute";

describe("PrivateRoute", () => {
  test("renders children when currentUser is present", () => {
    const currentUser = { name: "Test User" };
    render(
      <UserContext.Provider value={{ currentUser }}>
        <MemoryRouter>
          <PrivateRoute path="/test">
            <div data-testid="child">Child component</div>
          </PrivateRoute>
        </MemoryRouter>
      </UserContext.Provider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  test("redirects to login page when currentUser is not present", () => {
    const currentUser = null;
    const historyMock = { push: jest.fn() };
    render(
      <UserContext.Provider value={{ currentUser }}>
        <MemoryRouter>
          <PrivateRoute path="/test" history={historyMock}>
            <div data-testid="child">Child component</div>
          </PrivateRoute>
        </MemoryRouter>
      </UserContext.Provider>
    );

    expect(historyMock.push).toHaveBeenCalledWith("/login");
  });
});
