const express = require("express");
const { body } = require("express-validator");

//controllers
const authController = require("../controller/auth");

//for authentication
const isAuth = require("../middleware/is-auth");

//sequelize
const Sequelize = require("sequelize");
const sequelize = require("../util/database");

//models
const User = require("../models/user");

const router = express.Router();

router.put(
  "/signup",
  [
    body("email", "use a valid email")
      .isEmail()
      .trim()
      .normalizeEmail()
      .custom((email, { req }) => {
        return User.findOne({ where: { email: email } }).then((user) => {
          if (user) {
            return Promise.reject("email is linked to an account");
          }
        });
      }),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

router.post("/login", authController.login);

router.get("/status", isAuth, authController.getUserStatus);

router.patch(
  "/status",
  isAuth,
  [body("status").trim().not().isEmpty()],
  authController.updateUserStatus
);

module.exports = router;
