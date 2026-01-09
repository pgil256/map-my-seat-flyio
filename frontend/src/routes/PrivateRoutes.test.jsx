import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { describe, it, expect } from "vitest";
import UserContext from "../auth/UserContext";
import PrivateRoute from "./PrivateRoutes";

const renderWithProviders = (currentUser, initialRoute = "/protected") => {
  return render(
    <ChakraProvider>
      <UserContext.Provider value={{ currentUser }}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route element={<PrivateRoute />}>
              <Route path="/protected" element={<div data-testid="protected">Protected Content</div>} />
            </Route>
            <Route path="/login" element={<div data-testid="login">Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </UserContext.Provider>
    </ChakraProvider>
  );
};

describe("PrivateRoute", () => {
  it("renders children when currentUser is present", () => {
    const currentUser = { username: "testuser" };
    renderWithProviders(currentUser);

    expect(screen.getByTestId("protected")).toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to login page when currentUser is not present", () => {
    renderWithProviders(null);

    expect(screen.getByTestId("login")).toBeInTheDocument();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
  });
});
