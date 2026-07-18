import dotenv from 'dotenv';
dotenv.config();
import { connectDB, getDB } from '../src/config/db.js';
import { runExpiryScanner } from '../src/jobs/expiryScanner.js';

async function run() {
  await connectDB();
  const pool = getDB();

  console.log("Setting a driver's license to exactly 30 days from now...");
  await pool.query(`UPDATE drivers SET license_expiry = DATE_ADD(CURDATE(), INTERVAL 30 DAY) LIMIT 1`);

  console.log("Running Scanner (First Pass) - Should send notification...");
  await runExpiryScanner();

  console.log("Running Scanner (Second Pass) - Should SKIP notification due to deduplication...");
  await runExpiryScanner();

  console.log("Checking DB for duplicate notifications...");
  const [rows] = await pool.query(`SELECT id, title, type FROM notifications WHERE title LIKE '%30 Days%'`);
  console.log("Found:", rows.length, "notifications.");

  process.exit(0);
}
run();
