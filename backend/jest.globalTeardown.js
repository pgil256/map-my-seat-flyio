const db = require("./db");

module.exports = async () => {
  // Ensure all connections are properly closed
  await db.destroy();
};
