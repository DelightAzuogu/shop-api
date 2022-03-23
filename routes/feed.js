const express = require("express");
const { body } = require("express-validator");

//controller
const feedController = require("../controller/feed");

//middleware
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/posts", isAuth, feedController.getPosts);

router.post(
  "/post",
  isAuth,
  [
    body("title").isLength({ min: 5 }).trim(),
    body("content").isLength({ min: 5 }).trim(),
  ],
  feedController.createPost
);

router.get("/post/:postId", isAuth, feedController.getPost);

router.put(
  "/post/:postId",
  isAuth,
  [
    body("title").isLength({ min: 5 }).trim(),
    body("content").isLength({ min: 5 }).trim(),
  ],
  feedController.updatePost
);

router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
