const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

// Validate token and store in res.locals
function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
  } catch (err) {
    // Invalid token - don't set user, will be handled by auth middleware
  }
  return next();
}

function isLoggedIn(req, res, next) {
  if (!res.locals.user) {
    return next(new UnauthorizedError("Must be logged in"));
  }
  return next();
}

function adminOnly(req, res, next) {
  if (!res.locals.user || !res.locals.user.isAdmin) {
    return next(new UnauthorizedError("Admin access required"));
  }
  return next();
}

function adminOrCorrectUser(req, res, next) {
  const user = res.locals.user;
  if (!user) {
    return next(new UnauthorizedError("Must be logged in"));
  }
  if (!(user.isAdmin || user.username === req.params.username)) {
    return next(new UnauthorizedError("Not authorized"));
  }
  return next();
}

module.exports = {
  authenticateJWT,
  isLoggedIn,
  adminOnly,
  adminOrCorrectUser,
};
