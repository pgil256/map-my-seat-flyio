import { describe, expect, it } from "vitest";
import { letterSpacings } from "./typography";

describe("theme typography", () => {
  it("does not use negative letter spacing", () => {
    for (const value of Object.values(letterSpacings)) {
      expect(value.startsWith("-")).toBe(false);
    }
  });
});
