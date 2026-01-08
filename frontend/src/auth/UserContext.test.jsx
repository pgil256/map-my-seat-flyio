import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useContext } from "react";
import UserContext from "./UserContext";

// Test component that consumes the context
function TestConsumer() {
  const user = useContext(UserContext);
  return <div data-testid="user-value">{user ? user.username : "no user"}</div>;
}

describe("UserContext", () => {
  it("creates a valid React context", () => {
    expect(UserContext).toBeDefined();
    expect(UserContext.Provider).toBeDefined();
    expect(UserContext.Consumer).toBeDefined();
  });

  it("provides undefined by default", () => {
    render(
      <UserContext.Provider value={undefined}>
        <TestConsumer />
      </UserContext.Provider>
    );

    expect(screen.getByTestId("user-value")).toHaveTextContent("no user");
  });

  it("provides user data when set", () => {
    const mockUser = { username: "testuser", isAdmin: false };

    render(
      <UserContext.Provider value={mockUser}>
        <TestConsumer />
      </UserContext.Provider>
    );

    expect(screen.getByTestId("user-value")).toHaveTextContent("testuser");
  });

  it("can provide null to indicate logged out state", () => {
    render(
      <UserContext.Provider value={null}>
        <TestConsumer />
      </UserContext.Provider>
    );

    expect(screen.getByTestId("user-value")).toHaveTextContent("no user");
  });

  it("updates when context value changes", () => {
    const { rerender } = render(
      <UserContext.Provider value={{ username: "user1" }}>
        <TestConsumer />
      </UserContext.Provider>
    );

    expect(screen.getByTestId("user-value")).toHaveTextContent("user1");

    rerender(
      <UserContext.Provider value={{ username: "user2" }}>
        <TestConsumer />
      </UserContext.Provider>
    );

    expect(screen.getByTestId("user-value")).toHaveTextContent("user2");
  });
});
