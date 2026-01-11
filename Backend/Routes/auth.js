// import { Router } from "express";
// import User from "../Models/User.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { requireAuth } from "../middleware/auth.js";
// import OrganizerApplication from "../Models/OrganizerApplication.js";
// import crypto from "crypto";
// import nodemailer from "nodemailer";
// const router = Router();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "All fields are required." });
//     }
//     const existing = await User.findOne({ email });
//     if (existing) {
//       return res.status(409).json({ message: "Email already in use." });
//     }
//     const passwordHash = await bcrypt.hash(password, 12);
//     const user = await User.create({ name, email, passwordHash });
//     return res.status(201).json({ id: user._id, email: user.email });
//   } catch (err) {
//     console.error("Register Error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// });

// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password required." });
//     }
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials." });
//     }
//     const isValid = await bcrypt.compare(password, user.passwordHash);
//     if (!isValid) {
//       return res.status(401).json({ message: "Invalid credentials." });
//     }
//     // Sign a JWT with payload { id, role }
//     const token = jwt.sign(
//       { userId: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "2h",
//       }
//     );
//     return res.json({ token, role: user.role });
//   } catch (err) {
//     console.error("Login Error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// });

// // router.get("/me", requireAuth, async (req, res) => {
// //   try {
// //     const user = await User.findById(req.user.userId).select("name email role");
// //     if (!user) return res.status(404).json({ message: "User not found." });
// //     return res.json(user);
// //   } catch (err) {
// //     console.error("Get Me Error:", err);
// //     return res.status(500).json({ message: "Server error." });
// //   }
// // });

// router.get("/me", requireAuth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId).select("name email role");
//     if (!user) return res.status(404).json({ message: "User not found." });
//     return res.json({
//       userId: user._id.toString(),
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     });
//   } catch (err) {
//     console.error("Get Me Error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// });

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
//     await User.findByIdAndUpdate(req.user.userId, { role });
//     return res.json({ message: "Role updated successfully." });
//   } catch (err) {
//     console.error("Switch Role Error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// });

// router.put("/update-profile", requireAuth, async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Validate inputs
//     if (!name || !email) {
//       return res.status(400).json({ message: "Name and email are required." });
//     }

//     // Build an update object
//     const updates = { name: name.trim(), email: email.trim().toLowerCase() };

//     // If a new password is provided, hash it
//     if (password) {
//       if (password.length < 6) {
//         return res
//           .status(400)
//           .json({ message: "Password must be at least 6 characters long." });
//       }
//       updates.passwordHash = await bcrypt.hash(password, 12);
//     }

//     // Update the user in the database
//     const updatedUser = await User.findByIdAndUpdate(
//       req.user.userId,
//       updates,
//       { new: true } // return the updated document
//     ).select("name email role");

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     // Return the new user data (excluding passwordHash)
//     return res.json(updatedUser);
//   } catch (err) {
//     console.error("Update Profile Error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// });

// router.post("/forgot-password", async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ message: "Email is required." });

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(404).json({ message: "No user with that email." });

//     const token = crypto.randomBytes(32).toString("hex");
//     user.resetToken = token;
//     user.resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
//     await user.save();

//     const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

//     await transporter.sendMail({
//       to: user.email,
//       from: process.env.EMAIL_USER,
//       subject: "Password Reset",
//       html: `<p>You requested a password reset</p>
//              <p>Click <a href="${resetUrl}">here</a> to reset your password</p>`,
//     });

//     return res.json({ message: "Reset link sent to email." });
//   } catch (err) {
//     console.error("Forgot Password Error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// });

// router.post("/reset-password", async (req, res) => {
//   try {
//     const { token, password } = req.body;

//     if (!token || !password) {
//       return res
//         .status(400)
//         .json({ message: "Token and new password required." });
//     }

//     const user = await User.findOne({
//       resetToken: token,
//       resetTokenExpiry: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({ message: "Invalid or expired token." });
//     }

//     if (password.length < 6) {
//       return res
//         .status(400)
//         .json({ message: "Password must be at least 6 characters." });
//     }

//     user.passwordHash = await bcrypt.hash(password, 12);
//     user.resetToken = undefined;
//     user.resetTokenExpiry = undefined;
//     await user.save();

//     return res.json({ message: "Password reset successful." });
//   } catch (err) {
//     console.error("Reset Password Error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// });

// export default router;

// import { Router } from "express";
// import User from "../Models/User.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { requireAuth } from "../middleware/auth.js";
// import OrganizerApplication from "../Models/OrganizerApplication.js";
// import crypto from "crypto";
// import nodemailer from "nodemailer";

