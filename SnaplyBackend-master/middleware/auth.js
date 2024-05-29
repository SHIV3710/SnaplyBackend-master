const jwt = require("jsonwebtoken");
const User = require("../Models/User");
exports.isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You are not logged in",
      });
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded._id);
    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
