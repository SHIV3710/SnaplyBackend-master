const Post = require("../Models/Post");
const User = require("../Models/User");
const cloudinary = require("cloudinary");

exports.createPost = async (req, res) => {
  try {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "posts",
    });
    const newPostData = {
      caption: req.body.caption,
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
      owner: req.user._id,
    };

    const post = await Post.create(newPostData);

    const user = await User.findById(req.user._id);

    user.posts.push(post._id);

    await user.save();

    res.status(201).json({
      success: true,
      message: "Post Created",
      post: newPostData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post Not Found",
      });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized User",
      });
    }

    await cloudinary.v2.uploader.destroy(post.image.public_id);

    await Post.deleteOne(post);

    const user = await User.findById(req.user._id);

    const index = user.posts.indexOf(req.params.id);

    user.posts.splice(index, 1);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Post Deleted Succesfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.likeAndUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post Not Found",
      });
    }

    if (post.likes.includes(req.user._id)) {
      const index = post.likes.indexOf(req.user._id);
      post.likes.splice(index, 1);

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Post Unliked successfully",
        post,
      });
    } else {
      post.likes.push(req.user._id);

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Post Liked",
        post,
      });
    }
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message,
    });
  }
};

exports.postoffollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const posts = await Post.find({
      owner: {
        $in: user.following,
      },
    }).populate("owner likes comments.user");

    res.status(200).json({
      success: true,
      posts: posts.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      message: error.message,
    });
  }
};

exports.updateCaption = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "No post found",
      });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized User",
      });
    }

    post.caption = req.body.caption;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Caption Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "No post found",
      });
    }
    post.comments.push({
      user: req.body.user._id,
      comment: req.body.comment,
    });

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deletecomment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const commentid = req.body;

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Not Found",
      });
    }

    if (post.owner.toString() === req.user._id.toString()) {
      if (req.body.commentid === undefined) {
        return res.status(200).json({
          success: false,
          message: "Comment id is req",
        });
      }

      post.comments.forEach((item, index) => {
        if (item._id.toString() == req.body.commentid.toString()) {
          return post.comments.splice(index, 1);
        }
      });
      await post.save();

      return res.status(200).json({
        success: true,
        message: "Owner deleted the comment",
      });
    } else {
      post.comments.forEach((item, index) => {
        if (item._id.toString() == req.body.commentid.toString()) {
          return post.comments.splice(index, 1);
        }
      });

      await post.save();

      res.status(200).json({
        success: true,
        message: "comment deleted",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getapost = async (req, res) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id).populate("owner likes comments.user");
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post Found",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};
