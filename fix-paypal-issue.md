# 🚀 Quick Fix for PayPal Payment Error

## The Issue

You're seeing: **"We aren't able to process your payment using your PayPal account at this time."**

## Root Cause

The frontend might be using a **cached old PayPal Client ID** that doesn't match your backend credentials.

## ⚡ Quick Fix (5 Minutes)

### Step 1: Clear Browser Cache

**Option A - Hard Refresh:**
```
Windows/Linux: Ctrl + Shift + Delete
Mac: Cmd + Shift + Delete
```
Then select "Cached images and files" and clear.

**Option B - DevTools:**
1. Press F12
2. Go to "Application" tab
3. Click "Clear storage"
4. Click "Clear site data"

### Step 2: Restart Both Servers

```bash
# Stop both servers (Ctrl+C in each terminal)

# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend
cd Frontend  
npm run dev
```

### Step 3: Test

1. Open browser in **Incognito/Private mode** (to avoid cache)
2. Go to `http://localhost:5173`
3. Login
4. Go to a campaign donate page
5. Enter amount (e.g., $25)
6. Click PayPal button
7. Login with your **sandbox buyer account**:
   - Email: (from PayPal Developer Dashboard → Sandbox → Accounts)
   - Password: (from same place)

## 🔍 Verify Configuration

### Check Backend Config Endpoint

```bash
curl http://localhost:3001/api/paypal/config
```

**Expected Response:**
```json
{
  "clientId": "AXkW77EO3HBk05igOUIr5efxHPXB7BEXHq6gKBUU_0wAGWixljYK7lfWgr0FPfCvOt0jM-dCiTjsdue3"
}
```

### Check Browser Network Tab

1. Open donate page
2. Press F12 → Network tab
3. Look for `/api/paypal/config` request
4. Verify response has correct Client ID

## 🎯 If Still Not Working

### Issue 1: Sandbox Account Problems

**Go to:** https://developer.paypal.com/dashboard/

1. Click "Sandbox" → "Accounts"
2. Find your **Personal (buyer)** account
3. Check balance - should have funds (e.g., $5000)
4. If balance is $0 or negative:
   - Click "..." → "View/Edit Account"
   - Add funds (set to $5000)
   - Save

### Issue 2: Wrong Sandbox Account

Make sure you're logging in with:
- ✅ **Personal (buyer) account** - This is the test customer
- ❌ NOT the Business account - This is your merchant account

### Issue 3: Create New Sandbox Account

If your sandbox account is having issues:

1. Go to https://developer.paypal.com/dashboard/
2. Click "Sandbox" → "Accounts"
3. Click "Create Account"
4. Select:
   - Type: **Personal (buyer account)**
   - Country: Your country
   - Balance: $5000
5. Click "Create"
6. Note the email and password
7. Use this new account to test

### Issue 4: Verify PayPal App Credentials

Your backend `.env` should have credentials from the **same** PayPal app:

1. Go to https://developer.paypal.com/dashboard/
2. Click "Apps & Credentials"
3. Click "Sandbox" tab
4. Find your app (or create new one)
5. Copy **both** Client ID and Secret
6. Update `Backend/.env`:
   ```env
   PAYPAL_CLIENT_ID=<from_same_app>
   PAYPAL_SECRET=<from_same_app>
   PAYPAL_ENVIRONMENT=sandbox
   ```
7. Restart backend server

## 🐛 Debug Mode

### Add Console Logs

**Backend** - Add to `Backend/Routes/paypal.js`:

```javascript
router.post("/paypal/create-order", requireAuth, requireRole("donor"), async (req, res) => {
  try {
    console.log("🔍 Creating PayPal order...");
    console.log("💰 Amount:", req.body.amount);
    console.log("🔑 Client ID:", process.env.PAYPAL_CLIENT_ID?.substring(0, 20) + "...");
    console.log("🌍 Environment:", process.env.PAYPAL_ENVIRONMENT);
    
    // ... rest of code
    
    const paypalReq = await paypalClient().execute(request);
    const orderID = paypalReq.result.id;
    console.log("✅ Order created:", orderID);
    return res.json({ orderID });
  } catch (err) {
    console.error("❌ Create Order Error:", err);
    console.error("📄 Error Details:", err.message);
    return res.status(500).json({ error: "Could not create PayPal order." });
  }
});
```

**Frontend** - Check browser console for:
```
✅ PayPal SDK loaded
✅ Config fetched: { clientId: "AXkW..." }
✅ Order created: ORDER-123...
```

## 📋 Checklist

- [ ] Cleared browser cache
- [ ] Restarted backend server
- [ ] Restarted frontend server
- [ ] Tested in incognito mode
- [ ] Verified `/api/paypal/config` returns correct Client ID
- [ ] Checked sandbox account has funds
- [ ] Using Personal (buyer) sandbox account
- [ ] Backend logs show order creation
- [ ] Browser console shows no errors

## ✅ Expected Success

When working correctly, you should see:

**Backend Console:**
```
🔍 Creating PayPal order...
💰 Amount: 25
🔑 Client ID: AXkW77EO3HBk05igOUIr...
🌍 Environment: sandbox
✅ Order created: ORDER-123ABC456DEF
```

**Browser Console:**
```
PayPal SDK loaded successfully
Config fetched: { clientId: "AXkW..." }
Order created: ORDER-123ABC456DEF
Payment approved
Capture successful
```

**User Experience:**
1. Click PayPal button → PayPal popup opens
2. Login with sandbox account → Login successful
3. Approve payment → Payment approved
4. Redirected back → Receipt displayed

## 🆘 Still Having Issues?

Read the detailed troubleshooting guide:
- **File:** `PAYPAL_SANDBOX_TROUBLESHOOTING.md`
- Contains comprehensive diagnosis and solutions

Or check:
1. PayPal sandbox status: https://developer.paypal.com/dashboard/
2. Your sandbox account balance
3. Backend logs for detailed errors
4. Browser console for JavaScript errors

---

**Quick Summary:**
1. Clear cache
2. Restart servers
3. Test in incognito
4. Check sandbox account has funds
5. Use Personal (buyer) account

**Most Common Fix:** Clear browser cache + restart servers

Good luck! 🚀
