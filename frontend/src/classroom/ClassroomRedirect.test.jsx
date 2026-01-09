import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import UserContext from "../auth/UserContext";
import { DemoProvider } from "../demo/DemoContext";
import ClassroomRedirect from "./ClassroomRedirect";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the API
vi.mock("../api", () => ({
  default: {
    getPeriods: vi.fn(),
  },
}));

import SeatingApi from "../api";

const mockPeriods = [
  { number: 1, periodId: 1, title: "Period 1" },
  { number: 2, periodId: 2, title: "Period 2" },
  { number: 3, periodId: 3, title: "Period 3" },
];

const renderWithProviders = (classroomId = "classroom-123") => {
  const currentUser = { username: "testuser" };
  return render(
    <ChakraProvider>
      <DemoProvider>
        <UserContext.Provider value={{ currentUser }}>
          <MemoryRouter>
            <ClassroomRedirect classroomId={classroomId} />
          </MemoryRouter>
        </UserContext.Provider>
      </DemoProvider>
    </ChakraProvider>
  );
};

describe("ClassroomRedirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading spinner initially", () => {
    SeatingApi.getPeriods.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderWithProviders();

    const loadingElements = screen.getAllByText("Loading...");
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it("renders the 'Create Seating Chart' heading after loading", async () => {
    SeatingApi.getPeriods.mockResolvedValue(mockPeriods);
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Create Seating Chart:")).toBeInTheDocument();
    });
  });

  it("renders period buttons after fetching data", async () => {
    SeatingApi.getPeriods.mockResolvedValue(mockPeriods);
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Period 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Period 2" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Period 3" })).toBeInTheDocument();
    });
  });

  it("displays 'No periods added yet' when there are no periods", async () => {
    SeatingApi.getPeriods.mockResolvedValue([]);
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("No periods added yet")).toBeInTheDocument();
    });
  });

  it("navigates to seating chart page when a period button is clicked", async () => {
    SeatingApi.getPeriods.mockResolvedValue(mockPeriods);
    renderWithProviders("classroom-123");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Period 1" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Period 1" }));

    expect(mockNavigate).toHaveBeenCalledWith("/classrooms/classroom-123/seating-charts/1");
  });
});
