import { connectDB, getDB } from '../src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await connectDB();
  const pool = getDB();

  const queries = [
    "ALTER TABLE maintenance_records ADD COLUMN progress TINYINT DEFAULT 0;",
    "ALTER TABLE maintenance_records ADD COLUMN technician_notes JSON;",
    "ALTER TABLE maintenance_records ADD COLUMN work_performed_checklist JSON;",
    "ALTER TABLE maintenance_records ADD COLUMN attachments JSON;",
    "ALTER TABLE maintenance_records ADD COLUMN workshop_bay VARCHAR(50);"
  ];

  for (const query of queries) {
    try {
      await pool.query(query);
      console.log(`Executed: ${query}`);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log(`Skipped (already exists): ${query}`);
      } else {
        console.error(`Failed to execute ${query}:`, e.message);
      }
    }
  }

  console.log("Migration complete!");
  process.exit(0);
}

run();
