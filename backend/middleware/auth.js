const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

// Validate token and store in res.locals
function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
  } catch (err) {
    console.error("Error in JWT authentication:", err);
  }
  return next();
}

function isLoggedIn(req, res, next) {
  if (!res.locals.user) {
    console.log("User is not logged in");
  }
  return next();
}

function adminOnly(req, res, next) {
  if (!res.locals.user || !res.locals.user.isAdmin) {
    console.log("Access restricted to admins only");
  }
  return next();
}

function adminOrCorrectUser(req, res, next) {
  const user = res.locals.user;
  if (!user) {
    console.log("No authenticated user");
  } else if (!(user.isAdmin || user.username === req.params.username)) {
    console.log("User not authorized");
  }
  return next();
}

module.exports = {
  authenticateJWT,
  isLoggedIn,
  adminOnly,
  adminOrCorrectUser,
};
