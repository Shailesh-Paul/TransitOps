import { getDB, connectDB } from '../src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  await connectDB();
  const pool = getDB();
  try {
    console.log("Starting expense schema migration...");
    
    // Add trip_id
    console.log("Adding trip_id to expenses...");
    await pool.query(`ALTER TABLE expenses ADD COLUMN trip_id BIGINT NULL AFTER driver_id`);

    // Clean up category data before enforcing ENUM
    console.log("Cleaning up category data...");
    await pool.query(`UPDATE expenses SET category = 'Miscellaneous' WHERE category NOT IN ('Maintenance', 'Toll', 'Parking', 'Insurance')`);

    // Enforce Category ENUM
    console.log("Enforcing category ENUM...");
    await pool.query(`ALTER TABLE expenses MODIFY COLUMN category ENUM('Maintenance', 'Toll', 'Parking', 'Insurance', 'Miscellaneous') NOT NULL DEFAULT 'Miscellaneous'`);

    // Clean up status data before enforcing ENUM
    console.log("Cleaning up status data...");
    await pool.query(`UPDATE expenses SET status = 'Pending' WHERE status = 'pending'`);
    await pool.query(`UPDATE expenses SET status = 'Cleared' WHERE status = 'cleared'`);
    await pool.query(`UPDATE expenses SET status = 'Rejected' WHERE status = 'rejected'`);

    // Enforce Status ENUM
    console.log("Enforcing status ENUM...");
    await pool.query(`ALTER TABLE expenses MODIFY COLUMN status ENUM('Pending', 'Cleared', 'Rejected') NOT NULL DEFAULT 'Pending'`);

    console.log("Migration completed successfully.");
  } catch(e) {
    console.error("Migration failed", e);
  } finally {
    pool.end();
  }
}
migrate();
