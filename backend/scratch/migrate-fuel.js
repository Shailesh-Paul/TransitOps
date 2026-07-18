import { getDB, connectDB } from '../src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  await connectDB();
  const pool = getDB();
  try {
    console.log("Starting fuel schema migration...");
    
    // Add mileage to vehicles
    console.log("Adding mileage to vehicles...");
    await pool.query(`ALTER TABLE vehicles ADD COLUMN mileage DECIMAL(10,2) NOT NULL DEFAULT 0.00`);
    
    // Add odometer and efficiency to fuel_logs
    console.log("Adding odometer_reading and efficiency to fuel_logs...");
    await pool.query(`ALTER TABLE fuel_logs ADD COLUMN odometer_reading DECIMAL(10,2) NOT NULL`);
    await pool.query(`ALTER TABLE fuel_logs ADD COLUMN efficiency DECIMAL(10,2) NULL`);

    console.log("Migration completed successfully.");
  } catch(e) {
    console.error("Migration failed", e);
  } finally {
    pool.end();
  }
}
migrate();
