import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import UserContext from "../auth/UserContext";
import ClassroomForm from "./ClassroomForm";

// Mock the API
vi.mock("../api", () => ({
  default: {
    getClassroom: vi.fn(),
    createClassroom: vi.fn(),
    updateClassroom: vi.fn(),
    getPeriods: vi.fn(),
  },
}));

import SeatingApi from "../api";

const mockClassroom = {
  classroomId: "testid",
  seatAlphabetical: true,
  seatRandomize: false,
  seatHighLow: false,
  seatMaleFemale: false,
  eseIsPriority: false,
  ellIsPriority: false,
  fiveZeroFourIsPriority: true,
  ebdIsPriority: true,
  seatingConfig: Array(12).fill(null).map(() => Array(12).fill(null)),
};

const renderWithProviders = () => {
  const currentUser = { username: "testuser" };
  return render(
    <ChakraProvider>
      <UserContext.Provider value={{ currentUser }}>
        <MemoryRouter>
          <ClassroomForm />
        </MemoryRouter>
      </UserContext.Provider>
    </ChakraProvider>
  );
};

describe("ClassroomForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock values for getPeriods
    SeatingApi.getPeriods.mockResolvedValue([
      { number: 1, periodId: 1, title: "Period 1" },
    ]);
  });

  it("renders loading spinner initially", () => {
    SeatingApi.getClassroom.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderWithProviders();

    const loadingElements = screen.getAllByText("Loading...");
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it("renders the classroom form after loading", async () => {
    SeatingApi.getClassroom.mockResolvedValue(mockClassroom);
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Classroom Setup")).toBeInTheDocument();
    });
  });

  it("renders seating style options", async () => {
    SeatingApi.getClassroom.mockResolvedValue(mockClassroom);
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/Seating style:/i)).toBeInTheDocument();
    });
  });

  it("renders the classroom form with seating style options", async () => {
    SeatingApi.getClassroom.mockResolvedValue(mockClassroom);
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/Seating style:/i)).toBeInTheDocument();
    });
  });

  it("fetches classroom data on mount", async () => {
    SeatingApi.getClassroom.mockResolvedValue(mockClassroom);
    renderWithProviders();

    await waitFor(() => {
      expect(SeatingApi.getClassroom).toHaveBeenCalledWith("testuser");
    });
  });
});
