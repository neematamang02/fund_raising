/**
 * Input validation utilities
 * Provides sanitization and validation for user inputs
 */

/**
 * Sanitize string input - remove dangerous characters
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
export function sanitizeString(input) {
  if (typeof input !== "string") return "";
  
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (international format)
 * @param {string} phone - Phone number
 * @returns {boolean} True if valid
 */
export function isValidPhone(phone) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
}

/**
 * Validate amount (positive number with max 2 decimals)
 * @param {number|string} amount - Amount to validate
 * @returns {boolean} True if valid
 */
export function isValidAmount(amount) {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num < 1000000 && /^\d+(\.\d{1,2})?$/.test(amount.toString());
}

/**
 * Validate file upload
 * @param {Object} file - Multer file object
 * @param {string[]} allowedTypes - Allowed MIME types
 * @param {number} maxSize - Max file size in bytes
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateFile(file, allowedTypes = [], maxSize = 10 * 1024 * 1024) {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }
  
  // Check file size
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size exceeds maximum of ${maxSize / (1024 * 1024)}MB` 
    };
  }
  
  // Check MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
    return { 
      valid: false, 
      error: `File type not allowed. Allowed types: ${allowedTypes.join(", ")}` 
    };
  }
  
  // Check file extension matches MIME type
  const ext = file.originalname.split(".").pop().toLowerCase();
  const mimeToExt = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "application/pdf": ["pdf"],
  };
  
  const expectedExts = mimeToExt[file.mimetype];
  if (expectedExts && !expectedExts.includes(ext)) {
    return { 
      valid: false, 
      error: "File extension does not match file type" 
    };
  }
  
  return { valid: true };
}

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid
 */
export function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Sanitize and validate bank account number
 * @param {string} accountNumber - Account number
 * @returns {Object} { valid: boolean, sanitized: string, error: string }
 */
export function validateBankAccount(accountNumber) {
  if (!accountNumber) {
    return { valid: false, error: "Account number is required" };
  }
  
  // Remove spaces and dashes
  const sanitized = accountNumber.replace(/[\s\-]/g, "");
  
  // Check if it's alphanumeric and reasonable length
  if (!/^[A-Z0-9]{4,34}$/i.test(sanitized)) {
    return { 
      valid: false, 
      error: "Invalid account number format" 
    };
  }
  
  return { valid: true, sanitized };
}

/**
 * Rate limiting helper - check if action is allowed
 * @param {Map} store - Rate limit store
 * @param {string} key - Unique key (e.g., IP address, user ID)
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} { allowed: boolean, remaining: number, resetTime: Date }
 */
export function checkRateLimit(store, key, maxAttempts, windowMs) {
  const now = Date.now();
  const record = store.get(key);
  
  if (!record || now > record.resetTime) {
    // First attempt or window expired
    store.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxAttempts - 1, resetTime: new Date(now + windowMs) };
  }
  
  if (record.count >= maxAttempts) {
    // Rate limit exceeded
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: new Date(record.resetTime) 
    };
  }
  
  // Increment count
  record.count++;
  store.set(key, record);
  
  return { 
    allowed: true, 
    remaining: maxAttempts - record.count, 
    resetTime: new Date(record.resetTime) 
  };
}
