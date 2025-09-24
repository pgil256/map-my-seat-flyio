const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Periods = require("./periods.js");
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

const { BadRequestError } = require("your-error-library");
const db = require("your-db-library");
const { createPeriod } = require("your-code");

describe("createPeriod", () => {
  it("creates a new period", async () => {
    const period = await createPeriod({
      username: "testuser",
      schoolYear: "2021-2022",
      title: "Test Period",
      number: 1,
    });

    expect(period).toEqual({
      periodId: expect.any(Number),
      username: "testuser",
      schoolYear: "2021-2022",
      title: "Test Period",
      number: 1,
    });
  });
});

describe("getPeriods", () => {
  beforeEach(async () => {
    // Set up test data
    await db.query(
      "INSERT INTO Periods (period_id, user_username, school_year, title, number) VALUES ($1, $2, $3, $4, $5)",
      [1, "testuser", "2021-2022", "Test Period", 1]
    );
  });

  it("returns an array of periods", async () => {
    const periods = await getPeriods("testuser", 1);
    expect(periods).toEqual([
      {
        periodId: 1,
        username: "testuser",
        schoolYear: "2021-2022",
        title: "Test Period",
        number: 1,
      },
    ]);
  });
});

describe("updatePeriod", function () {
  test("updates period successfully", async function () {
    const data = {
      schoolYear: "2022-2023",
      title: "Fall",
      number: 1,
    };
    const periodId = 1;
    const querySql = `UPDATE periods 
                      SET school_year=$1, title=$2, number=$3 
                      WHERE period_id = $4 
                      RETURNING period_id AS "periodId", 
                                school_year AS "schoolYear", 
                                title, 
                                number`;
    const result = {
      rows: [
        {
          periodId: 1,
          schoolYear: "2022-2023",
          title: "Fall",
          number: 1,
        },
      ],
    };
    db.query.mockReturnValueOnce(result);

describe("deletePeriod", () => {
  it("deletes a period from the database", async () => {
    await deletePeriod(1);

    const result = await db.query("SELECT * FROM Periods");
    expect(result.rows.length).toBe(0);
  });
});
