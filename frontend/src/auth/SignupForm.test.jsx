import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import SignupForm from "./SignupForm";

const mockSignup = vi.fn();

const renderWithProviders = (signup = mockSignup) => {
  return render(
    <ChakraProvider>
      <MemoryRouter>
        <SignupForm signup={signup} />
      </MemoryRouter>
    </ChakraProvider>
  );
};

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignup.mockResolvedValue({ success: true, errors: [] });
  });

  it("renders without crashing", () => {
    renderWithProviders();
    expect(screen.getByRole("heading", { name: "Sign up" })).toBeInTheDocument();
  });

  it("can fill out the form and submit successfully", async () => {
    renderWithProviders();

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    // Title defaults to "Mr." so we don't need to change it
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "johndoe@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() => expect(mockSignup).toHaveBeenCalledTimes(1));
  });

  it("renders title selection options", () => {
    renderWithProviders();
    expect(screen.getByText("Mr.")).toBeInTheDocument();
    expect(screen.getByText("Mrs.")).toBeInTheDocument();
    expect(screen.getByText("Ms.")).toBeInTheDocument();
  });
});
