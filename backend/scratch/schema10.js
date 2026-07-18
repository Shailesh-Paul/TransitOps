import dotenv from 'dotenv';
dotenv.config();
import { getDB, connectDB } from '../src/config/db.js';

async function check() {
  await connectDB();
  console.log("=== FUEL LOGS ===");
  const [rows] = await getDB().query('DESCRIBE fuel_logs');
  console.table(rows);
  
  console.log("=== VEHICLES ===");
  const [rows2] = await getDB().query('DESCRIBE vehicles');
  console.table(rows2);
  
  process.exit(0);
}
check();
