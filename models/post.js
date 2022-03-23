const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Post = sequelize.define("post", {
  _id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allownull: false,
    autoIncrement: true,
  },
  title: {
    type: Sequelize.STRING(20),
    allownull: false,
  },
  content: {
    type: Sequelize.STRING(100),
    allownull: false,
  },
  imageUrl: {
    type: Sequelize.STRING,
    allownull: false,
  },
});

module.exports = Post;
