// const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

//Changes input to SQL-friendly format.
function sqlForPartialUpdate(data, dataToDbColumnMap) {
  let dbUpdateObject = {};

  for (let key in data) {
    if (dataToDbColumnMap[key]) {
      dbUpdateObject[dataToDbColumnMap[key]] = data[key];
    }
  }

  return dbUpdateObject;
}

module.exports = { sqlForPartialUpdate };
