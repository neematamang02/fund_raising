import { Router } from "express";
import User from "../Models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/auth.js";
import { strictRateLimiter } from "../middleware/rateLimiter.js";
import OrganizerApplication from "../Models/OrganizerApplication.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import Otp from "../Models/Otp.js";
import { 
  sanitizeString, 
  isValidEmail, 
  isValidAmount 
} from "../utils/validation.js";
import { logError, logSecurityEvent, logInfo } from "../utils/logger.js";

const router = Router();

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * POST /api/auth/register
 * Step 1: Send OTP to email for verification
 */
router.post("/register", strictRateLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeString(email).toLowerCase();
    const sanitizedName = sanitizeString(name);
    
    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long." 
      });
    }
    
    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return res.status(400).json({ 
        message: "Password must contain uppercase, lowercase, and numbers." 
      });
    }
    
    // Check if user already exists
    const existing = await User.findOne({ email: sanitizedEmail });
    if (existing) {
      logSecurityEvent("Registration attempt with existing email", { email: sanitizedEmail });
      return res.status(409).json({ message: "Email already in use." });
    }
    
    // Check if email service is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logError("Email service not configured");
      return res.status(500).json({ message: "Email service not configured." });
    }
    
    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    // Store OTP
    await Otp.findOneAndUpdate(
      { email: sanitizedEmail, purpose: "register" },
      { 
        email: sanitizedEmail, 
        otpCode, 
        purpose: "register", 
        expiresAt, 
        isUsed: false 
      },
      { upsert: true, new: true }
    );

    // Send OTP email
    await transporter.sendMail({
      to: sanitizedEmail,
      from: process.env.EMAIL_USER,
      subject: "OTP code for registration",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Fundraising Platform!</h2>
          <p>Your OTP code is:</p>
          <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px;">${otpCode}</h1>
          <p>This code will expire in 3 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    
    logInfo("OTP sent for registration", { email: sanitizedEmail });
    
    return res.status(200).json({ 
      message: "OTP sent to your email. Please verify to complete registration." 
    });
  } catch (err) {
    logError("Register Error", err);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * POST /api/auth/verify-otp
 * Step 2: Verify OTP and create user account
 */
router.post("/verify-otp", strictRateLimiter, async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    
    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: "All fields are required." });
    }
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeString(email).toLowerCase();
    const sanitizedName = sanitizeString(name);

    // Verify OTP
    const otpRecord = await Otp.findOne({ 
      email: sanitizedEmail, 
      otpCode: otp, 
      purpose: "register", 
      isUsed: false 
    });
    
    if (!otpRecord) {
      logSecurityEvent("Invalid OTP attempt", { email: sanitizedEmail });
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }
    
    if (otpRecord.expiresAt && otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired. Please register again." });
    }

    // Check if user already exists (race condition check)
    const existing = await User.findOne({ email: sanitizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already in use." });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await User.create({ 
      name: sanitizedName, 
      email: sanitizedEmail, 
      passwordHash 
    });

    logInfo("User registered successfully", { userId: user._id, email: sanitizedEmail });

    return res.status(201).json({ 
      id: user._id, 
      email: user.email,
      message: "Registration successful! Please login." 
    });
  } catch (err) {
    logError("Verify OTP Error", err);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post("/login", strictRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }
    
    // Sanitize email
    const sanitizedEmail = sanitizeString(email).toLowerCase();
    
    // Find user
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      logSecurityEvent("Login attempt with non-existent email", { email: sanitizedEmail });
      return res.status(401).json({ message: "Invalid credentials." });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      logSecurityEvent("Failed login attempt", { 
        userId: user._id, 
        email: sanitizedEmail 
      });
      return res.status(401).json({ message: "Invalid credentials." });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    
    logInfo("User logged in", { userId: user._id, email: sanitizedEmail });
    
    return res.json({ token, role: user.role });
  } catch (err) {
    logError("Login Error", err);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("name email role isOrganizerApproved");
      
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    return res.json({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isOrganizerApproved: user.isOrganizerApproved,
    });
  } catch (err) {
    logError("Get Me Error", err);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * PUT /api/auth/switch-role
 * Switch between donor and organizer roles
 */
router.put("/switch-role", requireAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!["donor", "organizer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    
    // If switching to organizer, verify approval
    if (role === "organizer") {
      const app = await OrganizerApplication.findOne({
        user: req.user.userId,
        status: "approved",
      });
      
      if (!app) {
        return res.status(403).json({ 
          message: "Your organizer application is not approved." 
        });
      }
    }
    
    await User.findByIdAndUpdate(req.user.userId, { role });
    
    logInfo("User switched role", { userId: req.user.userId, newRole: role });
    
    return res.json({ message: "Role updated successfully." });
  } catch (err) {
    logError("Switch Role Error", err);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * PUT /api/auth/update-profile
 * Update user profile information
 */
router.put("/update-profile", requireAuth, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    const updates = { 
      name: sanitizeString(name), 
      email: sanitizeString(email).toLowerCase() 
    };

    // Validate email
    if (!isValidEmail(updates.email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: updates.email, 
      _id: { $ne: req.user.userId } 
    });
    
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }

    // Update password if provided
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ 
          message: "Password must be at least 8 characters long." 
        });
      }
      updates.passwordHash = await bcrypt.hash(password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId, 
      updates, 
      { new: true }
    ).select("name email role");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    logInfo("User updated profile", { userId: req.user.userId });

    return res.json(updatedUser);
  } catch (err) {
    logError("Update Profile Error", err);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * POST /api/auth/forgot-password
 * Send password reset link to email
 */
router.post("/forgot-password", strictRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const sanitizedEmail = sanitizeString(email).toLowerCase();

    // Validate environment
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logError("Email service not configured");
      return res.status(500).json({ message: "Email server not configured properly." });
    }
    
    if (!process.env.FRONTEND_URL) {
      logError("Frontend URL not configured");
      return res.status(500).json({ message: "Frontend URL is not configured." });
    }

    // Find user
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      // Don't reveal if email exists (security best practice)
      logInfo("Password reset requested for non-existent email", { 
        requestedEmail: sanitizedEmail 
      });
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Construct reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Send email
    const emailInfo = await transporter.sendMail({
      to: user.email, // IMPORTANT: This is the USER'S email, not EMAIL_USER
      from: process.env.EMAIL_USER,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    // Detailed logging for debugging
    logInfo("Password reset email sent successfully", { 
      userId: user._id,
      userEmail: user.email, // The recipient
      messageId: emailInfo.messageId,
      accepted: emailInfo.accepted, // Array of accepted recipients
      from: process.env.EMAIL_USER, // The sender
    });

    return res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    logError("Forgot Password Error", err, {
      requestedEmail: req.body.email,
    });
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post("/reset-password", strictRateLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password required." });
    }

    // Find user with valid token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      logSecurityEvent("Invalid password reset attempt", { token });
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // Validate new password
    if (password.length < 8) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters." 
      });
    }

    // Hash and save new password
    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    logInfo("Password reset successful", { userId: user._id });

    return res.json({ message: "Password reset successful." });
  } catch (err) {
    logError("Reset Password Error", err);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;
