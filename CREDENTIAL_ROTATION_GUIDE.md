# 🔐 CREDENTIAL ROTATION GUIDE - STEP BY STEP

**IMPORTANT**: Follow these steps in order to secure your application.

---

## 1️⃣ MONGODB CONNECTION STRING

### Current Exposed Credential:
- Username: `dorakendsan`
- Password: `mux89SfbFc622mLh`
- Cluster: `fundraiser.ctc24be.mongodb.net`

### How to Rotate:

**Option A: Change Password (Recommended)**
1. Go to https://cloud.mongodb.com/
2. Log in to your MongoDB Atlas account
3. Select your project
4. Click "Database Access" in the left sidebar
5. Find user `dorakendsan`
6. Click "Edit" button
7. Click "Edit Password"
8. Click "Autogenerate Secure Password" or enter a strong password
9. Copy the new password
10. Click "Update User"
11. Update your `.env` file with new connection string

**Option B: Create New User (More Secure)**
1. Go to https://cloud.mongodb.com/
2. Click "Database Access"
3. Click "Add New Database User"
4. Choose "Password" authentication
5. Username: `fundraiser_app_prod` (or any name)
6. Click "Autogenerate Secure Password" and copy it
7. Set privileges: "Read and write to any database"
8. Click "Add User"
9. Update your `.env` with new connection string:
   ```
   DATABASE_URL=mongodb+srv://NEW_USERNAME:NEW_PASSWORD@fundraiser.ctc24be.mongodb.net/fundraiser?retryWrites=true&w=majority
   ```
10. Delete the old user `dorakendsan`

---

## 2️⃣ AWS ACCESS KEYS

### Current Exposed Credentials:
- Access Key ID: `AKIA******************` (REDACTED - see your .env file)
- Secret Access Key: `************************************` (REDACTED - see your .env file)

### How to Rotate:

1. Go to https://console.aws.amazon.com/
2. Log in to your AWS account
3. Click your username (top right) → "Security credentials"
4. Scroll to "Access keys" section
5. Click "Create access key"
6. Select "Application running outside AWS"
7. Click "Next" → Add description tag (optional)
8. Click "Create access key"
9. **IMPORTANT**: Copy both Access Key ID and Secret Access Key NOW
10. Update your `.env` file:
   ```
   AWS_ACCESS_KEY_ID=your_new_access_key_id
   AWS_SECRET_ACCESS_KEY=your_new_secret_access_key
   ```
11. Go back to Security credentials
12. Find the OLD access key (starts with AKIA...)
13. Click "Actions" → "Deactivate" (test first)
14. After confirming app works, click "Actions" → "Delete"

**Test Before Deleting Old Key:**
- Try uploading a document in your app
- If it works, delete the old key
- If it fails, check your .env file

---

## 3️⃣ PAYPAL CREDENTIALS

### Current Exposed Credentials:
- Client ID: `AQUZ4SO17eNNGsg3ZBobGIDMwOe5z6XtxHJ990HiJFW4H_DJo6ek9JYpTKO30JA5d23WUM08Izj7kU-z`
- Secret: `EPKuulEdqhNwY-_SEz2NnMAjxlpURnsz0i49TZRH3jpeqgBFc1vZuDpbcsdMVWLfAP687s1_f15NeQQz`

### How to Rotate:

**For Sandbox (Development):**
1. Go to https://developer.paypal.com/
2. Log in to your PayPal Developer account
3. Click "Apps & Credentials" in top menu
4. Make sure "Sandbox" tab is selected
5. Find your app in the list
6. Click on the app name
7. Scroll down to "API Credentials" section
8. Click "Show" next to Secret
9. Copy both Client ID and Secret
10. If you want NEW credentials:
    - Click "Create App" button
    - Enter app name: "Fundraiser App v2"
    - Click "Create App"
    - Copy the new Client ID and Secret
11. Update your `.env`:
    ```
    PAYPAL_CLIENT_ID=your_new_client_id
    PAYPAL_SECRET=your_new_secret
    ```
12. Delete the old app if you created a new one

**For Live (Production):**
1. Same steps as above, but select "Live" tab instead of "Sandbox"
2. **IMPORTANT**: Only use Live credentials in production!

---

## 4️⃣ EMAIL PASSWORD (Gmail App Password)

### Current Exposed Credentials:
- Email: `dorakendsan@gmail.com`
- App Password: `ujmo idbm yvaj svxx`

### How to Rotate:

1. Go to https://myaccount.google.com/apppasswords
2. Log in to your Gmail account
3. You'll see your existing app passwords
4. Find "Mail" or the app password you created
5. Click the trash icon to delete it
6. Click "Create" or "Generate" button
7. Select app: "Mail"
8. Select device: "Other (Custom name)"
9. Enter name: "Fundraiser App Production"
10. Click "Generate"
11. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)
12. Update your `.env`:
    ```
    EMAIL_USER=dorakendsan@gmail.com
    EMAIL_PASS=your_new_16_char_password
    ```

**Alternative: Create New Gmail Account (More Secure)**
1. Create a new Gmail account specifically for your app
2. Enable 2-Step Verification
3. Generate app password for that account
4. Update EMAIL_USER and EMAIL_PASS in .env

---

