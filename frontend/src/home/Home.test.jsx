import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import UserContext from "../auth/UserContext";
import { DemoProvider } from "../demo/DemoContext";
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
      <DemoProvider>
        <UserContext.Provider value={{ currentUser }}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </UserContext.Provider>
      </DemoProvider>
    </ChakraProvider>
  );
};

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the landing page when user is not logged in", () => {
    renderWithProviders(null);
    expect(screen.getByText(/Seating charts/)).toBeInTheDocument();
    expect(screen.getByText(/made easy/)).toBeInTheDocument();
  });

  it(
    "renders personalized welcome when user is logged in with firstName",
    { timeout: 15000 },
    async () => {
      const currentUser = { firstName: "John", username: "johndoe" };
      renderWithProviders(currentUser);

      await waitFor(
        () => {
          expect(screen.getByText(/Welcome, John/)).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    }
  );

  it("renders welcome with username when firstName is not available", async () => {
    const currentUser = { username: "johndoe" };
    renderWithProviders(currentUser);

    await waitFor(() => {
      expect(screen.getByText(/Welcome, johndoe/)).toBeInTheDocument();
    });
  });

  it("shows CTA buttons on landing page when not logged in", () => {
    renderWithProviders(null);
    // Landing page has multiple "Get Started" buttons and "Log In" button
    expect(screen.getAllByRole("button", { name: /get started/i }).length).toBeGreaterThan(0);
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
