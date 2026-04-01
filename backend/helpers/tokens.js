const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** Returns signed JWT for the given user. */
function createToken(user) {
  if (process.env.NODE_ENV !== "production") {
    console.assert(user.isAdmin !== undefined,
        "createToken passed user without isAdmin property");
  }

  let payload = {
    username: user.username,
    isAdmin: user.isAdmin || false,
  };

  return jwt.sign(payload, SECRET_KEY, { expiresIn: "7d" });
}

module.exports = { createToken };