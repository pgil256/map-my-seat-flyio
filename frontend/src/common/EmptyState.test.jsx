import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import EmptyState from "./EmptyState";

const renderWithProviders = (ui) => {
  return render(
    <ChakraProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ChakraProvider>
  );
};

describe("EmptyState", () => {
  describe("basic rendering", () => {
    it("renders title", () => {
      renderWithProviders(<EmptyState title="No items found" />);

      expect(screen.getByText("No items found")).toBeInTheDocument();
    });

    it("renders with correct styling", () => {
      renderWithProviders(<EmptyState title="Empty" />);

      const container = screen.getByText("Empty").closest("div");
      expect(container).toBeInTheDocument();
    });
  });

  describe("icon rendering", () => {
    it("renders icon when provided", () => {
      renderWithProviders(
        <EmptyState title="Empty" icon={<AddIcon data-testid="add-icon" />} />
      );

      expect(screen.getByTestId("add-icon")).toBeInTheDocument();
    });

    it("does not render icon container when not provided", () => {
      const { container } = renderWithProviders(
        <EmptyState title="Empty" />
      );

      // The icon would be in a Box with specific styling - no svg should exist
      expect(container.querySelector("svg")).not.toBeInTheDocument();
    });
  });

  describe("description rendering", () => {
    it("renders description when provided", () => {
      renderWithProviders(
        <EmptyState
          title="No students"
          description="Add students to get started"
        />
      );

      expect(screen.getByText("Add students to get started")).toBeInTheDocument();
    });

    it("does not render description when not provided", () => {
      renderWithProviders(<EmptyState title="Empty" />);

      // Only the title text should be present
      expect(screen.getByText("Empty")).toBeInTheDocument();
      expect(screen.queryByText(/add|get started/i)).not.toBeInTheDocument();
    });
  });

  describe("action button with link", () => {
    it("renders action link when actionLabel and actionTo provided", () => {
      renderWithProviders(
        <EmptyState
          title="No classrooms"
          actionLabel="Create Classroom"
          actionTo="/classrooms/new"
        />
      );

      // When actionTo is provided, Button renders as a link (<a> tag)
      expect(
        screen.getByRole("link", { name: "Create Classroom" })
      ).toBeInTheDocument();
    });

    it("action link has correct href", () => {
      renderWithProviders(
        <EmptyState
          title="No classrooms"
          actionLabel="Create Classroom"
          actionTo="/classrooms/new"
        />
      );

      const link = screen.getByRole("link", { name: "Create Classroom" });
      expect(link).toHaveAttribute("href", "/classrooms/new");
    });
  });

  describe("action button with click handler", () => {
    it("renders action button when actionLabel and onAction provided", () => {
      const mockAction = vi.fn();
      renderWithProviders(
        <EmptyState
          title="Empty"
          actionLabel="Add Item"
          onAction={mockAction}
        />
      );

      expect(
        screen.getByRole("button", { name: "Add Item" })
      ).toBeInTheDocument();
    });

    it("calls onAction when button clicked", () => {
      const mockAction = vi.fn();
      renderWithProviders(
        <EmptyState
          title="Empty"
          actionLabel="Add Item"
          onAction={mockAction}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "Add Item" }));

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it("action button without actionTo does not have href", () => {
      const mockAction = vi.fn();
      renderWithProviders(
        <EmptyState
          title="Empty"
          actionLabel="Add Item"
          onAction={mockAction}
        />
      );

      const button = screen.getByRole("button", { name: "Add Item" });
      expect(button).not.toHaveAttribute("href");
    });
  });

  describe("no action button", () => {
    it("does not render link when actionLabel not provided", () => {
      renderWithProviders(
        <EmptyState title="Empty" actionTo="/some-route" />
      );

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("does not render button when neither actionTo nor onAction provided", () => {
      renderWithProviders(
        <EmptyState title="Empty" actionLabel="Add Item" />
      );

      // Should not render because neither actionTo nor onAction provided
      expect(screen.queryByRole("button", { name: "Add Item" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Add Item" })).not.toBeInTheDocument();
    });
  });

  describe("full component rendering", () => {
    it("renders all elements when all props provided", () => {
      const mockAction = vi.fn();
      renderWithProviders(
        <EmptyState
          icon={<AddIcon data-testid="icon" />}
          title="No students"
          description="Create your first student to get started."
          actionLabel="Add Student"
          actionTo="/students/new"
          onAction={mockAction}
        />
      );

      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByText("No students")).toBeInTheDocument();
      expect(
        screen.getByText("Create your first student to get started.")
      ).toBeInTheDocument();
      // When actionTo is provided, renders as link
      expect(
        screen.getByRole("link", { name: "Add Student" })
      ).toBeInTheDocument();
    });

    it("renders minimum required props", () => {
      renderWithProviders(<EmptyState title="Nothing here" />);

      expect(screen.getByText("Nothing here")).toBeInTheDocument();
    });
  });
});
