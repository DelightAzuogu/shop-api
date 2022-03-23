const express = require("express");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid"); // this is to create a unique id

//Sequelize
const Sequelize = require("sequelize");
const sequelize = require("./util/database");
const Post = require("./models/post");
const User = require("./models/user");

//routes
const feedRoutes = require("./routes/feed");
const AuthRoutes = require("./routes/auth");

const app = express();

//multer option
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

//multer option
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(express.json()); //parsing json body

app.use("/images", express.static(path.join(__dirname, "images"))); //serving images staticly

app.use(
  //multer declaration
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", AuthRoutes);

app.use((err, req, res, next) => {
  // console.log(err);
  const statusCode = err.statusCode || 500;
  const message = err.message;
  res.status(statusCode).json({
    message: message,
  });
});

//defining the foreign keys
Post.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Post);

sequelize
  // .sync({ force: true })
  // .sync({ alter: true })
  .sync()
  .then((result) => {
    const server = app.listen(8080);
    const io = require("./socket").init(server);
    // console.log("hello");
    io.on("connection", (socket) => {
      // this is an event handler that waits and listen for an incoming client socket
      console.log("connected");
    });
  })
  .catch((err) => console.log(err));
