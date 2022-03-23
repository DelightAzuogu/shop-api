const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: Sequelize.STRING,
    allownull: false,
  },
  name: {
    type: Sequelize.STRING,
    allownull: false,
  },
  password: {
    type: Sequelize.STRING,
    allownull: false,
  },
  status: {
    type: Sequelize.STRING,
    allownull: true,
  },
});

module.exports = User;
