import { getDB, connectDB } from '../src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await connectDB();
  const pool = getDB();
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM maintenance_records");
    console.log("MAINTENANCE COLUMNS:");
    console.log(cols.map(c => `${c.Field} - ${c.Type}`).join('\n'));
    
    const [fuelCols] = await pool.query("SHOW COLUMNS FROM fuel_logs");
    console.log("\nFUEL COLUMNS:");
    console.log(fuelCols.map(c => `${c.Field} - ${c.Type}`).join('\n'));
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
