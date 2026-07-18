import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from '../src/config/db.js';
import { runExpiryScanner } from '../src/jobs/expiryScanner.js';

async function run() {
  await connectDB();
  await runExpiryScanner();
  process.exit(0);
}
run();
