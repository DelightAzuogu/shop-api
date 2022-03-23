const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let token = req.get("Authorization");
  if (!token) {
    // console.log(token);
    const error = new Error("not authorized");
    error.statusCode = 401;
    throw error;
  }
  token = token.split(" ")[1];

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, "secret");
  } catch (err) {
    err.statusCode = 401;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("verification failed");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};