## 5️⃣ JWT SECRET

### Current Exposed Secret:
- `a1f3d5b79c2e4f6a8b0c9d1e3f5a7b2c4e6d8f0a2b4c6d8e0f1a3b5c7d9e2f4`

### How to Rotate:

**Generate New Strong Secret:**

**Option A: Using Node.js (Recommended)**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option B: Using OpenSSL**
```bash
openssl rand -hex 32
```

**Option C: Using PowerShell (Windows)**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Option D: Online Generator**
Go to: https://www.grc.com/passwords.htm
Copy the "63 random alpha-numeric characters" password

**Update your .env:**
```
JWT_SECRET=your_new_64_character_random_string
```

**⚠️ IMPORTANT**: Changing JWT_SECRET will log out ALL users!
- All existing tokens will become invalid
- Users will need to log in again
- Plan this during low-traffic time

---

## 6️⃣ UPDATE YOUR .ENV FILE

After rotating all credentials, your `.env` should look like this:

```env
# Database Configuration
DATABASE_URL=mongodb+srv://NEW_USERNAME:NEW_PASSWORD@fundraiser.ctc24be.mongodb.net/fundraiser?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_new_64_character_random_string_here
JWT_EXPIRES_IN=7d

# AWS S3 Configuration
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_new_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_new_aws_secret_access_key
AWS_S3_BUCKET_NAME=campaign-imageupload

# PayPal Configuration
PAYPAL_CLIENT_ID=your_new_paypal_client_id
PAYPAL_SECRET=your_new_paypal_secret
PAYPAL_ENVIRONMENT=sandbox

# Frontend URLs
FRONTEND_URL=http://localhost:5173

# Server Configuration
PORT=3001
NODE_ENV=development

# Email Configuration
EMAIL_USER=dorakendsan@gmail.com
EMAIL_PASS=your_new_16_char_app_password
```

---

## 7️⃣ VERIFY EVERYTHING WORKS

After updating all credentials:

### Backend Testing:
```bash
cd Backend
npm start
```

Check for errors in console. Test:
- [ ] Database connection (should see "🗄️ Database connected")
- [ ] Server starts (should see "🚀 Server running on port 3001")

### Test Each Service:
1. **Database**: Try logging in
2. **Email**: Try registering a new account (should receive OTP)
3. **AWS S3**: Try uploading a document in organizer application
4. **PayPal**: Try making a test donation
5. **JWT**: Try logging in and accessing protected routes

---

## 8️⃣ REMOVE .ENV FROM GIT HISTORY (If Committed)

If you ever committed `.env` to git:

```bash
# WARNING: This rewrites git history!
# Backup your repository first!

# Remove .env from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch Backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (if already pushed to remote)
git push origin --force --all
git push origin --force --tags
```

---

## 9️⃣ ADDITIONAL SECURITY MEASURES

### Enable 2FA Everywhere:
- [ ] MongoDB Atlas account
- [ ] AWS account
- [ ] PayPal Developer account
- [ ] Gmail account
- [ ] GitHub account

### Set Up Alerts:
- [ ] MongoDB Atlas: Set up alerts for unusual activity
- [ ] AWS: Enable CloudTrail and set up billing alerts
- [ ] PayPal: Enable transaction notifications

### Regular Rotation Schedule:
- Rotate credentials every 90 days
- Use a password manager to track rotation dates
- Document the process for your team

---

## 🆘 TROUBLESHOOTING

### "Database connection failed"
- Check MongoDB Atlas IP whitelist (allow your IP)
- Verify username and password are correct
- Check connection string format

### "AWS S3 upload failed"
- Verify new access keys are active
- Check S3 bucket permissions
- Verify bucket name is correct

### "PayPal error"
- Make sure you're using Sandbox credentials for development
- Verify Client ID and Secret match
- Check PayPal Developer Dashboard for app status

### "Email not sending"
- Verify Gmail app password is correct (no spaces)
- Check 2-Step Verification is enabled
- Try generating a new app password

### "Invalid token" errors
- This is expected after changing JWT_SECRET
- All users need to log in again
- Clear localStorage in browser

---

## ✅ COMPLETION CHECKLIST

- [ ] MongoDB password changed
- [ ] AWS access keys rotated
- [ ] PayPal credentials rotated (if needed)
- [ ] Gmail app password regenerated
- [ ] JWT secret changed
- [ ] .env file updated with all new credentials
- [ ] Backend tested and working
- [ ] Frontend tested and working
- [ ] All services verified (DB, Email, S3, PayPal)
- [ ] Old credentials deleted/deactivated
- [ ] 2FA enabled on all accounts
- [ ] .env removed from git history (if applicable)

---

## 📞 NEED HELP?

If you encounter issues:
1. Check the error messages in your console
2. Verify each credential individually
3. Test one service at a time
4. Keep old credentials active until new ones work
5. Document any errors you see

---

**Time Estimate**: 30-45 minutes to complete all rotations

**Priority Order**:
1. MongoDB (CRITICAL - affects entire app)
2. JWT Secret (CRITICAL - affects authentication)
3. AWS Keys (HIGH - affects file uploads)
4. Email Password (MEDIUM - affects notifications)
5. PayPal (MEDIUM - affects donations)

Good luck! 🔒
