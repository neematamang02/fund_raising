# 🔧 PayPal Sandbox Payment Error - Diagnosis & Fix

## 🚨 Issue Identified

**Error Message:**
> "We aren't able to process your payment using your PayPal account at this time. Please go back to merchant and try using a different payment method."

## 🔍 Root Cause

**CRITICAL ISSUE FOUND:** You have **two different PayPal Client IDs** configured:

### Backend `.env`:
```env
PAYPAL_CLIENT_ID=AXkW77EO3HBk05igOUIr5efxHPXB7BEXHq6gKBUU_0wAGWixljYK7lfWgr0FPfCvOt0jM-dCiTjsdue3
PAYPAL_SECRET=EEVXMy7NDdd4mYs3-b_34QYh-0IQclcUXw1YeMvz5OiLA02j7OUqnwxicfoVe7GM_hFkIllI9fanNFxZ
```

### Frontend `.env` (OLD - now removed):
```env
VITE_PAYPAL_CLIENT_ID=AXkW77EO3HBk05igOUIr5efxHPXB7BEXHq6gKBUU_0wAGWixljYK7lfWgr0FPfCvOt0jM-dCiTjsdue3
```

**The Problem:**
- Frontend creates order with Client ID: `AXkW77EO3HBk05igOUIr5efxHPXB7BEXHq6gKBUU_0w...` (OLD)
- Backend tries to capture with Client ID: `AXkW77EO3HBk05igOUIr5efxHPXB7BEXHq6gKBUU_0w...` (CURRENT)
- **These are from DIFFERENT PayPal apps!**
- PayPal rejects the payment because the credentials don't match

## ✅ Solution

Since we just updated the system to fetch the Client ID from the backend, the frontend should now use the **same** Client ID as the backend. However, there might be caching issues.

### Step 1: Clear Browser Cache

```bash
# In your browser:
1. Open DevTools (F12)
2. Go to Application tab
3. Clear Storage → Clear site data
4. Or use Ctrl+Shift+Delete → Clear cache
```

### Step 2: Verify Backend Configuration

Your backend `.env` should have:

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=AXkW77EO3HBk05igOUIr5efxHPXB7BEXHq6gKBUU_0wAGWixljYK7lfWgr0FPfCvOt0jM-dCiTjsdue3
PAYPAL_SECRET=EEVXMy7NDdd4mYs3-b_34QYh-0IQclcUXw1YeMvz5OiLA02j7OUqnwxicfoVe7GM_hFkIllI9fanNFxZ
PAYPAL_ENVIRONMENT=sandbox
```

### Step 3: Restart Both Servers

```bash
# Stop both servers (Ctrl+C)

# Restart Backend
cd Backend
npm run dev

# Restart Frontend (in new terminal)
cd Frontend
npm run dev
```

### Step 4: Test the Config Endpoint

```bash
curl http://localhost:3001/api/paypal/config
```

**Expected Response:**
```json
{
  "clientId": "AXkW77EO3HBk05igOUIr5efxHPXB7BEXHq6gKBUU_0wAGWixljYK7lfWgr0FPfCvOt0jM-dCiTjsdue3"
}
```

### Step 5: Verify Frontend Fetches Correct ID

1. Open donate page in browser
2. Open DevTools → Network tab
3. Look for `/api/paypal/config` request
4. Verify response has correct Client ID
5. Check Console for any errors

## 🔍 Additional Common Issues

### Issue 1: Sandbox Account Problems

**Symptoms:**
- Login works but payment fails
- "Unable to process payment" error

**Causes:**
1. **Negative Balance:** Sandbox account has insufficient funds
2. **Account Limitations:** Sandbox account is limited or locked
3. **Wrong Account Type:** Using business account instead of personal
4. **Expired Sandbox Account:** Sandbox accounts expire after inactivity

**Solutions:**

#### A. Check Sandbox Account Balance
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Click "Sandbox" → "Accounts"
3. Find your test buyer account
4. Check balance - should have funds (e.g., $5000)
5. If balance is low, click "..." → "View/Edit Account" → Add funds

#### B. Create New Sandbox Account
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Click "Sandbox" → "Accounts"
3. Click "Create Account"
4. Select "Personal (buyer account)"
5. Set balance to $5000
6. Save and use new credentials

#### C. Verify Account Type
- **Buyer Account:** Personal account with funds (for testing donations)
- **Seller Account:** Business account (your app receives payments here)
- Make sure you're logging in with the **buyer account**

### Issue 2: API Credentials Mismatch

**Symptoms:**
- Order created but capture fails
- Authentication errors in backend logs

**Solution:**
Ensure Client ID and Secret are from the **same** PayPal app:

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Click "Apps & Credentials"
3. Select "Sandbox" tab
4. Find your app (or create new one)
5. Copy **both** Client ID and Secret from the **same** app
6. Update `Backend/.env`:
   ```env
   PAYPAL_CLIENT_ID=<from_same_app>
   PAYPAL_SECRET=<from_same_app>
   ```

### Issue 3: Webhook/Return URL Issues

**Symptoms:**
- Payment completes but doesn't redirect
- Order created but not captured

**Current Configuration:**
```javascript
application_context: {
  brand_name: "FundApp",
  landing_page: "NO_PREFERENCE",
  user_action: "PAY_NOW",
  return_url: `${process.env.FRONTEND_URL}/donate/success`,
  cancel_url: `${process.env.FRONTEND_URL}/donate/cancel`,
}
```

**Verify:**
```env
FRONTEND_URL=http://localhost:5173
```

**Note:** For sandbox, `localhost` URLs are fine. For production, use HTTPS URLs.

### Issue 4: Currency/Amount Issues

**Symptoms:**
- "Amount is invalid" error
- Payment rejected

**Current Implementation:**
```javascript
amount: {
  currency_code: "USD",
  value: amount.toFixed(2), // ✅ Correct - 2 decimal places
}
```

**Verify:**
- Amount is greater than 0
- Amount has max 2 decimal places
- Currency is supported (USD is fine)

### Issue 5: Sandbox Environment Not Set

**Symptoms:**
- Using live credentials in sandbox
- Authentication failures

**Verify:**
```env
PAYPAL_ENVIRONMENT=sandbox  # ✅ Must be "sandbox" for testing
```

**In Code:**
```javascript
// Backend/services/paypalClient.js
function environment() {
  if (process.env.PAYPAL_ENVIRONMENT === "live") {
    return new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_SECRET
    );
  }
  // ✅ Returns sandbox environment
  return new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_SECRET
  );
}
```

## 🧪 Complete Testing Checklist

### 1. Verify Configuration

```bash
# Check backend .env
cat Backend/.env | grep PAYPAL

