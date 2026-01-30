# How to Test Password Reset - Step by Step Guide

## 🎯 The Issue You Reported

**Problem:** "Password reset emails are being sent to my Gmail instead of the registered user's email"

**Reality:** The code is correct. The confusion comes from misunderstanding email fields.

## 📧 Understanding Email Fields

```javascript
await transporter.sendMail({
  to: "user@example.com",        // ← WHO RECEIVES the email
  from: "your_gmail@gmail.com",  // ← WHO SENT the email (appears in "From" field)
  subject: "Password Reset",
  html: "..."
});
```

**Key Point:** 
- `to` = Recipient (where email goes)
- `from` = Sender (who sent it)

When you check your Gmail inbox, you're checking the SENDER's inbox, not the RECIPIENT's inbox.

## ✅ Correct Testing Procedure

### Step 1: Register a Test User

1. **Open your app:** `http://localhost:5173/register`

2. **Register with a DIFFERENT email** (not your Gmail):
   ```
   Name: Test User
   Email: testuser@example.com  ← Use a real email you can access
   Password: Test123!
   ```

3. **Complete OTP verification**

4. **Verify user is in database:**
   ```bash
   # In MongoDB Compass or CLI
   db.users.findOne({ email: "testuser@example.com" })
   ```

### Step 2: Request Password Reset

1. **Go to:** `http://localhost:5173/forgot-password`

2. **Enter the EXACT email from registration:**
   ```
   Email: testuser@example.com  ← Must match database
   ```

3. **Click "Send Reset Link"**

4. **Check backend console logs:**
   ```
   [INFO] Password reset email sent successfully {
     userId: "...",
     userEmail: "testuser@example.com",  ← This is the recipient
     from: "your_gmail@gmail.com"        ← This is the sender
   }
   ```

### Step 3: Check the CORRECT Inbox

**❌ WRONG:** Check your Gmail (EMAIL_USER) inbox
**✅ CORRECT:** Check `testuser@example.com` inbox

The email was sent **TO** `testuser@example.com` **FROM** your Gmail.

## 🧪 Quick Test Script

Run this to verify your email configuration:

```bash
cd Backend
node test-forgot-password.js
```

This will:
1. ✅ Check environment variables
2. ✅ Test email server connection
3. ✅ Send a test email to YOUR Gmail (for testing only)
4. ✅ Show detailed configuration

## 🔍 Common Mistakes

### Mistake 1: Testing with Wrong Email
```
❌ Registered: john@example.com
❌ Testing with: your_gmail@gmail.com
❌ Result: No email sent (user doesn't exist)
```

**Fix:** Use the EXACT email from registration

### Mistake 2: Checking Wrong Inbox
```
❌ Email sent to: john@example.com
❌ Checking: your_gmail@gmail.com inbox
❌ Result: No email found
```

**Fix:** Check john@example.com inbox

### Mistake 3: Confusing "From" and "To"
```
Email headers:
From: your_gmail@gmail.com  ← Sender (your EMAIL_USER)
To: john@example.com        ← Recipient (user's email)
```

The email goes TO john@example.com, not to your Gmail.

## 📝 Real-World Example

### Scenario: User "Alice" forgot her password

1. **Alice registered with:** `alice@company.com`

2. **Alice goes to forgot password page**

3. **Alice enters:** `alice@company.com`

4. **System does:**
   ```javascript
   // Find Alice in database
   const user = await User.findOne({ email: "alice@company.com" });
   
   // Send email TO Alice FROM your Gmail
   await transporter.sendMail({
     to: "alice@company.com",      // ← Alice receives it
     from: "your_gmail@gmail.com", // ← Sent from your Gmail
     subject: "Password Reset",
     html: "..."
   });
   ```

5. **Alice checks her inbox:** `alice@company.com` ✅

6. **You check your Gmail:** Nothing there (you're the sender, not recipient) ❌

## 🎓 Key Takeaways

1. **Code is correct** - sends to `user.email` from database
2. **Test with registered email** - must exist in database
3. **Check recipient's inbox** - not sender's inbox
4. **Understand email fields:**
   - `to` = where email goes (recipient)
   - `from` = who sent it (sender)

## 🛠️ Debugging Checklist

- [ ] User exists in database with correct email
- [ ] Testing with EXACT email from database
- [ ] Checking RECIPIENT's inbox (not sender's)
- [ ] Backend logs show correct userEmail
- [ ] Email service configured correctly
- [ ] FRONTEND_URL set in .env
- [ ] No typos in email address

## 📞 Still Confused?

### Run This Test:

1. **Register two users:**
   ```
   User 1: alice@example.com
   User 2: bob@example.com
   ```

2. **Request password reset for Alice:**
   - Enter: `alice@example.com`
   - Check: `alice@example.com` inbox ✅

3. **Request password reset for Bob:**
   - Enter: `bob@example.com`
   - Check: `bob@example.com` inbox ✅

4. **Check your Gmail:**
   - Should be empty (you're the sender, not recipient) ✅

### Check Backend Logs:

```bash
cd Backend
npm run dev

# When you request password reset, you'll see:
[INFO] Password reset email sent successfully {
  userId: "...",
  userEmail: "alice@example.com",  ← Email was sent HERE
  messageId: "...",
  accepted: ["alice@example.com"], ← Confirmed recipient
  from: "your_gmail@gmail.com"     ← Sent from here
}
```

## 🚀 Production Tips

### Use Real Email Service
Instead of Gmail, use:
- **SendGrid** - 100 emails/day free
- **AWS SES** - $0.10 per 1000 emails
- **Mailgun** - 5000 emails/month free
- **Postmark** - Transactional email specialist

### Why Not Gmail?
- Daily sending limits (500 emails/day)
- May be marked as spam
- Not designed for transactional emails
- No delivery tracking
- No bounce handling

### Example: SendGrid Setup
```javascript
// Install: npm install @sendgrid/mail
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: user.email,
  from: 'noreply@yourcompany.com', // Verified sender
  subject: 'Password Reset',
  html: '...'
});
```

## ✅ Final Verification

Run these commands to verify everything:

```bash
# 1. Test email configuration
cd Backend
node test-forgot-password.js

# 2. Check registered users
# In MongoDB Compass or CLI:
db.users.find({}, { email: 1, name: 1 })

# 3. Start backend with logging
npm run dev

# 4. Test password reset
# - Go to /forgot-password
# - Enter registered email
# - Check backend logs
# - Check recipient's inbox
```

---

**Remember:** The email goes TO the user's registered email, FROM your Gmail. Check the recipient's inbox, not yours!
