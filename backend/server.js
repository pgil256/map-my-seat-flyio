"use strict";

const app = require("./app");
const { PORT, HOST } = require("./config");

app.listen(PORT, function () {
  console.log(`Started on http://${HOST}:${PORT}`);
});