// const router = Router();

// // Configure nodemailer transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // --- Register ---
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "All fields are required." });
//     }
//     const existing = await User.findOne({ email });
//     if (existing) {
//       return res.status(409).json({ message: "Email already in use." });
//     }
//     const passwordHash = await bcrypt.hash(password, 12);
//     const user = await User.create({ name, email, passwordHash });
//     return res.status(201).json({ id: user._id, email: user.email });
//   } catch (err) {
//     console.error("Register Error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// });

// // --- Login ---
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password required." });
//     }
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials." });
//     }
//     const isValid = await bcrypt.compare(password, user.passwordHash);
//     if (!isValid) {
//       return res.status(401).json({ message: "Invalid credentials." });
//     }
//     const token = jwt.sign(
//       { userId: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "2h" }
//     );
//     return res.json({ token, role: user.role });
//   } catch (err) {
//     console.error("Login Error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// });

// // --- Get current user ---
// router.get("/me", requireAuth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId).select("name email role");
//     if (!user) return res.status(404).json({ message: "User not found." });
//     return res.json({
//       userId: user._id.toString(),
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     });
//   } catch (err) {
//     console.error("Get Me Error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// });

// // --- Switch role ---
// router.put("/switch-role", requireAuth, async (req, res) => {
//   try {
//     const { role } = req.body;
//     if (!["donor", "organizer"].includes(role)) {
//       return res.status(400).json({ message: "Invalid role." });
//     }
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
//     await User.findByIdAndUpdate(req.user.userId, { role });
//     return res.json({ message: "Role updated successfully." });
//   } catch (err) {
//     console.error("Switch Role Error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// });

// // --- Update profile ---
// router.put("/update-profile", requireAuth, async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email) {
//       return res.status(400).json({ message: "Name and email are required." });
//     }

//     const updates = { name: name.trim(), email: email.trim().toLowerCase() };

//     if (password) {
//       if (password.length < 6) {
//         return res
//           .status(400)
//           .json({ message: "Password must be at least 6 characters long." });
//       }
//       updates.passwordHash = await bcrypt.hash(password, 12);
//     }

//     const updatedUser = await User.findByIdAndUpdate(req.user.userId, updates, {
//       new: true,
//     }).select("name email role");

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     return res.json(updatedUser);
//   } catch (err) {
//     console.error("Update Profile Error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// });

// // --- Forgot password ---
// router.post("/forgot-password", async (req, res) => {
//   try {
//     console.log("Forgot-password request body:", req.body);

//     const { email } = req.body;
//     if (!email) return res.status(400).json({ message: "Email is required." });

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(404).json({ message: "No user with that email." });

//     console.log("Found user:", user.email);

//     const token = crypto.randomBytes(32).toString("hex");
//     user.resetToken = token;
//     user.resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
//     await user.save();

//     console.log("Token saved to user:", token);

//     if (!process.env.FRONTEND_URL) {
//       console.error("FRONTEND_URL not set in environment variables!");
//       return res.status(500).json({ message: "Server configuration error." });
//     }

//     const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

//     console.log("Sending email to:", user.email);
//     console.log("Reset URL:", resetUrl);

//     await transporter.sendMail({
//       to: user.email,
//       from: process.env.EMAIL_USER,
//       subject: "Password Reset",
//       html: `<p>You requested a password reset</p>
//              <p>Click <a href="${resetUrl}">here</a> to reset your password</p>`,
//     });

//     console.log("Email sent");

//     return res.json({ message: "Reset link sent to email." });
//   } catch (err) {
//     console.error("Forgot Password Error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// });

// // --- Reset password ---
// router.post("/reset-password", async (req, res) => {
//   try {
//     const { token, password } = req.body;

//     if (!token || !password) {
//       return res
//         .status(400)
//         .json({ message: "Token and new password required." });
//     }

//     const user = await User.findOne({
//       resetToken: token,
//       resetTokenExpiry: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({ message: "Invalid or expired token." });
//     }

//     if (password.length < 6) {
//       return res
//         .status(400)
//         .json({ message: "Password must be at least 6 characters." });
//     }

//     user.passwordHash = await bcrypt.hash(password, 12);
//     user.resetToken = undefined;
//     user.resetTokenExpiry = undefined;
//     await user.save();

//     return res.json({ message: "Password reset successful." });
//   } catch (err) {
//     console.error("Reset Password Error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// });

// export default router;

// routes/auth.js

import { Router } from "express";
import User from "../Models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/auth.js";
import OrganizerApplication from "../Models/OrganizerApplication.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import Otp from "../Models/Otp.js";

