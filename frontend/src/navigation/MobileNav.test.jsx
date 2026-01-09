import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import MobileNav from "./MobileNav";

const renderWithProviders = (ui) => {
  return render(
    <ChakraProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ChakraProvider>
  );
};

describe("MobileNav", () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders hamburger menu button", () => {
    renderWithProviders(<MobileNav logout={mockLogout} />);

    expect(
      screen.getByRole("button", { name: /open menu/i })
    ).toBeInTheDocument();
  });

  it("opens drawer on hamburger click", async () => {
    renderWithProviders(<MobileNav logout={mockLogout} />);

    const menuButton = screen.getByRole("button", { name: /open menu/i });
    fireEvent.click(menuButton);

    await waitFor(
      () => {
        expect(screen.getByText("Menu")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it("shows Home link in drawer", async () => {
    renderWithProviders(<MobileNav logout={mockLogout} />);

    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));

    await waitFor(() => {
      // NavLink renders Button as RouterLink (anchor tag)
      expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    });
  });

  describe("when user is logged out", () => {
    it("shows Login and Sign Up links", async () => {
      renderWithProviders(<MobileNav currentUser={null} logout={mockLogout} />);

      fireEvent.click(screen.getByRole("button", { name: /open menu/i }));

      await waitFor(() => {
        // NavLink renders Button as RouterLink (anchor tag)
        expect(
          screen.getByRole("link", { name: "Log In" })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("link", { name: "Sign Up" })
        ).toBeInTheDocument();
      });
    });

    it("does not show authenticated links", async () => {
      renderWithProviders(<MobileNav currentUser={null} logout={mockLogout} />);

      fireEvent.click(screen.getByRole("button", { name: /open menu/i }));

      await waitFor(() => {
        expect(screen.getByText("Menu")).toBeInTheDocument();
      });

      expect(screen.queryByText("Set Up Classes")).not.toBeInTheDocument();
      expect(screen.queryByText("Profile")).not.toBeInTheDocument();
      expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    });
  });

  describe("when user is logged in", () => {
    const currentUser = { username: "testuser" };

    it("shows authenticated navigation links", async () => {
      renderWithProviders(
        <MobileNav currentUser={currentUser} logout={mockLogout} />
      );

      fireEvent.click(screen.getByRole("button", { name: /open menu/i }));

      await waitFor(() => {
        // NavLink renders Button as RouterLink (anchor tag)
        expect(
          screen.getByRole("link", { name: "Set Up Classes" })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("link", { name: "Create Classroom" })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("link", { name: "Profile" })
        ).toBeInTheDocument();
      });
    });

    it("shows Logout button", async () => {
      renderWithProviders(
        <MobileNav currentUser={currentUser} logout={mockLogout} />
      );

      fireEvent.click(screen.getByRole("button", { name: /open menu/i }));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Logout" })
        ).toBeInTheDocument();
      });
    });

    it("does not show login/signup links", async () => {
      renderWithProviders(
        <MobileNav currentUser={currentUser} logout={mockLogout} />
      );

      fireEvent.click(screen.getByRole("button", { name: /open menu/i }));

      await waitFor(
        () => {
          expect(screen.getByText("Menu")).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      expect(screen.queryByText("Log In")).not.toBeInTheDocument();
      expect(screen.queryByText("Sign Up")).not.toBeInTheDocument();
    });

    it("calls logout and closes drawer when Logout is clicked", async () => {
      renderWithProviders(
        <MobileNav currentUser={currentUser} logout={mockLogout} />
      );

      fireEvent.click(screen.getByRole("button", { name: /open menu/i }));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Logout" })
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: "Logout" }));

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it("includes username in classrooms link", async () => {
      renderWithProviders(
        <MobileNav currentUser={currentUser} logout={mockLogout} />
      );

      fireEvent.click(screen.getByRole("button", { name: /open menu/i }));

      await waitFor(
        () => {
          // NavLink renders Button as RouterLink (anchor tag)
          const classroomLink = screen.getByRole("link", {
            name: "Create Classroom",
          });
          expect(classroomLink).toHaveAttribute("href", "/classrooms/testuser");
        },
        { timeout: 10000 }
      );
    });
  });
});
