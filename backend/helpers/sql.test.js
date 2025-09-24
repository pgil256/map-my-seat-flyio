const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", () => {
  const dataToUpdate = { firstName: "Joe", age: 10 };
  const jsToSql = { firstName: "first_name" };

  test("Converts input to SQL-friendly format", () => {
    expect(sqlForPartialUpdate(dataToUpdate, jsToSql)).toEqual({
      setCols: `"first_name"=$1, "age"=$2`,
      values: ["Joe", 10],
    });
  });

  test("Throws BadRequestError if input is empty object", () => {
    expect(() => {
      sqlForPartialUpdate({}, jsToSql);
    }).toThrow(BadRequestError);
  });
});