# Should show:
# PAYPAL_CLIENT_ID=AXkW77EO3HBk05igOUIr5efxHPXB7BEXHq6gKBUU_0w...
# PAYPAL_SECRET=EEVXMy7NDdd4mYs3-b_34QYh-0IQclcUXw1YeMvz5OiLA02j7OUqnwxicfoVe7GM_hFkIllI9fanNFxZ
# PAYPAL_ENVIRONMENT=sandbox
```

### 2. Test Config Endpoint

```bash
curl http://localhost:3001/api/paypal/config
```

### 3. Test Order Creation

```bash
# Login first and get token
TOKEN="your_jwt_token"

# Create order
curl -X POST http://localhost:3001/api/paypal/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "campaignId": "your_campaign_id",
    "amount": 25.00
  }'
```

### 4. Check Backend Logs

Look for these in your backend console:

```
✅ Good:
- PayPal order created: ORDER-123ABC...
- PayPal capture successful: CAPTURE-456DEF...

❌ Bad:
- Create Order Error: Authentication failed
- Capture Order Error: Order not found
- PAYPAL_CLIENT_ID is undefined
```

### 5. Check Browser Console

Look for these in browser DevTools:

```
✅ Good:
- PayPal SDK loaded successfully
- Order created: ORDER-123ABC...
- Payment approved

❌ Bad:
- Failed to fetch /api/paypal/config
- PayPal SDK failed to load
- CORS error
- Network error
```

## 🔧 Debug Mode

Add detailed logging to help diagnose:

### Backend - Add Logging

```javascript
// Backend/Routes/paypal.js

router.post("/paypal/create-order", requireAuth, requireRole("donor"), async (req, res) => {
  try {
    console.log("🔍 Creating PayPal order...");
    console.log("📋 Campaign ID:", req.body.campaignId);
    console.log("💰 Amount:", req.body.amount);
    console.log("🔑 Client ID:", process.env.PAYPAL_CLIENT_ID?.substring(0, 20) + "...");
    console.log("🌍 Environment:", process.env.PAYPAL_ENVIRONMENT);
    
    // ... rest of code
    
    console.log("✅ Order created:", orderID);
    return res.json({ orderID });
  } catch (err) {
    console.error("❌ Create Order Error:", err);
    console.error("📄 Error Details:", JSON.stringify(err, null, 2));
    return res.status(500).json({ error: "Could not create PayPal order." });
  }
});
```

### Frontend - Add Logging

```javascript
// Frontend/src/Pages/Donate.jsx

createOrder={async () => {
  console.log("🔍 Creating PayPal order...");
  console.log("💰 Amount:", amount);
  console.log("🔑 Client ID:", paypalClientId?.substring(0, 20) + "...");
  
  setErrorMsg("");
  if (!handleValidateBeforePayPal()) return Promise.reject();
  
  try {
    const { orderID } = await createOrderMutation.mutateAsync(amount);
    console.log("✅ Order created:", orderID);
    return orderID;
  } catch (error) {
    console.error("❌ Order creation failed:", error);
    setErrorMsg(error.message || "Failed to create PayPal order");
    throw error;
  }
}}
```

## 📝 Step-by-Step Fix Guide

### Step 1: Verify PayPal App Credentials

1. Go to https://developer.paypal.com/dashboard/
2. Login with your PayPal account
3. Click "Apps & Credentials"
4. Click "Sandbox" tab
5. Find your app or create new one:
   - Click "Create App"
   - Name: "Fundraising Platform Sandbox"
   - App Type: "Merchant"
   - Click "Create App"
6. Copy **Client ID** and **Secret** from the same app

### Step 2: Update Backend .env

```env
# Replace with credentials from Step 1
PAYPAL_CLIENT_ID=<your_client_id_from_step_1>
PAYPAL_SECRET=<your_secret_from_step_1>
PAYPAL_ENVIRONMENT=sandbox
```

### Step 3: Create/Verify Sandbox Test Accounts

1. In PayPal Developer Dashboard
2. Click "Sandbox" → "Accounts"
3. You should see at least 2 accounts:
   - **Business Account** (receives payments)
   - **Personal Account** (makes payments - this is what you login with)

4. If no Personal account exists:
   - Click "Create Account"
   - Type: "Personal (buyer account)"
   - Country: Your country
   - Balance: $5000
   - Click "Create"

5. Note the email and password for the Personal account

### Step 4: Restart Everything

```bash
# Stop all servers

