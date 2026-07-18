import { getDB, connectDB } from '../src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  await connectDB();
  const pool = getDB();
  try {
    console.log("Starting drivers migration...");
    
    // 1. Add missing columns
    // 2. Expand ENUM temporarily to map old values
    console.log("Expanding ENUM...");
    await pool.query(`
      ALTER TABLE drivers 
      MODIFY COLUMN status ENUM('Available', 'On Trip', 'Off Duty', 'Suspended', 'Retired', 'on_trip', 'off_duty') NOT NULL DEFAULT 'Available'
    `);
    
    // 3. Map old values to new ones
    console.log("Updating rows...");
    // available is already Available in case-insensitive MySQL
    await pool.query(`UPDATE drivers SET status = 'On Trip' WHERE status = 'on_trip'`);
    await pool.query(`UPDATE drivers SET status = 'Off Duty' WHERE status = 'off_duty'`);
    
    // 4. Shrink the ENUM to only the new values
    console.log("Restricting ENUM...");
    await pool.query(`
      ALTER TABLE drivers 
      MODIFY COLUMN status ENUM('Available', 'On Trip', 'Off Duty', 'Suspended', 'Retired') NOT NULL DEFAULT 'Available'
    `);
    
    console.log("Migration completed successfully.");
  } catch(e) {
    console.error("Migration failed", e);
  } finally {
    pool.end();
  }
}
migrate();
