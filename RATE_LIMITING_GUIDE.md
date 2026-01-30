# Rate Limiting Configuration Guide

## 🚨 Issue: 429 Too Many Requests

If you're seeing `429 Too Many Requests` errors, it means you've hit the rate limit.

## 🔧 Quick Fix for Development

### Option 1: Disable Rate Limiting (Recommended for Development)

**In `Backend/.env`:**
```bash
NODE_ENV=development
# Don't set ENABLE_RATE_LIMITING or set it to false
```

Rate limiting will be **automatically disabled** in development mode.

### Option 2: Enable with Higher Limits

**In `Backend/.env`:**
```bash
NODE_ENV=development
ENABLE_RATE_LIMITING=true
```

This enables rate limiting but with **much higher limits** for development:
- Login/Register: 20 attempts per 5 minutes (vs 5 per 15 min in production)
- API calls: 1000 requests per 15 minutes (vs 200 in production)
- File uploads: 50 per hour (vs 10 in production)

### Option 3: Production Mode (Strict Limits)

**In `Backend/.env`:**
```bash
NODE_ENV=production
```

This enables **strict rate limiting**:
- Login/Register: 5 attempts per 15 minutes
- API calls: 200 requests per 15 minutes
- File uploads: 10 per hour

## 📊 Current Rate Limits

### Development Mode (NODE_ENV=development)

| Endpoint Type | Limit | Window | Applied To |
|--------------|-------|--------|------------|
| **Strict** (Login, Register, Password Reset) | 20 requests | 5 minutes | `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password` |
| **API** (General endpoints) | 1000 requests | 15 minutes | All `/api/*` routes (if enabled) |
| **Upload** (File uploads) | 50 uploads | 1 hour | Document/image uploads |

### Production Mode (NODE_ENV=production)

| Endpoint Type | Limit | Window | Applied To |
|--------------|-------|--------|------------|
| **Strict** (Login, Register, Password Reset) | 5 requests | 15 minutes | `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password` |
| **API** (General endpoints) | 200 requests | 15 minutes | All `/api/*` routes |
| **Upload** (File uploads) | 10 uploads | 1 hour | Document/image uploads |

## 🎯 How Rate Limiting Works

### Per IP Address
Rate limits are tracked **per IP address**. If you're testing from the same computer:
- Each failed login counts against your IP
- Each API call counts against your IP
- Limits reset after the time window

### Example Scenario
```
Time: 10:00 AM - Login attempt 1 ✅
Time: 10:01 AM - Login attempt 2 ✅
Time: 10:02 AM - Login attempt 3 ✅
Time: 10:03 AM - Login attempt 4 ✅
Time: 10:04 AM - Login attempt 5 ✅
Time: 10:05 AM - Login attempt 6 ❌ (Rate limited in production)
Time: 10:15 AM - Limit resets, can try again ✅
```

## 🔍 Checking Rate Limit Status

### Response Headers
Every API response includes rate limit headers:

```http
X-RateLimit-Limit: 20          # Maximum requests allowed
X-RateLimit-Remaining: 15      # Requests remaining
X-RateLimit-Reset: 2025-01-29T10:15:00.000Z  # When limit resets
```

### 429 Response
When rate limited, you'll receive:

```json
{
  "message": "Too many attempts, please try again later",
  "retryAfter": 300  // Seconds until you can retry
}
```

## 🛠️ Troubleshooting

### Problem: Getting 429 on Login

**Cause:** Too many failed login attempts

**Solutions:**
1. **Wait for reset** (5-15 minutes depending on mode)
2. **Use correct credentials** (each failed attempt counts)
3. **Switch to development mode** (higher limits)
4. **Clear rate limit** (see below)

### Problem: Getting 429 on API Calls

**Cause:** Too many API requests in short time

**Solutions:**
1. **Disable global rate limiting** (set `NODE_ENV=development`)
2. **Optimize frontend** (reduce unnecessary API calls)
3. **Add request caching** (cache responses in frontend)
4. **Increase limits** (adjust in `rateLimiter.js`)

### Problem: Getting 429 on File Uploads

**Cause:** Too many file uploads

**Solutions:**
1. **Wait for reset** (1 hour)
2. **Switch to development mode** (50 uploads/hour vs 10)
3. **Batch uploads** (upload multiple files at once)

## 🧹 Clearing Rate Limits (Development Only)

### Method 1: Restart Server
```bash
# Stop server (Ctrl+C)
# Start server
cd Backend
npm run dev
```

Rate limits are stored in memory and reset on restart.

### Method 2: Wait for Window to Expire
- Strict limits: Wait 5-15 minutes
- API limits: Wait 15 minutes
- Upload limits: Wait 1 hour

