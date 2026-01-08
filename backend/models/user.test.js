const db = require("../db.js");
const { BadRequestError, NotFoundError, UnauthorizedError } = require("../expressError");
const User = require("./user.js");
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

describe("User", () => {
  describe("authenticate", () => {
    it("should return a user object for valid credentials", async () => {
      const user = await User.authenticate("u1", "password1");
      expect(user).toEqual({
        username: "u1",
        email: "u1@email.com",
        title: "Mr.",
        firstName: "U1F",
        lastName: "U1L",
        isAdmin: false,
      });
    });

    it("should throw UnauthorizedError for invalid password", async () => {
      await expect(User.authenticate("u1", "wrongpassword")).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("should throw UnauthorizedError for invalid username", async () => {
      await expect(
        User.authenticate("nonexistent", "password")
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("register", () => {
    it("should create a new user", async () => {
      const newUser = await User.register({
        username: "newuser",
        password: "password123",
        email: "new@test.com",
        title: "Ms.",
        firstName: "New",
        lastName: "User",
        isAdmin: false,
      });

      expect(newUser).toEqual({
        username: "newuser",
        email: "new@test.com",
        title: "Ms.",
        firstName: "New",
        lastName: "User",
        isAdmin: false,
      });
    });

    it("should throw BadRequestError for duplicate username", async () => {
      await expect(
        User.register({
          username: "u1",
          password: "password123",
          email: "different@test.com",
          title: "Dr.",
          firstName: "Dupe",
          lastName: "User",
          isAdmin: false,
        })
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("get", () => {
    it("should return user data", async () => {
      const user = await User.get("u1");
      expect(user).toEqual({
        username: "u1",
        email: "u1@email.com",
        title: "Mr.",
        firstName: "U1F",
        lastName: "U1L",
        isAdmin: false,
      });
    });

    it("should throw NotFoundError for nonexistent user", async () => {
      await expect(User.get("nonexistent")).rejects.toThrow(NotFoundError);
    });
  });

  describe("remove", () => {
    it("removes a user from the database", async () => {
      await User.remove("u2");
      await expect(User.get("u2")).rejects.toThrow(NotFoundError);
    });
  });
});
