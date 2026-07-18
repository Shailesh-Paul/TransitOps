import { getDB, connectDB } from '../src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  await connectDB();
  const pool = getDB();
  try {
    console.log("Starting migration...");
    
    // 1. We must temporarily allow the new enum values along with the old ones 
    // to do the UPDATE without constraint errors.
    console.log("Expanding ENUM...");
    await pool.query(`
      ALTER TABLE vehicles 
      MODIFY COLUMN status ENUM('active', 'maintenance', 'retired', 'Available', 'Reserved', 'On Trip', 'In Shop') NOT NULL DEFAULT 'Available'
    `);
    
    // 2. Map old values to new ones
    console.log("Updating rows...");
    await pool.query(`UPDATE vehicles SET status = 'Available' WHERE status = 'active'`);
    await pool.query(`UPDATE vehicles SET status = 'In Shop' WHERE status = 'maintenance'`);
    // 'retired' is already 'retired' (case insensitive), we can just leave it as 'retired' 
    // and then rename it safely by dropping 'active' and 'maintenance'
    
    // 3. Shrink the ENUM to only the new values
    console.log("Restricting ENUM...");
    await pool.query(`
      ALTER TABLE vehicles 
      MODIFY COLUMN status ENUM('Available', 'Reserved', 'On Trip', 'In Shop', 'Retired') NOT NULL DEFAULT 'Available'
    `);
    
    console.log("Migration completed successfully.");
  } catch(e) {
    console.error("Migration failed", e);
  } finally {
    pool.end();
  }
}
migrate();
