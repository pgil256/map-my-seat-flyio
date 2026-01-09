import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { vi } from "vitest";

import AppRouter from "./AppRouter";
import UserContext from "../auth/UserContext";
import { ToastProvider } from "../common/ToastContext";
import { DemoProvider } from "../demo/DemoContext";

// Mock the API to prevent actual network calls
vi.mock("../api", () => ({
  default: {
    getPeriods: vi.fn().mockResolvedValue([
      { periodId: 1, number: 1, title: "Math", students: [] },
    ]),
    getClassrooms: vi.fn().mockResolvedValue([]),
    getPeriod: vi.fn().mockResolvedValue([]),
    getClassroom: vi.fn().mockResolvedValue({
      classroomId: "1",
      seatingConfig: Array(12).fill(null).map(() => Array(12).fill(null)),
      seatAlphabetical: true,
      seatRandomize: false,
      seatHighLow: false,
      seatMaleFemale: false,
      eseIsPriority: false,
      ellIsPriority: false,
      fiveZeroFourIsPriority: false,
      ebdIsPriority: false,
    }),
    getSeatingChart: vi.fn().mockResolvedValue({ assignments: [] }),
  },
}));

const mockUser = { username: "testuser", isAdmin: false };

const renderWithProviders = (route) => {
  return render(
    <ChakraProvider>
      <ToastProvider>
        <DemoProvider>
          <UserContext.Provider value={{ currentUser: mockUser }}>
            <MemoryRouter initialEntries={[route]}>
              <AppRouter />
            </MemoryRouter>
          </UserContext.Provider>
        </DemoProvider>
      </ToastProvider>
    </ChakraProvider>
  );
};

describe("AppRouter", () => {
  it("renders Home component for / route", { timeout: 15000 }, async () => {
    renderWithProviders("/");
    await waitFor(
      () => {
        // When logged in, shows personalized welcome message
        expect(screen.getByText(/Welcome, testuser/)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("renders LoginForm component for /login route", () => {
    renderWithProviders("/login");
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders SignupForm component for /signup route", () => {
    renderWithProviders("/signup");
    expect(screen.getByRole("heading", { name: "Sign up" })).toBeInTheDocument();
  });

  it("renders PeriodForm component for /periods route", async () => {
    renderWithProviders("/periods");
    await waitFor(() => {
      expect(screen.getByText("Enter Class Periods")).toBeInTheDocument();
    });
  });

  it("renders StudentForm component for /periods/:periodId route", async () => {
    renderWithProviders("/periods/1");
    await waitFor(() => {
      expect(screen.getByText("Add New Student")).toBeInTheDocument();
    });
  });

  it("renders ClassroomForm component for /classrooms route", async () => {
    renderWithProviders("/classrooms");
    await waitFor(() => {
      expect(screen.getByText("Classroom Setup")).toBeInTheDocument();
    });
  });

  it("renders SeatingChart component for /classrooms/:classroomId/seating-charts/:number route", { timeout: 15000 }, async () => {
    renderWithProviders("/classrooms/1/seating-charts/1");
    await waitFor(() => {
      expect(screen.getByText(/Period.*Seating Chart/)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it("renders ProfileForm component for /profile route", async () => {
    renderWithProviders("/profile");
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument();
    });
  });
});
