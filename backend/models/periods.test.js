const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Period = require("./period.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Period", () => {
  describe("createPeriod", () => {
    it("creates a new period", async () => {
      const period = await Period.createPeriod({
        username: "u1",
        schoolYear: "2023-2024",
        title: "Test Period",
        number: 5,
      });

      expect(period).toEqual({
        periodId: expect.any(Number),
        username: "u1",
        schoolYear: "2023-2024",
        title: "Test Period",
        number: 5,
      });
    });

    it("throws BadRequestError for duplicate period number", async () => {
      await Period.createPeriod({
        username: "u1",
        schoolYear: "2023-2024",
        title: "Period A",
        number: 6,
      });

      await expect(
        Period.createPeriod({
          username: "u1",
          schoolYear: "2023-2024",
          title: "Period B",
          number: 6,
        })
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("getPeriods", () => {
    it("returns all periods for a user", async () => {
      const periods = await Period.getPeriods("u1");
      expect(Array.isArray(periods)).toBe(true);
    });
  });
});
