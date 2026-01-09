import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import UserContext from "../auth/UserContext";
import PeriodForm from "./PeriodForm";

// Mock the API
vi.mock("../api", () => ({
  default: {
    getPeriods: vi.fn(),
    createPeriod: vi.fn(),
    updatePeriod: vi.fn(),
    deletePeriod: vi.fn(),
  },
}));

import SeatingApi from "../api";

const mockPeriods = [
  { periodId: 1, number: 1, title: "Math", schoolYear: "2024-2025", students: [] },
  { periodId: 2, number: 2, title: "Science", schoolYear: "2024-2025", students: [] },
];

const renderWithProviders = () => {
  const currentUser = { username: "testuser" };
  return render(
    <ChakraProvider>
      <UserContext.Provider value={{ currentUser }}>
        <MemoryRouter>
          <PeriodForm />
        </MemoryRouter>
      </UserContext.Provider>
    </ChakraProvider>
  );
};

describe("PeriodForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the heading", async () => {
    SeatingApi.getPeriods.mockResolvedValue(mockPeriods);
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Enter Class Periods")).toBeInTheDocument();
    });
  });

  it("renders the new period form", async () => {
    SeatingApi.getPeriods.mockResolvedValue(mockPeriods);
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("New Period")).toBeInTheDocument();
    });
  });

  it("renders period cards for existing periods", async () => {
    SeatingApi.getPeriods.mockResolvedValue(mockPeriods);
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Period 1")).toBeInTheDocument();
      expect(screen.getByText("Period 2")).toBeInTheDocument();
    });
  });

  it("displays period titles", async () => {
    SeatingApi.getPeriods.mockResolvedValue(mockPeriods);
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Math")).toBeInTheDocument();
      expect(screen.getByText("Science")).toBeInTheDocument();
    });
  });

  it("renders Create Period button", async () => {
    SeatingApi.getPeriods.mockResolvedValue(mockPeriods);
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /create period/i })).toBeInTheDocument();
    });
  });

  it("renders Edit Period buttons for each period", async () => {
    SeatingApi.getPeriods.mockResolvedValue(mockPeriods);
    renderWithProviders();

    await waitFor(() => {
      const editButtons = screen.getAllByRole("button", { name: /edit period/i });
      expect(editButtons.length).toBe(2);
    });
  });
});
