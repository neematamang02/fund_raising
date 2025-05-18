import { Router } from "express";
import User from "../Models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const router = Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hash });
  res.status(201).json({ id: user._id, email: user.email });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
});

export default router;
