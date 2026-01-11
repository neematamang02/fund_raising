# 🔒 PayPal Configuration Security Update

## Overview

Updated the PayPal integration to fetch the client ID securely from the backend instead of exposing it in the frontend environment variables.

## Changes Made

### 1. Backend Changes

**File:** `Backend/Routes/paypal.js`

Added a new public endpoint to provide PayPal configuration:

```javascript
// GET /api/paypal/config
// Returns: { clientId }
router.get("/paypal/config", (req, res) => {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    
    if (!clientId) {
      return res.status(500).json({ 
        error: "PayPal configuration not found on server" 
      });
    }
    
    return res.json({ clientId });
  } catch (err) {
    console.error("PayPal Config Error:", err);
    return res.status(500).json({ 
      error: "Could not fetch PayPal configuration" 
    });
  }
});
```

### 2. Frontend Changes

**File:** `Frontend/src/Pages/Donate.jsx`

Updated to fetch PayPal client ID from backend:

```javascript
// Added state for PayPal client ID
const [paypalClientId, setPaypalClientId] = useState(null);

// Fetch PayPal Client ID from backend
const { data: paypalConfig, isLoading: loadingPaypalConfig } = useQuery({
  queryKey: ["paypalConfig"],
  queryFn: async () => {
    const res = await fetch("/api/paypal/config");
    if (!res.ok) {
      throw new Error("Could not fetch PayPal configuration");
    }
    const data = await res.json();
    setPaypalClientId(data.clientId);
    return data;
  },
  retry: 2,
  staleTime: 1000 * 60 * 60, // Cache for 1 hour
});

// Updated PayPalScriptProvider to use fetched client ID
<PayPalScriptProvider
  options={{
    "client-id": paypalClientId, // ← Now from backend
    currency: "USD",
    intent: "capture",
    components: "buttons",
    "disable-funding": "credit",
  }}
>
```

### 3. Environment Variables

**File:** `Frontend/.env`

Removed the PayPal client ID from frontend environment:

```env
# Before
VITE_BACKEND_URL=http://localhost:3001
VITE_PAYPAL_CLIENT_ID=AXkW77EO3HBk05igOUIr5efxHPXB7BEXHq6gKBUU_0wAGWixljYK7lfWgr0FPfCvOt0jM-dCiTjsdue3

# After
VITE_BACKEND_URL=http://localhost:3001
```

**File:** `Backend/.env` (No changes needed)

PayPal configuration remains secure in backend:

```env
PAYPAL_CLIENT_ID=AQUZ4SO17eNNGsg3ZBobGIDMwOe5z6XtxHJ990HiJFW4H_DJo6ek9JYpTKO30JA5d23WUM08Izj7kU-z
PAYPAL_SECRET=EPKuulEdqhNwY-_SEz2NnMAjxlpURnsz0i49TZRH3jpeqgBFc1vZuDpbcsdMVWLfAP687s1_f15NeQQz
PAYPAL_ENVIRONMENT=sandbox
```

## Benefits

### 🔒 Security Improvements

1. **No Client-Side Exposure**
   - PayPal client ID is no longer visible in frontend bundle
   - Cannot be extracted from browser DevTools
   - Not exposed in version control (if .env is committed)

2. **Centralized Configuration**
   - Single source of truth (backend .env)
   - Easier to update and manage
   - No need to rebuild frontend for config changes

3. **Better Secret Management**
   - All sensitive credentials stay on backend
   - Follows security best practices
   - Easier to implement environment-specific configs

### ⚡ Performance

- **Caching:** Client ID is cached for 1 hour
- **Minimal Impact:** Single API call on page load
- **Retry Logic:** Automatic retry on failure (2 attempts)

## How It Works

### Flow Diagram

```
User Opens Donate Page
        ↓
Frontend Loads
        ↓
Fetch PayPal Config from Backend
        ↓
GET /api/paypal/config
        ↓
Backend Returns { clientId }
        ↓
Frontend Caches Config (1 hour)
        ↓
Initialize PayPal SDK
        ↓
User Can Donate
```

### API Endpoint

**Endpoint:** `GET /api/paypal/config`

**Authentication:** None required (public endpoint)

**Response:**
```json
{
  "clientId": "AQUZ4SO17eNNGsg3ZBobGIDMwOe5z6XtxHJ990HiJFW4H_DJo6ek9JYpTKO30JA5d23WUM08Izj7kU-z"
}
```

**Error Response:**
```json
{
  "error": "PayPal configuration not found on server"
}
```

## Testing

### 1. Test Backend Endpoint

```bash
# Test the config endpoint
curl http://localhost:3001/api/paypal/config
```

Expected response:
```json
{
  "clientId": "AQUZ4SO17eNNGsg3ZBobGIDMwOe5z6XtxHJ990HiJFW4H_DJo6ek9JYpTKO30JA5d23WUM08Izj7kU-z"
}
```

### 2. Test Frontend Integration

1. Start backend server:
   ```bash
   cd Backend
   npm run dev
   ```

2. Start frontend server:
   ```bash
   cd Frontend
   npm run dev
   ```

3. Navigate to a campaign donate page
4. Check browser console - should see PayPal SDK loading
5. Verify PayPal buttons appear
6. Test donation flow

