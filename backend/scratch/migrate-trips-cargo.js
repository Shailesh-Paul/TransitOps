import { getDB, connectDB } from '../src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  await connectDB();
  const pool = getDB();
  try {
    console.log("Starting trips cargo_weight migration...");
    await pool.query(`ALTER TABLE trips ADD COLUMN cargo_weight DECIMAL(10,2) NULL AFTER notes`);
    console.log("Migration completed successfully.");
  } catch(e) {
    console.error("Migration failed", e);
  } finally {
    pool.end();
  }
}
migrate();
