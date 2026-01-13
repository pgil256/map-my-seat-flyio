import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import LoginForm from "./LoginForm";

const mockLogin = vi.fn();

const renderWithProviders = (login = mockLogin) => {
  return render(
    <ChakraProvider>
      <MemoryRouter>
        <LoginForm login={login} />
      </MemoryRouter>
    </ChakraProvider>
  );
};

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue({ success: true });
  });

  it("renders without crashing", () => {
    renderWithProviders();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("can fill out the form and submit successfully", async () => {
    renderWithProviders();

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(1));
  });

  it("displays error messages when form submission fails", async () => {
    const mockErrorLogin = vi.fn().mockResolvedValue({
      success: false,
      errors: ["Invalid credentials"],
    });

    renderWithProviders(mockErrorLogin);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "invalidpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => expect(mockErrorLogin).toHaveBeenCalledTimes(1));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
