const res = require("express/lib/response");
const { validationResult } = require("express-validator"); //for the valildation
const deleteFile = require("../deleteImage");

//database models
const Post = require("../models/post");
const User = require("../models/user");

// this is the socket
const io = require("../socket");

//err function
const errorFunction = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

//GET ALL POSTS CONTROLLER
exports.getPosts = async (req, res, next) => {
  const currentpage = req.query.page;
  const perPage = 2; //this is the number of posts per page

  try {
    let totalItems = await Post.count();

    const posts = await Post.findAll({
      offset: (currentpage - 1) * perPage,
      limit: perPage,
      include: User,
      order: [["createdAt"]],
    });

    const allPosts = posts.map((post) => {
      return {
        ...post.dataValues,
        creator: post.dataValues.user.dataValues,
      };
    });

    res.status(200).json({
      message: "post fetched successful",
      posts: allPosts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//CREATING A NEW POST
exports.createPost = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = new Error("validation error");
    err.statusCode = 422;
    throw err;
  }

  if (!req.file) {
    const err = new Error("not image provided");
    err.statusCode = 422;
    throw err;
  }

  let imageUrl = req.file.path;
  imageUrl = imageUrl.replace(/\\/g, "/");

  const title = req.body.title;
  const content = req.body.content;
  try {
    const loggedUser = await User.findByPk(req.userId);
    let createdPost = await loggedUser.createPost({
      title: title,
      content: content,
      imageUrl: imageUrl,
    });

    createdPost = createdPost.dataValues;
    createdPost.creator = loggedUser; // this is because the frontend looks for creator.name

    io.getIO().emit("posts", {
      action: "create",
      post: createdPost,
    });

    res.status(201).json({
      message: "post created successfully",
      post: createdPost,
      creator: { _id: loggedUser.id, name: loggedUser.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//GETTING A POST DETAIL
exports.getPost = (req, res, next) => {
  console.log("inside here");
  const postId = req.params.postId;
  console.log(postId);
  Post.findByPk(postId)
    .then((post) => {
      if (!post) {
        const err = new Error("resource not found");
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({
        message: "post found",
        post: post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//UPDATING A POST
exports.updatePost = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = new Error("validation error");
    err.statusCode = 422;
    throw err;
  }

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
    imageUrl = imageUrl.replace(/\\/g, "/");
  }

  if (!imageUrl) {
    const err = new Error("No image picked");
    err.statusCode = 422;
    throw err;
  }

  Post.findByPk(postId, { include: User })
    .then((post) => {
      if (!post) {
        const err = new Error("resource not found");
        err.statusCode = 404;
        throw err;
      }
      if (post.userId !== req.userId) {
        throw errorFunction("invalid user", 403);
      }

      if (post.imageUrl !== imageUrl) {
        deleteFile.deleteFile(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((savedPost) => {
      savedPost.dataValues.creator = savedPost.dataValues.user.dataValues;
      // console.log(savedPost);

      io.getIO().emit("posts", {
        action: "update",
        post: savedPost,
      });
      res.status(200).json({
        message: "post updated",
        post: savedPost,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//DELETING A POST
exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findByPk(postId)
    .then((post) => {
      if (!post) {
        throw errorFunction("resource not found!", 404);
      }
      if (post.userId !== req.userId) {
        throw errorFunction("invalid user", 403);
      }

      deleteFile.deleteFile(post.imageUrl);
      return post.destroy();
    })
    .then((result) => {
      io.getIO().emit("posts", {
        action: "delete",
        post: postId,
      });
      res.status(200).json({ message: "post deleted" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
