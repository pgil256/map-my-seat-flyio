import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import StudentForm from "./StudentForm";
import UserContext from "../auth/UserContext";
import { DemoProvider } from "../demo/DemoContext";

// Mock the API
vi.mock("../api", () => ({
  default: {
    getPeriod: vi.fn().mockResolvedValue([]),
    createStudent: vi.fn().mockResolvedValue({}),
    updateStudent: vi.fn().mockResolvedValue({}),
    deleteStudent: vi.fn().mockResolvedValue({}),
  },
}));

const mockUser = { username: "testuser", isAdmin: false };

const renderWithProviders = (periodId = "1") => {
  return render(
    <ChakraProvider>
      <DemoProvider>
        <UserContext.Provider value={{ currentUser: mockUser }}>
          <MemoryRouter initialEntries={[`/periods/${periodId}`]}>
            <Routes>
              <Route path="/periods/:periodId" element={<StudentForm />} />
            </Routes>
          </MemoryRouter>
        </UserContext.Provider>
      </DemoProvider>
    </ChakraProvider>
  );
};

describe("StudentForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without errors", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Add New Student")).toBeInTheDocument();
    });
  });

  it("renders the update student section", async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("Update Student")).toBeInTheDocument();
    });
  });
});
