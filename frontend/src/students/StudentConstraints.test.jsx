import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import StudentConstraints from "./StudentConstraints";
import UserContext from "../auth/UserContext";
import SeatingApi from "../api";

// Mock the API
vi.mock("../api", () => ({
  default: {
    getConstraints: vi.fn(),
    createConstraint: vi.fn(),
    deleteConstraint: vi.fn(),
  },
}));

const mockStudents = [
  { studentId: 1, name: "John Doe" },
  { studentId: 2, name: "Jane Smith" },
  { studentId: 3, name: "Bob Wilson" },
];

const mockConstraints = [
  {
    constraintId: 1,
    studentId1: 1,
    studentId2: 2,
    constraintType: "separate",
    studentName1: "John Doe",
    studentName2: "Jane Smith",
  },
];

const renderWithProviders = (ui, { currentUser = { username: "testuser" } } = {}) => {
  return render(
    <ChakraProvider>
      <UserContext.Provider value={{ currentUser }}>
        {ui}
      </UserContext.Provider>
    </ChakraProvider>
  );
};

describe("StudentConstraints", { timeout: 15000 }, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    SeatingApi.getConstraints.mockResolvedValue(mockConstraints);
  });

  describe("rendering", () => {
    it("renders the component heading", () => {
      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      expect(screen.getByText("Student Seating Rules")).toBeInTheDocument();
    });

    it("renders student select dropdowns", () => {
      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      const selectElements = screen.getAllByRole("combobox");
      expect(selectElements.length).toBeGreaterThanOrEqual(2);
    });

    it("renders Add button", () => {
      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    });

    it("populates student dropdowns with student options", () => {
      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      expect(screen.getAllByText("John Doe").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Jane Smith").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Bob Wilson").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("fetching constraints", () => {
    it("fetches constraints on mount when periodId is provided", async () => {
      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      await waitFor(() => {
        expect(SeatingApi.getConstraints).toHaveBeenCalledWith("testuser", 1);
      });
    });

    it("displays existing constraints", async () => {
      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      await waitFor(() => {
        expect(screen.getByText("Active Rules:")).toBeInTheDocument();
      });
    });

    it("does not fetch if periodId is not provided", async () => {
      renderWithProviders(
        <StudentConstraints periodId={null} students={mockStudents} />
      );

      await waitFor(() => {
        expect(SeatingApi.getConstraints).not.toHaveBeenCalled();
      });
    });
  });

  describe("adding constraints", () => {
    it("shows warning toast when student 1 is not selected", async () => {
      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      const addButton = screen.getByRole("button", { name: /add/i });
      fireEvent.click(addButton);

      // The toast would show "Select two students" - we just verify createConstraint is not called
      expect(SeatingApi.createConstraint).not.toHaveBeenCalled();
    });

    it("shows warning toast when same student is selected twice", async () => {
      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      // Select same student in both dropdowns
      const selectElements = screen.getAllByRole("combobox");
      fireEvent.change(selectElements[0], { target: { value: "1" } });
      fireEvent.change(selectElements[2], { target: { value: "1" } });

      const addButton = screen.getByRole("button", { name: /add/i });
      fireEvent.click(addButton);

      expect(SeatingApi.createConstraint).not.toHaveBeenCalled();
    });

    it("creates constraint when two different students are selected", async () => {
      SeatingApi.createConstraint.mockResolvedValue({
        constraintId: 2,
        studentId1: 1,
        studentId2: 3,
        constraintType: "separate",
      });

      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      // Select students
      const selectElements = screen.getAllByRole("combobox");
      fireEvent.change(selectElements[0], { target: { value: "1" } });
      fireEvent.change(selectElements[2], { target: { value: "3" } });

      const addButton = screen.getByRole("button", { name: /add/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(SeatingApi.createConstraint).toHaveBeenCalledWith(
          "testuser",
          1,
          {
            studentId1: 1,
            studentId2: 3,
            constraintType: "separate",
          }
        );
      });
    });

    it("can select 'pair' constraint type", async () => {
      SeatingApi.createConstraint.mockResolvedValue({
        constraintId: 2,
        studentId1: 1,
        studentId2: 2,
        constraintType: "pair",
      });

      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      // Select students and change type
      const selectElements = screen.getAllByRole("combobox");
      fireEvent.change(selectElements[0], { target: { value: "1" } });
      fireEvent.change(selectElements[1], { target: { value: "pair" } }); // constraint type
      fireEvent.change(selectElements[2], { target: { value: "2" } });

      const addButton = screen.getByRole("button", { name: /add/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(SeatingApi.createConstraint).toHaveBeenCalledWith(
          "testuser",
          1,
          expect.objectContaining({
            constraintType: "pair",
          })
        );
      });
    });

    it("resets student selection after successful add", async () => {
      SeatingApi.createConstraint.mockResolvedValue({
        constraintId: 2,
        studentId1: 1,
        studentId2: 3,
        constraintType: "separate",
      });

      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      const selectElements = screen.getAllByRole("combobox");
      fireEvent.change(selectElements[0], { target: { value: "1" } });
      fireEvent.change(selectElements[2], { target: { value: "3" } });

      const addButton = screen.getByRole("button", { name: /add/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        // After successful add, the selection should reset
        expect(selectElements[0]).toHaveValue("");
        expect(selectElements[2]).toHaveValue("");
      });
    });
  });

  describe("deleting constraints", () => {
    it("renders delete button for each constraint", async () => {
      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      await waitFor(() => {
        const deleteButton = screen.getByRole("button", { name: /remove constraint/i });
        expect(deleteButton).toBeInTheDocument();
      });
    });

    it("calls deleteConstraint API when delete button is clicked", async () => {
      SeatingApi.deleteConstraint.mockResolvedValue({});

      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      await waitFor(() => {
        expect(screen.getByText("Active Rules:")).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: /remove constraint/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(SeatingApi.deleteConstraint).toHaveBeenCalledWith("testuser", 1, 1);
      });
    });

    it("removes constraint from display after successful delete", async () => {
      SeatingApi.deleteConstraint.mockResolvedValue({});

      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      await waitFor(() => {
        expect(screen.getByText("Active Rules:")).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: /remove constraint/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByText("Active Rules:")).not.toBeInTheDocument();
      });
    });
  });

  describe("constraint display", () => {
    it("shows 'apart from' badge for separate constraints", async () => {
      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      await waitFor(() => {
        expect(screen.getByText("apart from")).toBeInTheDocument();
      });
    });

    it("shows 'with' badge for pair constraints", async () => {
      SeatingApi.getConstraints.mockResolvedValue([
        {
          constraintId: 1,
          studentId1: 1,
          studentId2: 2,
          constraintType: "pair",
          studentName1: "John Doe",
          studentName2: "Jane Smith",
        },
      ]);

      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      await waitFor(() => {
        expect(screen.getByText("with")).toBeInTheDocument();
      });
    });
  });

  describe("error handling", () => {
    it("handles API error when fetching constraints", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      SeatingApi.getConstraints.mockRejectedValue(new Error("API Error"));

      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it("handles API error when creating constraint", async () => {
      SeatingApi.createConstraint.mockRejectedValue(new Error("API Error"));

      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      const selectElements = screen.getAllByRole("combobox");
      fireEvent.change(selectElements[0], { target: { value: "1" } });
      fireEvent.change(selectElements[2], { target: { value: "3" } });

      const addButton = screen.getByRole("button", { name: /add/i });
      fireEvent.click(addButton);

      // Should not crash, toast should show error (we verify API was called)
      await waitFor(() => {
        expect(SeatingApi.createConstraint).toHaveBeenCalled();
      });
    });

    it("handles API error when deleting constraint", async () => {
      SeatingApi.deleteConstraint.mockRejectedValue(new Error("API Error"));

      renderWithProviders(
        <StudentConstraints periodId={1} students={mockStudents} />
      );

      await waitFor(() => {
        expect(screen.getByText("Active Rules:")).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: /remove constraint/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(SeatingApi.deleteConstraint).toHaveBeenCalled();
      });
    });
  });
});
