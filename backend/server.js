const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "arcade_secret";

// Temporary user storage (in-memory)
let users = [];

// Signup
app.post('/api/auth/signup', async (req, res) => {
  const { username, password } = req.body;

  // check if user exists
  const exists = users.find(u => u.username === username);
  if (exists) return res.status(400).json({ error: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed, bio: "" });

  res.json({ message: "Signup success" });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ username: user.username }, SECRET, { expiresIn: "1h" });
  res.json({ token, username: user.username, bio: user.bio });
});

// Update profile
app.post('/api/auth/update', (req, res) => {
  const { username, bio } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: "User not found" });

  user.bio = bio;
  res.json({ message: "Profile updated", bio: user.bio });
});

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));

