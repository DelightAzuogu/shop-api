const { validationResult } = require("express-validator"); //for the valildation
const bcrypt = require("bcrypt"); //for password encryption
const jwt = require("jsonwebtoken");

//models
const User = require("../models/user");

//error
const errorFunction = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

//for the signup
exports.signup = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    console.log(error.array());
    throw errorFunction("validation error", 422);
  }

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  bcrypt
    .hash(password, 12)
    .then((hashPass) => {
      const createUser = {
        name: name,
        email: email,
        password: hashPass,
      };

      return User.create(createUser);
    })
    .then((user) => {
      res.status(201).json({
        message: "user created",
        userId: user._id,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//LOGIN
exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  let loadedUser;
  try {
    loadedUser = await User.findOne({ where: { email: email } });
    if (!loadedUser) {
      throw errorFunction("user not found", 401);
    }
    const isEqula = bcrypt.compareSync(password, user.password);

    if (!isEqual) throw errorFunction("invalid password", 401);

    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser.dataValues.id,
      },
      "secret",
      { expiresIn: "1h" }
    );
    res.status(200).json({
      token: token,
      userId: loadedUser.dataValues.id,
    });
    return;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
    return err;
  }
};

// GETTING USER STATUS
exports.getUserStatus = (req, res, next) => {
  User.findByPk(req.userId)
    .then((user) => {
      if (!user) {
        throw errorFunction("user not found", 404);
      }
      res.status(200).json({ status: user.status });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//UPDATING USER STATUS
exports.updateUserStatus = (req, res, nect) => {
  const status = req.body.status;

  User.findByPk(req.userId)
    .then((user) => {
      user.status = status;
      return user.save();
    })
    .then((savedUser) => {
      res.status(201).json({ message: "status updated" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
