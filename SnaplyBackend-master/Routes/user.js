const express = require("express");

const {
  register,
  login,
  followUser,
  logout,
  updatePassword,
  updateProfile,
  deleteProfile,
  MyProfile,
  UserProfile,
  ALLUser,
  forgotPassword,
  resetPassword,
  MyPosts,
} = require("../Controllers/user");

const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/logout").get(logout);

router.route("/update/password").put(isAuthenticated, updatePassword);

router.route("/update/profile").put(isAuthenticated, updateProfile);

router.route("/follow/:id").get(isAuthenticated, followUser);

router.route("/profile").get(isAuthenticated, MyProfile);

router.route("/profile/post").get(isAuthenticated, MyPosts);

router.route("/allusers").get(ALLUser);

router.route("/delete/me").delete(isAuthenticated, deleteProfile);

router.route("/profile/:id").get(isAuthenticated, UserProfile);

router.route("/forgot/password").post(forgotPassword);

router.route("/password/reset/:token").post(resetPassword);

module.exports = router;