const router = Router();

// Rate limiting map for login attempts
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// ——— Nodemailer transport (uses env-vars) ———
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Rate limiting middleware
const checkRateLimit = (identifier) => {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier) || { count: 0, resetTime: now + LOGIN_TIMEOUT };
  
  if (now > attempts.resetTime) {
    loginAttempts.set(identifier, { count: 1, resetTime: now + LOGIN_TIMEOUT });
    return true;
  }
  
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    return false;
  }
  
  attempts.count++;
  loginAttempts.set(identifier, attempts);
  return true;
};

// ——— 1) REGISTER ———
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    
    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = name.trim();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }
    
    const existing = await User.findOne({ email: sanitizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already in use." });
    }
    
    // Check if email service is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ message: "Email service not configured." });
    }
    
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email: sanitizedEmail, purpose: "register" },
      { email: sanitizedEmail, otpCode, purpose: "register", expiresAt, isUsed: false },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      to: sanitizedEmail,
      from: process.env.EMAIL_USER,
      subject: "OTP code for registration",
      html: `<p>Your OTP code is <strong>${otpCode}</strong></p>
      <p>This code will expire in 3 minutes.</p>
      `,
    });
    return res.status(200).json({ message: "OTP sent to your email. Please verify to complete registration." });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: "All fields are required." });
    }
    
    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = name.trim();

    const otprecord = await Otp.findOne({ email: sanitizedEmail, otpCode: otp, purpose: "register", isUsed: false });
    if (!otprecord) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }
    if (otprecord.expiresAt && otprecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired. Please register again." });
    }

    const existing = await User.findOne({ email: sanitizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already in use." });
    }

    otprecord.isUsed = true;
    await otprecord.save();

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: sanitizedName, email: sanitizedEmail, passwordHash });

    return res.status(201).json({ id: user._id, email: user.email });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// ——— 2) LOGIN ———
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }
    
    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();
    
    // Rate limiting check
    if (!checkRateLimit(sanitizedEmail)) {
      return res.status(429).json({ 
        message: "Too many login attempts. Please try again in 15 minutes." 
      });
    }
    
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    
    // Clear rate limit on successful login
    loginAttempts.delete(sanitizedEmail);
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    return res.json({ token, role: user.role });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// ——— 3) GET CURRENT USER ———
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("name email role isOrganizerApproved");
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isOrganizerApproved: user.isOrganizerApproved,
    });
  } catch (err) {
    console.error("Get Me Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// ——— 4) SWITCH ROLE ———
router.put("/switch-role", requireAuth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["donor", "organizer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
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

// ——— 5) UPDATE PROFILE ———
router.put("/update-profile", requireAuth, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }
    const updates = { name: name.trim(), email: email.trim().toLowerCase() };
    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long." });
      }
      updates.passwordHash = await bcrypt.hash(password, 12);
    }
    const updatedUser = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
    }).select("name email role");
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json(updatedUser);
  } catch (err) {
    console.error("Update Profile Error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// ——— 6) FORGOT PASSWORD ———
router.post("/forgot-password", async (req, res) => {
  try {
    console.log("Forgot-password request body:", req.body);
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    // 6.a) Check env
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Missing EMAIL_USER or EMAIL_PASS in environment!");
      return res
        .status(500)
        .json({ message: "Email server not configured properly." });
    }
    if (!process.env.FRONTEND_URL) {
      console.error("Missing FRONTEND_URL in environment!");
      return res
        .status(500)
        .json({ message: "Frontend URL is not configured." });
    }

    // 6.b) Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No user with that email." });
    }
    console.log("Found user:", user.email);

    // 6.c) Generate token + save it
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 60; // valid for 1 hour
    await user.save();
    console.log("Token saved for user:", token);

    // 6.d) Construct reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    console.log("Reset URL:", resetUrl);

    // 6.e) Send email
    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset",
      html: `
        <p>You requested a password reset for your account.</p>
        <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    });
    console.log("Password reset email sent to:", user.email);

    return res.json({ message: "Reset link sent to email." });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    // Return the full error message in dev mode (optional), otherwise a generic:
    return res.status(500).json({ message: err.message || "Server error." });
  }
});

// ——— 7) RESET PASSWORD ———
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and new password required." });
    }

    // 7.a) Find matching user whose token is still valid
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // 7.b) Validate new password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    // 7.c) Hash and save
    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    console.log("Password reset successful for user:", user.email);
    return res.json({ message: "Password reset successful." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({ message: err.message || "Server error." });
  }
});

export default router;
