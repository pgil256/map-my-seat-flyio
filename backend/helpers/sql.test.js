const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", () => {
  test("Converts JS keys to DB column names", () => {
    const dataToUpdate = { firstName: "Joe", age: 10 };
    const jsToSql = { firstName: "first_name" };

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    // Function maps JS keys to DB column names based on jsToSql mapping
    // Keys not in jsToSql are not included in output
    expect(result).toEqual({
      first_name: "Joe",
    });
  });

  test("Returns empty object for empty input", () => {
    const result = sqlForPartialUpdate({}, { firstName: "first_name" });
    expect(result).toEqual({});
  });

  test("Only maps keys that exist in jsToSql", () => {
    const dataToUpdate = { firstName: "Joe", lastName: "Smith", age: 25 };
    const jsToSql = { firstName: "first_name", lastName: "last_name" };

    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      first_name: "Joe",
      last_name: "Smith",
    });
    // age is not in jsToSql, so it's not included
    expect(result.age).toBeUndefined();
  });
});
