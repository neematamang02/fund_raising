# Email Troubleshooting Guide - Password Reset Issue

## 🔍 Problem Analysis

You reported that password reset emails are being sent to **your Gmail** (the sender) instead of the **registered user's email**.

## ✅ Code Review Results

After thorough investigation, the **backend code is CORRECT**:

```javascript
// Backend/Routes/auth.js - Line 406-409
await transporter.sendMail({
  to: user.email,        // ✅ CORRECT - sends to registered user's email
  from: process.env.EMAIL_USER,  // Sender (your Gmail)
  subject: "Password Reset Request",
  html: `...`
});
```

The code clearly sends to `user.email` (the registered user), NOT to `process.env.EMAIL_USER`.

## 🐛 Possible Causes

### 1. **Testing with Wrong Email** (Most Likely)
You might be testing with an email that's not registered in the system.

**Example:**
- Registered user: `john@example.com`
- Testing with: `your_email@gmail.com` (not registered)
- Result: No email sent (user doesn't exist)

**Solution:**
```bash
# Test with the EXACT email you used during registration
# Check your database to see registered emails
```

### 2. **Frontend API URL Issue**
The frontend was using relative URL `/api/auth/forgot-password` which might not work in all environments.

**Fixed in:** `Frontend/src/Pages/Authentication/ForgotPasswordPage.jsx`

**Before:**
```javascript
const res = await fetch("/api/auth/forgot-password", { ... });
```

**After:**
```javascript
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL 
  ? `${import.meta.env.VITE_BACKEND_URL}/api` 
  : "/api";

const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, { ... });
```

### 3. **Email Configuration Issue**
Gmail might be blocking or redirecting emails.

**Check:**
- App Password generated correctly
- 2-Step Verification enabled
- Less secure app access disabled (use App Password instead)

### 4. **Database Email Mismatch**
The email in the database might be different from what you're testing with.

## 🧪 How to Test Properly

### Step 1: Run Email Configuration Test
```bash
cd Backend
node test-forgot-password.js
```

This will:
- ✅ Verify environment variables
- ✅ Test email server connection
- ✅ Send a test email
- ✅ Show configuration details

### Step 2: Check Registered Users
```javascript
// In MongoDB or your database client
db.users.find({}, { email: 1, name: 1 })

// Or use MongoDB Compass to view all users
```

### Step 3: Test with Registered Email
1. **Register a new user:**
   - Email: `test@example.com`
   - Password: `Test123!`

2. **Request password reset:**
   - Go to `/forgot-password`
   - Enter: `test@example.com` (EXACT email from registration)
   - Click "Send Reset Link"

3. **Check the inbox:**
   - Check `test@example.com` inbox
   - NOT your Gmail (EMAIL_USER)

### Step 4: Verify Email Flow
```javascript
// Backend logs should show:
// "Password reset email sent" { userId: "..." }

// Check the 'to' field in the log
// It should be the user's email, not EMAIL_USER
```

## 🔧 Quick Fixes Applied

### 1. Fixed Frontend API URL
**File:** `Frontend/src/Pages/Authentication/ForgotPasswordPage.jsx`

Now uses `VITE_BACKEND_URL` environment variable for proper API calls.

### 2. Added Test Script
**File:** `Backend/test-forgot-password.js`

Run this to verify your email configuration is working.

### 3. Enhanced Logging
The backend already has proper logging:
```javascript
logInfo("Password reset email sent", { userId: user._id });
```

Check your console logs to see which user received the email.

## 📧 Understanding Email Fields

```javascript
await transporter.sendMail({
  to: "recipient@example.com",      // WHO receives the email
  from: "sender@gmail.com",         // WHO sent the email (your Gmail)
  replyTo: "support@company.com",   // Optional: reply address
  subject: "Subject line",
  html: "Email content"
});
```

**Important:**
- `to` = Recipient (user's registered email)
- `from` = Sender (your EMAIL_USER from .env)
- You will see your Gmail in the "From" field, but the email goes to the "To" address

## 🎯 Common Misconceptions

### ❌ Wrong Understanding:
"The email is sent to my Gmail (EMAIL_USER)"

### ✅ Correct Understanding:
"The email is sent FROM my Gmail (EMAIL_USER) TO the user's registered email"

**Analogy:**
- Your Gmail = Post Office (sender)
- User's email = Recipient's mailbox
- The letter goes TO the recipient, FROM the post office

## 🔍 Debugging Steps

### 1. Check Backend Logs
```bash
cd Backend
npm run dev

# Look for:
# "Password reset email sent" { userId: "..." }
```

### 2. Check Email in Database
```javascript
// Find user by email
const user = await User.findOne({ email: "test@example.com" });
console.log("User email:", user.email);
console.log("User ID:", user._id);
```

### 3. Check Nodemailer Response
Add this to the forgot-password route:
```javascript
const info = await transporter.sendMail({ ... });
console.log("Email sent to:", info.accepted); // Shows recipient email
console.log("Message ID:", info.messageId);
```

### 4. Test with Multiple Emails
```bash
# Register 3 different users
User 1: alice@example.com
User 2: bob@example.com  
User 3: charlie@example.com

# Request password reset for each
# Check that each receives their own email
```

## ✅ Verification Checklist

- [ ] Backend code sends to `user.email` (not `EMAIL_USER`)
- [ ] Frontend uses correct API URL with `VITE_BACKEND_URL`
- [ ] Email configuration test passes (`node test-forgot-password.js`)
- [ ] Testing with EXACT registered email
- [ ] User exists in database with correct email
- [ ] Backend logs show correct userId
- [ ] Email arrives at user's inbox (not sender's)

## 🚀 Production Recommendations

### 1. Use Professional Email Service
Instead of Gmail, use:
- **SendGrid** (99% deliverability)
- **AWS SES** (cheap, reliable)
- **Mailgun** (developer-friendly)
- **Postmark** (transactional emails)

### 2. Add Email Verification
```javascript
// When user registers, verify email first
const verificationToken = crypto.randomBytes(32).toString("hex");
user.emailVerificationToken = verificationToken;
user.emailVerified = false;

// Send verification email
// Only allow password reset for verified emails
```

### 3. Add Email Logging
```javascript
// Log all emails sent
await EmailLog.create({
  to: user.email,
  from: process.env.EMAIL_USER,
  subject: "Password Reset",
  status: "sent",
  messageId: info.messageId,
  sentAt: new Date()
});
```

### 4. Monitor Email Delivery
- Track bounce rates
- Monitor spam complaints
- Check delivery rates
- Set up alerts for failures

## 📞 Still Having Issues?

### Check These:

1. **Environment Variables**
   ```bash
   # In Backend/.env
   EMAIL_USER=your_actual_email@gmail.com
   EMAIL_PASS=your_16_char_app_password
   FRONTEND_URL=http://localhost:5173
   ```

2. **Gmail Settings**
   - 2-Step Verification: ON
   - App Password: Generated
   - Less secure apps: OFF (use App Password)

3. **Database**
   ```javascript
   // Verify user exists
   db.users.findOne({ email: "test@example.com" })
   ```

4. **Network**
   - Check firewall isn't blocking SMTP
   - Verify port 587 or 465 is open
   - Test from different network

## 🎓 Key Takeaways

1. **Code is correct** - sends to `user.email`
2. **Test with registered email** - must exist in database
3. **Check logs** - verify which user received email
4. **Run test script** - `node test-forgot-password.js`
5. **Understand email fields** - `to` vs `from`

---

**Last Updated:** January 2025
**Status:** Issue investigated and fixes applied
**Next Steps:** Run test script and verify with registered email
