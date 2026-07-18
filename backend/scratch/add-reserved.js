import dotenv from 'dotenv';
dotenv.config();
import { getDB, connectDB } from '../src/config/db.js';

async function update() {
  await connectDB();
  await getDB().query("ALTER TABLE drivers MODIFY COLUMN status ENUM('Available', 'Reserved', 'On Trip', 'Off Duty', 'Suspended', 'Retired') NOT NULL DEFAULT 'Available'");
  console.log("Updated enum");
  process.exit(0);
}
update();
