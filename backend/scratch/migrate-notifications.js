import { getDB, connectDB } from '../src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  await connectDB();
  const pool = getDB();
  try {
    console.log("Starting notification schema migration...");
    
    console.log("Adding type, reference_id, reference_type to notifications...");
    await pool.query(`ALTER TABLE notifications ADD COLUMN type ENUM('SYSTEM', 'EXPIRY', 'ASSIGNMENT', 'APPROVAL') NOT NULL DEFAULT 'SYSTEM' AFTER message`);
    await pool.query(`ALTER TABLE notifications ADD COLUMN reference_id BIGINT NULL AFTER type`);
    await pool.query(`ALTER TABLE notifications ADD COLUMN reference_type VARCHAR(50) NULL AFTER reference_id`);

    console.log("Migration completed successfully.");
  } catch(e) {
    console.error("Migration failed", e);
  } finally {
    pool.end();
  }
}
migrate();
