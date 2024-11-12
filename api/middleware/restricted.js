const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({
      message: "Token required",
    });
    return;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || "keep it secret, keep it safe");

    next();
  } catch (err) {
    console.log("error in restricted middleware", err);
    res.status(401).json({
      message: "Invalid token",
    });
  }
};
