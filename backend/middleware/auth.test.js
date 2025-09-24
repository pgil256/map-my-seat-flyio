const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

const {
authenticateJWT,
isLoggedIn,
adminOnly,
adminOrCorrectUser,
} = require("./auth");

describe("authenticateJWT", function () {
test("works: via header", function () {
const token = jwt.sign({ username: "testuser" }, SECRET_KEY);
const req = { headers: { auth: 
Bearer ${token}
 } };
const res = { locals: {} };
const next = function (err) {
expect(err).toBeFalsy();
};
authenticateJWT(req, res, next);
expect(res.locals).toEqual({
user: {
iat: expect.any(Number),
username: "testuser",
},
});
});

test("works: no header", function () {
const req = {};
const res = { locals: {} };
const next = function (err) {
expect(err).toBeFalsy();
};
authenticateJWT(req, res, next);
expect(res.locals).toEqual({});
});
});

describe("isLoggedIn", function () {
test("works", function () {
const req = {};
const res = { locals: { user: { username: "testuser" } } };
const next = function (err) {
expect(err).toBeFalsy();
};
isLoggedIn(req, res, next);
});

test("unauth if no login", function () {
const req = {};
const res = { locals: {} };
const next = function (err) {
expect(err instanceof UnauthorizedError).toBeTruthy();
};
isLoggedIn(req, res, next);
});
});

describe("adminOnly", function () {
test("works", function () {
const req = {};
const res = { locals: { user: { username: "testuser", isAdmin: true } } };
const next = function (err) {
expect(err).toBeFalsy();
};
adminOnly(req, res, next);
});

test("unauth if not admin", function () {
const req = {};
const res = { locals: { user: { username: "testuser", isAdmin: false } } };
const next = function (err) {
expect(err instanceof UnauthorizedError).toBeTruthy();
};
adminOnly(req, res, next);
});
});

describe("adminOrCorrectUser", function () {
test("works for admin", function () {
const req = { params: { username: "testuser" } };
const res = { locals: { user: { username: "admin", isAdmin: true } } };
const next = function (err) {
expect(err).toBeFalsy();
};
adminOrCorrectUser(req, res, next);
});

test("works for same user", function () {
const req = { params: { username: "testuser" } };
const res = { locals: { user: { username: "testuser", isAdmin: false } } };
const next = function (err) {
expect(err).toBeFalsy();
};
adminOrCorrectUser(req, res, next);
});

test("unauth if not admin or correct user", function () {
const req = { params: { username: "testuser" } };
const res = { locals: { user: { username: "otheruser", isAdmin: false } } };
const next = function (err) {
expect(err instanceof UnauthorizedError).toBeTruthy();
};
adminOrCorrectUser(req, res, next);
});

test("unauth if no login", function () {
const req = { params: { username: "testuser" } };
const res = { locals: {} };
const next = function (err) {
expect(err instanceof UnauthorizedError).toBeTruthy();
};
adminOrCorrectUser(req, res, next);
});
});