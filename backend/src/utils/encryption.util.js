import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Derive 32-byte key from JWT_SECRET or fallback key
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'smarthealthsphere2026encryptedkey';
  return crypto.createHash('sha256').update(String(secret)).digest();
};

/**
 * Encrypts a text string using AES-256-CBC
 * @param {string} text 
 * @returns {object} { encryptedData, iv }
 */
export const encryptText = (text) => {
  if (!text) return { encryptedData: '', iv: '' };
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex')
  };
};

/**
 * Decrypts an encrypted hex string back to plaintext utf8
 * @param {string} encryptedData 
 * @param {string} ivHex 
 * @returns {string} plaintext
 */
export const decryptText = (encryptedData, ivHex) => {
  if (!encryptedData || !ivHex) return encryptedData || '';
  try {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err.message);
    return '[Encrypted Clinical Payload]';
  }
};