### Method 3: Change IP Address
- Use VPN
- Use different network
- Use mobile hotspot

## ⚙️ Customizing Rate Limits

### Edit `Backend/middleware/rateLimiter.js`

```javascript
// Adjust limits for your needs
export const strictRateLimiter = createRateLimiter({
  maxAttempts: process.env.NODE_ENV === "production" ? 5 : 50, // Change 50 to your desired limit
  windowMs: process.env.NODE_ENV === "production" ? 15 * 60 * 1000 : 5 * 60 * 1000,
  message: "Too many attempts, please try again later",
});

export const apiRateLimiter = createRateLimiter({
  maxAttempts: process.env.NODE_ENV === "production" ? 200 : 2000, // Change 2000 to your desired limit
  windowMs: 15 * 60 * 1000,
});
```

### Disable Specific Rate Limiters

**Remove from specific routes:**

```javascript
// Before (with rate limiting)
router.post("/login", strictRateLimiter, loginHandler);

// After (without rate limiting)
router.post("/login", loginHandler);
```

## 🚀 Production Recommendations

### Use Redis for Distributed Rate Limiting

When running multiple server instances, use Redis:

```bash
npm install redis
```

```javascript
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL
});

await redisClient.connect();

// Use Redis instead of Map for rate limit storage
```

### Monitor Rate Limit Hits

```javascript
// Add to rateLimiter.js
if (!result.allowed) {
  // Send alert to monitoring service
  await sendAlert({
    type: 'rate_limit_exceeded',
    ip: req.ip,
    path: req.path,
    timestamp: new Date()
  });
}
```

### Adjust Based on Traffic

Monitor your application and adjust limits based on:
- Average requests per user
- Peak traffic times
- Legitimate use patterns
- Attack patterns

## 📈 Best Practices

### 1. Different Limits for Different Endpoints
```javascript
// Strict for authentication
router.post("/login", strictRateLimiter, ...);

// Lenient for public data
router.get("/campaigns", publicRateLimiter, ...);

// Very strict for expensive operations
router.post("/upload", uploadRateLimiter, ...);
```

### 2. Whitelist Trusted IPs
```javascript
const trustedIPs = ['127.0.0.1', '::1'];

export function createRateLimiter(options = {}) {
  return (req, res, next) => {
    if (trustedIPs.includes(req.ip)) {
      return next(); // Skip rate limiting
    }
    // ... rest of rate limiting logic
  };
}
```

### 3. User-Based Rate Limiting
```javascript
// Rate limit per user instead of per IP
keyGenerator: (req) => req.user?.userId || req.ip
```

### 4. Graceful Degradation
```javascript
// Instead of blocking, slow down responses
if (attempts > softLimit) {
  await sleep(1000); // Add 1 second delay
}
```

## 🔐 Security Considerations

### Why Rate Limiting is Important

1. **Prevents Brute Force Attacks**
   - Limits password guessing attempts
   - Protects against credential stuffing

2. **Prevents DoS Attacks**
   - Limits requests from single IP
   - Prevents resource exhaustion

3. **Protects API Resources**
   - Prevents abuse of expensive operations
   - Ensures fair usage

4. **Reduces Costs**
   - Limits database queries
   - Reduces bandwidth usage
   - Prevents unnecessary processing

### When to Disable

**✅ Safe to disable:**
- Local development
- Testing environment
- Trusted internal network

**❌ Never disable in:**
- Production
- Public-facing servers
- Staging with real data

## 📞 Common Questions

### Q: Why am I rate limited after 5 login attempts?
**A:** This is a security feature to prevent brute force attacks. Wait 5-15 minutes or switch to development mode.

### Q: Can I increase the limits permanently?
**A:** Yes, edit `rateLimiter.js` but keep security in mind. Higher limits = more vulnerable to attacks.

### Q: Does rate limiting affect all users?
**A:** No, it's per IP address. Each user/IP has their own limit.

### Q: What happens when limit resets?
**A:** Counter goes back to 0, you can make requests again.

### Q: Can I see my current rate limit status?
**A:** Yes, check the `X-RateLimit-*` headers in API responses.

## ✅ Summary

**For Development:**
```bash
# In Backend/.env
NODE_ENV=development
# Rate limiting disabled by default
```

**For Production:**
```bash
# In Backend/.env
NODE_ENV=production
# Rate limiting enabled with strict limits
```

**Current Settings:**
- ✅ Development: Very lenient (20 login attempts, 1000 API calls)
- ✅ Production: Strict (5 login attempts, 200 API calls)
- ✅ Automatic based on NODE_ENV
- ✅ Can be customized in `rateLimiter.js`

---

**Last Updated:** January 2025
**Version:** 2.0.0 (Adjusted for development)