# Clear node_modules cache (optional but recommended)
cd Backend
rm -rf node_modules package-lock.json
npm install

cd ../Frontend
rm -rf node_modules package-lock.json
npm install

# Start backend
cd Backend
npm run dev

# Start frontend (new terminal)
cd Frontend
npm run dev
```

### Step 5: Clear Browser Data

1. Open browser
2. Press F12 (DevTools)
3. Go to "Application" tab
4. Click "Clear storage"
5. Click "Clear site data"
6. Close and reopen browser

### Step 6: Test Payment

1. Go to donate page
2. Enter amount (e.g., $25)
3. Click PayPal button
4. Login with **Personal (buyer)** sandbox account
5. Complete payment

## 🎯 Expected Behavior

### Successful Flow:

```
1. User clicks PayPal button
   ↓
2. Frontend fetches config from backend
   ✅ GET /api/paypal/config → { clientId: "AXkW..." }
   ↓
3. Frontend creates order
   ✅ POST /api/paypal/create-order → { orderID: "ORDER-123..." }
   ↓
4. PayPal popup opens
   ✅ User logs in with sandbox account
   ✅ User approves payment
   ↓
5. Frontend captures order
   ✅ POST /api/paypal/capture-order → { donation, billReceipt }
   ↓
6. Success! Receipt displayed
```

### What You Should See:

**Backend Console:**
```
🔍 Creating PayPal order...
📋 Campaign ID: 507f1f77bcf86cd799439011
💰 Amount: 25
🔑 Client ID: AXkW77EO3HBk05igOUIr...
🌍 Environment: sandbox
✅ Order created: ORDER-123ABC456DEF
```

**Browser Console:**
```
🔍 Creating PayPal order...
💰 Amount: 25
🔑 Client ID: AXkW77EO3HBk05igOUIr...
✅ Order created: ORDER-123ABC456DEF
✅ Payment approved
✅ Capture successful
```

## 🆘 Still Not Working?

### Check These:

1. **Credentials Match:**
   ```bash
   # Both should be from the SAME PayPal app
   echo $PAYPAL_CLIENT_ID
   echo $PAYPAL_SECRET
   ```

2. **Sandbox Account Has Funds:**
   - Login to PayPal Developer Dashboard
   - Check sandbox account balance
   - Should have at least $5000

3. **Using Correct Account:**
   - Login with **Personal (buyer)** account
   - NOT the business account

4. **Network Issues:**
   - Check if you can access https://www.sandbox.paypal.com
   - Try different network/VPN

5. **PayPal Sandbox Status:**
   - Check https://developer.paypal.com/dashboard/
   - Look for any service outages

### Get Detailed Error Info:

Add this to capture endpoint:

```javascript
router.post("/paypal/capture-order", requireAuth, requireRole("donor"), async (req, res) => {
  try {
    // ... existing code
  } catch (err) {
    console.error("❌ Capture Order Error:", err);
    console.error("📄 Full Error:", JSON.stringify(err, null, 2));
    console.error("📋 Error Name:", err.name);
    console.error("📋 Error Message:", err.message);
    console.error("📋 Error Stack:", err.stack);
    
    // Return detailed error to frontend (only in development!)
    if (process.env.NODE_ENV === "development") {
      return res.status(500).json({ 
        error: "Could not capture PayPal order.",
        details: err.message,
        name: err.name
      });
    }
    
    return res.status(500).json({ error: "Could not capture PayPal order." });
  }
});
```

## 📞 Contact PayPal Support

If issue persists after trying everything:

1. Go to https://developer.paypal.com/support/
2. Click "Contact Us"
3. Provide:
   - Your Client ID (first 10 characters only)
   - Error message
   - Sandbox account email
   - Steps to reproduce

## ✅ Summary

**Most Likely Cause:** Client ID mismatch between frontend and backend

**Quick Fix:**
1. Clear browser cache
2. Restart both servers
3. Test with fresh browser session

**If Still Failing:**
1. Verify credentials are from same PayPal app
2. Check sandbox account has funds
3. Use Personal (buyer) account to login
4. Check backend logs for detailed errors

---

**Status:** Ready to Debug  
**Priority:** High  
**Estimated Fix Time:** 5-10 minutes
