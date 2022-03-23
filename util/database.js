const Sequelize = require("sequelize");

const sequelize = new Sequelize("rest-api-test", "root", "password", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
