const User = require("../Models/User");
const Post = require("../Models/Post");
const { sendEmail } = require("../middleware/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

exports.register = async (req, res) => {
  try {
    const { name, email, password, image } = req.body;
    let user = await User.findOne({ name, email });

    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const myCloud = await cloudinary.v2.uploader.upload(image || "", {
      folder: "Users",
    });

    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });
    console.log(user);
    const token = await user.generateToken();

    return res.status(200).json({
      success: true,
      message: "User Registered Successfully",
      user,
      token,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = await user.generateToken();

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.followUser = async (req, res) => {
  try {
    const usertoFollow = await User.findById(req.params.id);
    const loggedUser = await User.findById(req.user._id);
    console.log(loggedUser, loggedUser);

    if (!usertoFollow) {
      return res.status(404).json({
        sucess: false,
        message: "UsertoFollow not found",
      });
    }

    if (loggedUser.following.includes(usertoFollow._id)) {
      const indexfollowing = loggedUser.following.indexOf(usertoFollow._id);
      const indexfollowers = usertoFollow.followers.indexOf(loggedUser._id);

      loggedUser.following.splice(indexfollowing, 1);
      usertoFollow.followers.splice(indexfollowers, 1);

      await loggedUser.save();
      await usertoFollow.save();

      res.status(200).json({
        success: true,
        message: "User unFollowed successfully",
      });
    } else {
      loggedUser.following.push(usertoFollow._id);
      usertoFollow.followers.push(loggedUser._id);

      await loggedUser.save();
      await usertoFollow.save();

      res.status(200).json({
        success: true,
        message: "User Followed successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
      .json({
        success: true,
        message: "User Logged out successfully",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(404).json({
        success: false,
        message: "Please give old and new password",
      });
    }

    const isMatch = await user.matchPassword(oldPassword);

    if (!isMatch) {
      return res.status(404).json({
        success: false,
        message: "Incorrect Old Password",
      });
    }
    console.log(oldPassword, newPassword);

    user.password = newPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { name, email, avatar } = req.body;

    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }
    if (avatar) {
      const myCloud = await cloudinary.v2.uploader.upload(avatar, {
        folder: "Users",
      });
      user.avatar.id = myCloud.public_id;
      user.avatar.url = myCloud.secure_url;
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = user.posts;
    const followings = user.following;
    const id = user._id;

    await User.deleteOne(user);

    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    for (let i = 0; i < posts.length; i++) {
      const post = await Post.findById(posts[i]);
      await cloudinary.v2.uploader.destroy(post.image.public_id);
      await Post.deleteOne(post);
    }

    for (let i = 0; i < followings.length; i++) {
      const following = await User.findById(followings[i]);
      const index = following.followers.indexOf(id);

      following.followers.splice(index, 1);
      await following.save();
    }

    res.status(200).json({
      success: true,
      message: "User removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.MyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("posts");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Please Login",
      });
    }
    res.status(200).json({
      success: true,
      message: "Your Profile",
      user,
    });
  } catch (error) {
    console.log("error");
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.MyPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const posts = [];
    for (let i = 0; i < user.posts.length; i++) {
      const post = await Post.findById(user.posts[i]).populate(
        "likes comments comments.user"
      );
      if (post) posts.push(post);
    }

    res.status(200).json({
      success: true,
      message: "Your Profile",
      posts: posts.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.UserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("posts");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User Profile",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.ALLUser = async (req, res) => {
  try {
    const Users = await User.find({});
    res.status(200).json({
      success: true,
      Users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Register First",
      });
    }

    const resetpasswordtoken = user.getpasswordtoken();

    await user.save();

    const reseturl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${resetpasswordtoken}`;

    const message = `Reset Your Password by clicking on the link below: \n\n ${reseturl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Reset Password",
        message,
      });

      res.status(200).json({
        success: true,
        message: `Email send to ${user.email}`,
      });
    } catch (error) {
      user.resetPasswordExpire = undefined;
      user.resetPasswordToken = undefined;
      await user.save();

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: "false",
      message: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or has expired",
      });
    }

    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();

    return res.status(200).json({
      success: false,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
