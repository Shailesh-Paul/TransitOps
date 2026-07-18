import bcrypt from 'bcryptjs';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

/**
 * Hashes a plain text password using bcrypt.
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} The hashed password.
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Compares a plain text password against a bcrypt hash.
 * @param {string} password - The plain text password.
 * @param {string} hash - The stored bcrypt hash.
 * @returns {Promise<boolean>} True if they match, false otherwise.
 */
export const comparePassword = async (password, hash) => {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
};

/**
 * Validates password strength based on security policies.
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * 
 * @param {string} password - The password to validate.
 * @returns {{ isValid: boolean, message?: string }} Validation result.
 */
export const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUppercase) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!hasLowercase) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
  }
  if (!hasNumbers) {
    return { isValid: false, message: 'Password must contain at least one number.' };
  }
  if (!hasSpecialChar) {
    return { isValid: false, message: 'Password must contain at least one special character.' };
  }

  return { isValid: true };
};
