const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({
      message: "token required",
    });
    return;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    next();
  } catch (err) {
    res.status(401).json({
      message: "token invalid",
    });
  }
};
