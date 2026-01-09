import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import UserContext from "../auth/UserContext";
import Home from "./Home";

// Mock the API
vi.mock("../api", () => ({
  default: {
    getPeriods: vi.fn().mockResolvedValue([]),
    getClassroom: vi.fn().mockResolvedValue(null),
  },
}));

const renderWithProviders = (currentUser = null) => {
  return render(
    <ChakraProvider>
      <UserContext.Provider value={{ currentUser }}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </UserContext.Provider>
    </ChakraProvider>
  );
};

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the welcome message when user is not logged in", () => {
    renderWithProviders(null);
    expect(screen.getByText("Welcome to Map My Seat")).toBeInTheDocument();
  });

  it("renders personalized welcome when user is logged in with firstName", async () => {
    const currentUser = { firstName: "John", username: "johndoe" };
    renderWithProviders(currentUser);

    await waitFor(() => {
      expect(screen.getByText(/Welcome, John/)).toBeInTheDocument();
    });
  });

  it("renders welcome with username when firstName is not available", async () => {
    const currentUser = { username: "johndoe" };
    renderWithProviders(currentUser);

    await waitFor(() => {
      expect(screen.getByText(/Welcome, johndoe/)).toBeInTheDocument();
    });
  });

  it("shows login and signup buttons when not logged in", () => {
    renderWithProviders(null);
    expect(screen.getByRole("button", { name: /get started/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("shows getting started instructions when logged in", async () => {
    const currentUser = { firstName: "John", username: "johndoe" };
    renderWithProviders(currentUser);

    await waitFor(() => {
      expect(screen.getByText(/To get started:/i)).toBeInTheDocument();
    });
  });
});
