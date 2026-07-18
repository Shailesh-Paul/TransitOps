import { getDB, connectDB } from '../src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await connectDB();
  const pool = getDB();
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM audit_logs");
    console.log("AUDIT_LOGS COLUMNS:");
    console.log(cols.map(c => `${c.Field} - ${c.Type}`).join('\n'));
    
    const [tripCols] = await pool.query("SHOW COLUMNS FROM trips");
    console.log("\nTRIPS COLUMNS:");
    console.log(tripCols.map(c => `${c.Field} - ${c.Type}`).join('\n'));
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
