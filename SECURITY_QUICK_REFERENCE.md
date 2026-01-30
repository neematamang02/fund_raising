# Security Quick Reference Guide

## 🚀 Quick Start

### 1. Generate Required Secrets
```bash
# Generate JWT Secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate Encryption Key (64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Update .env File
```bash
cp Backend/.env.example Backend/.env
# Edit Backend/.env with your generated secrets
```

### 3. Install Dependencies
```bash
cd Backend
npm install
```

## 🔐 Security Features Overview

### Rate Limiting
| Endpoint Type | Limit | Window | Applied To |
|--------------|-------|--------|------------|
| Strict | 5 requests | 15 min | Login, Register, Password Reset |
| API | 100 requests | 15 min | All API endpoints |
| Upload | 10 uploads | 1 hour | File uploads |

### Encrypted Data
- ✅ Bank account numbers
- ✅ Routing numbers
- ✅ SWIFT codes
- ✅ IBAN numbers
- ✅ Tax IDs

### Password Requirements
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number
- Hashed with bcrypt (12 rounds)

### File Upload Limits
- Max size: 10MB
- Allowed types: JPG, PNG, PDF
- MIME type verification
- Extension validation

## 🛠️ Using Security Utilities

### Logging
```javascript
import { logError, logInfo, logSecurityEvent } from "../utils/logger.js";

// Log errors
logError("Operation failed", error, { userId: "123" });

// Log info
logInfo("User logged in", { userId: "123" });

// Log security events
logSecurityEvent("Failed login attempt", { email: "user@example.com" });
```

### Validation
```javascript
import { 
  sanitizeString, 
  isValidEmail, 
  isValidAmount,
  validateBankAccount 
} from "../utils/validation.js";

// Sanitize input
const clean = sanitizeString(userInput);

// Validate email
if (!isValidEmail(email)) {
  return res.status(400).json({ message: "Invalid email" });
}

// Validate amount
if (!isValidAmount(amount)) {
  return res.status(400).json({ message: "Invalid amount" });
}

// Validate bank account
const result = validateBankAccount(accountNumber);
if (!result.valid) {
  return res.status(400).json({ message: result.error });
}
```

### Encryption
```javascript
import { encrypt, decrypt, maskSensitiveData } from "../utils/encryption.js";

// Encrypt sensitive data
const encrypted = encrypt("1234567890");

// Decrypt (admin only)
const decrypted = decrypt(encrypted);

// Mask for display
const masked = maskSensitiveData("1234567890", 4); // ******7890
```

### Rate Limiting
```javascript
import { 
  strictRateLimiter, 
  apiRateLimiter,
  uploadRateLimiter 
} from "../middleware/rateLimiter.js";

// Apply to routes
router.post("/login", strictRateLimiter, loginHandler);
router.post("/upload", uploadRateLimiter, uploadHandler);
```

### File Validation
```javascript
import { 
  validateDocumentUpload,
  validateImageUpload 
} from "../middleware/fileValidation.js";

// Apply to upload routes
router.post(
  "/upload-doc",
  upload.single("document"),
  validateDocumentUpload,
  handler
);
```

## 🔍 Security Checklist

### Development
- [ ] Never commit .env files
- [ ] Use strong secrets (generated, not typed)
- [ ] Test with invalid inputs
- [ ] Review error messages (no sensitive data)
- [ ] Check rate limits work
- [ ] Verify file upload restrictions

### Before Production
- [ ] Set NODE_ENV=production
- [ ] Generate new production secrets
- [ ] Enable HTTPS only
- [ ] Configure real email service
- [ ] Set up monitoring
- [ ] Review CORS origins
- [ ] Test rate limits under load
- [ ] Verify encryption works
- [ ] Check all env vars set

### Production Monitoring
- [ ] Monitor failed auth attempts
- [ ] Track rate limit hits
- [ ] Watch error rates
- [ ] Review security logs daily
- [ ] Check for unusual patterns
- [ ] Monitor file upload activity

## 🚨 Common Issues & Solutions

### Issue: "ENCRYPTION_KEY not set"
**Solution:** Generate and add to .env
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Issue: "Too many requests"
**Solution:** Rate limit hit - wait or adjust limits in `rateLimiter.js`

### Issue: "File type not allowed"
**Solution:** Check file is JPG, PNG, or PDF and under 10MB

### Issue: "Invalid token"
**Solution:** Token expired or invalid - user needs to login again

### Issue: "Decryption failed"
**Solution:** ENCRYPTION_KEY changed - data encrypted with old key

## 📊 Security Metrics to Track

### Critical Alerts
- Failed login attempts > 10/minute
- Rate limit hits > 1000/hour
- File upload failures > 50/hour
- 401/403 errors > 100/hour
- 500 errors > 10/minute

### Daily Review
- Total failed authentications
- Unique IPs hitting rate limits
- File upload patterns
- Error distribution
- Slow queries

### Weekly Review
- User growth patterns
- Geographic access patterns
- Peak usage times
- Resource utilization
- Security log anomalies

## 🔄 Key Rotation Process

### JWT Secret Rotation
1. Generate new secret
2. Update .env with new secret
3. Restart application
4. All users will need to re-login

### Encryption Key Rotation
⚠️ **Complex - requires data migration**
1. Generate new key
2. Create migration script to re-encrypt data
3. Test migration on backup
4. Schedule maintenance window
5. Run migration
6. Update .env
7. Restart application

## 📞 Security Contacts

### Report Security Issue
- Email: security@yourcompany.com
- Encrypt with PGP key (if available)
- Include: Description, steps to reproduce, impact

### Emergency Response
1. Identify issue severity
2. Notify security team
3. Follow incident response plan
4. Document everything
5. Communicate with stakeholders

## 📚 Additional Documentation

- Full security details: `SECURITY_IMPROVEMENTS.md`
- Deployment guide: `DEPLOYMENT_CHECKLIST.md`
- API documentation: (Add Swagger/OpenAPI link)
- Monitoring setup: (Add monitoring guide link)

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Maintained By:** Development Team
