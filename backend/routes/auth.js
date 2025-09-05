const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = "arcade_secret";

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed });
    await user.save();
    res.json({ message: "Signup success" });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1h" });
  res.json({ token, username: user.username, bio: user.bio });
});

// Update profile
router.post('/update', async (req, res) => {
  const { username, bio } = req.body;
  const user = await User.findOneAndUpdate({ username }, { bio }, { new: true });
  res.json({ message: "Profile updated", bio: user.bio });
});

module.exports = router;