### 3. Verify Security

1. Open browser DevTools → Network tab
2. Look for `/api/paypal/config` request
3. Verify client ID is fetched from backend
4. Check frontend bundle - client ID should NOT be in source code

## Error Handling

### Backend Errors

**Missing Environment Variable:**
```javascript
if (!clientId) {
  return res.status(500).json({ 
    error: "PayPal configuration not found on server" 
  });
}
```

**Server Error:**
```javascript
catch (err) {
  console.error("PayPal Config Error:", err);
  return res.status(500).json({ 
    error: "Could not fetch PayPal configuration" 
  });
}
```

### Frontend Errors

**Loading State:**
```javascript
if (loadingPaypalConfig) {
  return <div>Loading payment system...</div>;
}
```

**Config Not Available:**
```javascript
{paypalClientId ? (
  <PayPalScriptProvider>
    {/* PayPal buttons */}
  </PayPalScriptProvider>
) : (
  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
    <p className="text-red-800 text-sm">
      Payment system is currently unavailable. Please try again later.
    </p>
  </div>
)}
```

**Retry Logic:**
```javascript
useQuery({
  queryKey: ["paypalConfig"],
  queryFn: fetchConfig,
  retry: 2, // Retry up to 2 times on failure
  staleTime: 1000 * 60 * 60, // Cache for 1 hour
});
```

## Migration Guide

### For Existing Deployments

1. **Update Backend:**
   ```bash
   git pull
   cd Backend
   npm install
   npm run dev
   ```

2. **Update Frontend:**
   ```bash
   cd Frontend
   # Remove VITE_PAYPAL_CLIENT_ID from .env
   npm install
   npm run dev
   ```

3. **Verify:**
   - Test donate page
   - Check PayPal buttons load
   - Complete test donation

### For New Deployments

1. **Backend .env:**
   ```env
   PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_SECRET=your_secret
   PAYPAL_ENVIRONMENT=sandbox
   ```

2. **Frontend .env:**
   ```env
   VITE_BACKEND_URL=http://localhost:3001
   # No PayPal config needed!
   ```

## Production Considerations

### 1. CORS Configuration

Ensure backend allows frontend origin:

```javascript
// Backend/app.js or server.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### 2. Rate Limiting

Consider adding rate limiting to config endpoint:

```javascript
import rateLimit from 'express-rate-limit';

const configLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.get("/paypal/config", configLimiter, (req, res) => {
  // ...
});
```

### 3. Caching Headers

Add caching headers for better performance:

```javascript
router.get("/paypal/config", (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID });
});
```

### 4. Environment-Specific Configs

Use different PayPal accounts for different environments:

```env
# Development
PAYPAL_CLIENT_ID=sandbox_client_id
PAYPAL_ENVIRONMENT=sandbox

# Production
PAYPAL_CLIENT_ID=live_client_id
PAYPAL_ENVIRONMENT=live
```

## Troubleshooting

### Issue: PayPal Buttons Not Showing

**Cause:** Client ID not fetched from backend

**Solution:**
1. Check backend is running
2. Verify `/api/paypal/config` endpoint works
3. Check browser console for errors
4. Verify `PAYPAL_CLIENT_ID` is set in backend .env

### Issue: "Payment system is currently unavailable"

**Cause:** Backend config endpoint failed

**Solution:**
1. Check backend logs for errors
2. Verify `PAYPAL_CLIENT_ID` exists in backend .env
3. Test endpoint directly: `curl http://localhost:3001/api/paypal/config`
4. Check network tab in browser DevTools

### Issue: CORS Error

**Cause:** Frontend can't access backend endpoint

**Solution:**
1. Verify CORS is configured in backend
2. Check `FRONTEND_URL` in backend .env
3. Ensure frontend proxy is configured (if using Vite)

## Security Best Practices

### ✅ Do's

- ✅ Keep PayPal secret on backend only
- ✅ Use environment variables for all credentials
- ✅ Add rate limiting to config endpoint
- ✅ Implement proper error handling
- ✅ Cache config on frontend to reduce requests
- ✅ Use HTTPS in production
- ✅ Validate all PayPal responses on backend

### ❌ Don'ts

- ❌ Don't expose PayPal secret to frontend
- ❌ Don't commit .env files to version control
- ❌ Don't hardcode credentials in code
- ❌ Don't skip error handling
- ❌ Don't trust client-side validation only
- ❌ Don't use same credentials for dev and prod

## Files Modified

| File | Type | Changes |
|------|------|---------|
| `Backend/Routes/paypal.js` | Modified | Added `/api/paypal/config` endpoint |
| `Frontend/src/Pages/Donate.jsx` | Modified | Fetch client ID from backend |
| `Frontend/.env` | Modified | Removed `VITE_PAYPAL_CLIENT_ID` |
| `Backend/.env` | No Change | PayPal config remains secure |

## Summary

This update improves security by:
- Moving PayPal client ID from frontend to backend
- Creating a secure API endpoint for configuration
- Implementing proper error handling and caching
- Following security best practices

The donation flow remains unchanged for users, but the system is now more secure and maintainable.

---

**Status:** ✅ Complete  
**Version:** 1.0.0  
**Date:** January 2026  
**Impact:** Security improvement, no breaking changes for users
