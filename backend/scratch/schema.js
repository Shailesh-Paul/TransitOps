import { getDB, connectDB } from '../src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await connectDB();
  const pool = getDB();
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM vehicles");
    console.log("VEHICLE COLUMNS:");
    console.log(cols.map(c => `${c.Field} - ${c.Type}`).join('\n'));
    
    const [tables] = await pool.query("SHOW TABLES");
    console.log("\nTABLES:");
    console.log(tables.map(t => Object.values(t)[0]).join('\n'));
    
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
