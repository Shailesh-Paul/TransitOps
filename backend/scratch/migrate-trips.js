import { getDB, connectDB } from '../src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  await connectDB();
  const pool = getDB();
  try {
    console.log("Starting trips migration...");
    
    console.log("Making foreign keys nullable...");
    await pool.query(`ALTER TABLE trips MODIFY COLUMN vehicle_id BIGINT NULL`);
    await pool.query(`ALTER TABLE trips MODIFY COLUMN driver_id BIGINT NULL`);
    
    // Expand ENUM temporarily to map old values
    console.log("Expanding ENUM...");
    await pool.query(`
      ALTER TABLE trips 
      MODIFY COLUMN status ENUM('Draft', 'Assigned', 'Dispatched', 'In Progress', 'Completed', 'Cancelled', 'scheduled', 'in_progress') NOT NULL DEFAULT 'Draft'
    `);
    
    // Map old values to new ones
    console.log("Updating rows...");
    await pool.query(`UPDATE trips SET status = 'Assigned' WHERE status = 'scheduled'`);
    await pool.query(`UPDATE trips SET status = 'In Progress' WHERE status = 'in_progress'`);
    
    // Shrink the ENUM to only the new values
    console.log("Restricting ENUM...");
    await pool.query(`
      ALTER TABLE trips 
      MODIFY COLUMN status ENUM('Draft', 'Assigned', 'Dispatched', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Draft'
    `);
    
    console.log("Migration completed successfully.");
  } catch(e) {
    console.error("Migration failed", e);
  } finally {
    pool.end();
  }
}
migrate();
