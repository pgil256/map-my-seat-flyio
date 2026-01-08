describe("config", () => {
  test("exports required configuration values", () => {
    const config = require("./config");

    expect(config.SECRET_KEY).toBeDefined();
    expect(config.PORT).toBeDefined();
    expect(config.BCRYPT_WORK_FACTOR).toBeDefined();
    expect(config.getDatabaseUri).toBeDefined();
    expect(typeof config.getDatabaseUri).toBe("function");
  });

  test("BCRYPT_WORK_FACTOR is 1 in test environment", () => {
    const config = require("./config");
    expect(config.BCRYPT_WORK_FACTOR).toBe(1);
  });

  test("getDatabaseUri returns test database in test environment", () => {
    const config = require("./config");
    const uri = config.getDatabaseUri();
    expect(uri).toContain("test");
  });
});
