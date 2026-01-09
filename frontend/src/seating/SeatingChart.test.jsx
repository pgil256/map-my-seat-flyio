import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import UserContext from "../auth/UserContext";
import SeatingChart from "./SeatingChart";

// Mock the API
vi.mock("../api", () => ({
  default: {
    getClassroom: vi.fn(),
    getPeriods: vi.fn(),
    getPeriod: vi.fn(),
  },
}));

import SeatingApi from "../api";

const mockClassroom = {
  classroomId: "classroom-1",
  seatingConfig: Array(12).fill(null).map(() => Array(12).fill(null)),
  seatAlphabetical: true,
  seatRandomize: false,
  seatHighLow: false,
  seatMaleFemale: false,
  eseIsPriority: false,
  ellIsPriority: false,
  fiveZeroFourIsPriority: false,
  ebdIsPriority: false,
};

const mockPeriods = [
  { periodId: 1, number: 1, title: "Math", students: [] },
  { periodId: 2, number: 2, title: "Science", students: [] },
];

const renderWithProviders = (route = "/classrooms/1/seating-charts/1") => {
  const currentUser = { username: "testuser" };
  return render(
    <ChakraProvider>
      <UserContext.Provider value={{ currentUser }}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route
              path="/classrooms/:classroomId/seating-charts/:number"
              element={<SeatingChart />}
            />
          </Routes>
        </MemoryRouter>
      </UserContext.Provider>
    </ChakraProvider>
  );
};

describe("SeatingChart Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", async () => {
    SeatingApi.getClassroom.mockResolvedValue(mockClassroom);
    SeatingApi.getPeriods.mockResolvedValue(mockPeriods);
    SeatingApi.getPeriod.mockResolvedValue([]);

    const { container } = renderWithProviders();
    expect(container).toBeDefined();
  });

  it("fetches classroom data on mount", async () => {
    SeatingApi.getClassroom.mockResolvedValue(mockClassroom);
    SeatingApi.getPeriods.mockResolvedValue(mockPeriods);
    SeatingApi.getPeriod.mockResolvedValue([]);
    renderWithProviders();

    await waitFor(() => {
      expect(SeatingApi.getClassroom).toHaveBeenCalledWith("testuser");
    });
  });

  it("fetches periods data on mount", async () => {
    SeatingApi.getClassroom.mockResolvedValue(mockClassroom);
    SeatingApi.getPeriods.mockResolvedValue(mockPeriods);
    SeatingApi.getPeriod.mockResolvedValue([]);
    renderWithProviders();

    await waitFor(() => {
      expect(SeatingApi.getPeriods).toHaveBeenCalledWith("testuser");
    });
  });

  it("displays period number in heading after loading", async () => {
    SeatingApi.getClassroom.mockResolvedValue(mockClassroom);
    SeatingApi.getPeriods.mockResolvedValue(mockPeriods);
    SeatingApi.getPeriod.mockResolvedValue([]);
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/Period 1 Seating Chart/)).toBeInTheDocument();
    });
  });
});
