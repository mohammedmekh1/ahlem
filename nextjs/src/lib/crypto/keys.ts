import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET_SEED = process.env.ENCRYPTION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
const SALT = process.env.ENCRYPTION_SALT || 'ahlem-platform-v1-salt';

if (!SECRET_SEED) {
  console.warn("ENCRYPTION_SECRET is not set. Falling back to an insecure configuration is highly discouraged for production.");
}

const ENCRYPTION_KEY = scryptSync(SECRET_SEED || 'emergency-fallback-key', SALT, 32);
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  if (!text) return "";
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  if (!text || !text.includes(':')) return text;
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption failed:", error);
    return text; // Return original if decryption fails (might be unencrypted legacy)
  }
}
