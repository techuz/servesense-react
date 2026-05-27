/**
 * Seed a manager account.
 *
 * SOW §2.1: "Super-admin will add me in system." For Phase 1 we are not building
 * a super-admin UI; managers are provisioned via this script.
 *
 * Usage:
 *   npm run seed:manager -- --email=manager@example.com --password=secret123 --name="Jane Doe"
 *   npm run seed:manager -- --email=... --password=... --name=... --phone=+919812345678
 */
import bcrypt from 'bcryptjs';
import { pool } from '../db/connection.js';
import { env } from '../config/env.js';

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(prefix));
  return found?.slice(prefix.length);
}

async function run() {
  const email = getArg('email');
  const password = getArg('password');
  const fullName = getArg('name');
  const phone = getArg('phone');

  if (!email || !password || !fullName) {
    console.error(
      'Usage: npm run seed:manager -- --email=<email> --password=<password> --name="<full name>" [--phone=<phone>]',
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

  await pool.query(
    `INSERT INTO users (email, phone, password_hash, full_name, role, status)
     VALUES (?, ?, ?, ?, 'manager', 'active')
     ON DUPLICATE KEY UPDATE
       phone = VALUES(phone),
       password_hash = VALUES(password_hash),
       full_name = VALUES(full_name),
       status = 'active'`,
    [email, phone ?? null, passwordHash, fullName],
  );

  console.log(`[seed] Manager upserted: ${email}`);
  await pool.end();
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
