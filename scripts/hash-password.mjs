// Usage: pnpm admin:hash "my strong password"
// Prints a value for ADMIN_PASSWORD_HASH (scrypt, no "$" so .env files keep it intact).
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Usage: pnpm admin:hash "password of 10+ characters"');
  process.exit(1);
}
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
console.log(`scrypt:${salt.toString("hex")}:${hash.toString("hex")}`);
