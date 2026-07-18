import { getDB, connectDB } from '../src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  await connectDB();
  const pool = getDB();
  try {
    console.log("Starting maintenance migration...");
    
    console.log("Adding priority and parts... (already added)");
    
    // Expand ENUM temporarily to map old values
    console.log("Expanding ENUM...");
    await pool.query(`
      ALTER TABLE maintenance_records 
      MODIFY COLUMN status ENUM('Requested', 'Queued', 'In Progress', 'Completed', 'Cancelled', 'scheduled', 'in_progress') NOT NULL DEFAULT 'Requested'
    `);
    
    // Map old values to new ones
    console.log("Updating rows...");
    await pool.query(`UPDATE maintenance_records SET status = 'Queued' WHERE status = 'scheduled'`);
    await pool.query(`UPDATE maintenance_records SET status = 'In Progress' WHERE status = 'in_progress'`);
    
    // Shrink the ENUM to only the new values
    console.log("Restricting ENUM...");
    await pool.query(`
      ALTER TABLE maintenance_records 
      MODIFY COLUMN status ENUM('Requested', 'Queued', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Requested'
    `);
    
    console.log("Migration completed successfully.");
  } catch(e) {
    console.error("Migration failed", e);
  } finally {
    pool.end();
  }
}
migrate();
