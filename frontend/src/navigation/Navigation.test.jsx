import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import UserContext from "../auth/UserContext";
import Navigation from "./Navigation";

const mockLogout = vi.fn();

const renderWithProviders = (currentUser = null) => {
  return render(
    <ChakraProvider>
      <UserContext.Provider value={{ currentUser }}>
        <MemoryRouter>
          <Navigation logout={mockLogout} />
        </MemoryRouter>
      </UserContext.Provider>
    </ChakraProvider>
  );
};

describe("Navigation component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correct navigation links when user is logged in", () => {
    const currentUser = { username: "johndoe", firstName: "John" };
    renderWithProviders(currentUser);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Set Up Classes")).toBeInTheDocument();
    expect(screen.getByText("Create Classroom")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("renders correct navigation links when user is not logged in", () => {
    renderWithProviders(null);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Log In")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("calls the logout function when Logout link is clicked", () => {
    const currentUser = { username: "johndoe", firstName: "John" };
    renderWithProviders(currentUser);

    const logoutLink = screen.getByText("Logout");
    fireEvent.click(logoutLink);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
