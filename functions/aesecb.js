import crypto from 'crypto';

/* AES-ECB encrypt decrypt functions

ECB is a block cipher with symmetric key without iv
It's the weakest AES mode, so it's not recommended for secure uses 
but it is just convenient for qrcode obfuscation 
as it produces a shorter ciphertext */

/* generate a strong key from a secret */
const KEY_ITERATIONS = 256;
const KEY_SIZE = 128;
const ALGORITHM = 'AES-128-ECB';

const secret = process.env.QRCODE_SECRET;
if (!secret) throw new Error("environment not set"); //("QRCODE_SECRET environment variable not set.");
let key = crypto.pbkdf2Sync(secret, '', KEY_ITERATIONS, KEY_SIZE / 8, "sha256");

// the public functions
export function encrypt(str) {
  const cipher = crypto.createCipheriv(ALGORITHM, key, null);
  return Buffer.concat([cipher.update(Buffer.from(str, 'utf8')), cipher.final()]).toString('base64');
}

export function decrypt(str) {
  const decipher = crypto.createDecipheriv(ALGORITHM, key, null);
  return Buffer.concat([decipher.update(Buffer.from(str, 'base64')), decipher.final()]).toString('utf8');
}

