import { Router } from "express";
import User from "../Models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/auth.js";
import OrganizerApplication from "../Models/OrganizerApplication.js";
const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use." });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    return res.status(201).json({ id: user._id, email: user.email });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    // Sign a JWT with payload { id, role }
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );
    return res.json({ token, role: user.role });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// router.get("/me", requireAuth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId).select("name email role");
//     if (!user) return res.status(404).json({ message: "User not found." });
//     return res.json(user);
//   } catch (err) {
//     console.error("Get Me Error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// });

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("name email role");
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Get Me Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// router.put("/switch-role", requireAuth, async (req, res) => {
//   try {
//     const { role } = req.body;
//     if (!["donor", "organizer"].includes(role)) {
//       return res.status(400).json({ message: "Invalid role." });
//     }

//     // If switching to organizer, ensure they have an approved application
//     if (role === "organizer") {
//       const app = await OrganizerApplication.findOne({
//         user: req.user.userId,
//         status: "approved",
//       });
//       if (!app) {
//         return res
//           .status(403)
//           .json({ message: "Your organizer application is not approved." });
//       }
//     }
//     // Just update the role for other role changes
//     await User.findByIdAndUpdate(req.user.userId, { role });

//     return res.json({ message: "Role updated successfully." });
//   } catch (err) {
//     console.error("Switch Role Error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// });
router.put("/switch-role", requireAuth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["donor", "organizer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    // If switching to organizer, ensure they have an approved application
    if (role === "organizer") {
      const app = await OrganizerApplication.findOne({
        user: req.user.userId,
        status: "approved",
      });
      if (!app) {
        return res
          .status(403)
          .json({ message: "Your organizer application is not approved." });
      }
    }
    await User.findByIdAndUpdate(req.user.userId, { role });
    return res.json({ message: "Role updated successfully." });
  } catch (err) {
    console.error("Switch Role Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

router.put("/update-profile", requireAuth, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    // Build an update object
    const updates = { name: name.trim(), email: email.trim().toLowerCase() };

    // If a new password is provided, hash it
    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long." });
      }
      updates.passwordHash = await bcrypt.hash(password, 12);
    }

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true } // return the updated document
    ).select("name email role");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Return the new user data (excluding passwordHash)
    return res.json(updatedUser);
  } catch (err) {
    console.error("Update Profile Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;
