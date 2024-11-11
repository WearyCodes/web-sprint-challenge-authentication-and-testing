const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../data/dbConfig");

router.post("/register", async (req, res) => {
  let { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "username and password required",
    });
  }

  try {
    // Check if username exists
    const existing = await db("users").where({ username }).first();
    if (existing) {
      return res.status(400).json({
        message: "username taken",
      });
    }

    // Hash password
    const hash = bcrypt.hashSync(password, 8);

    // Create new user
    const ids = await db("users").insert({
      username,
      password: hash,
    });

    // Fetch the newly created user to return
    const newUser = await db("users").where("id", ids[0]).first();

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({
      message: "Error creating user",
    });
  }
});

router.post("/login", async (req, res) => {
  let { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "username and password required",
    });
  }

  try {
    const user = await db("users").where({ username }).first();

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        message: "invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET || "keep it secret, keep it safe",
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: `welcome, ${user.username}`,
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error logging in",
    });
  }
});

module.exports = router;
