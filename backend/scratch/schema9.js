import dotenv from 'dotenv';
dotenv.config();
import { getDB, connectDB } from '../src/config/db.js';

async function check() {
  await connectDB();
  const [rows] = await getDB().query('DESCRIBE maintenance_records');
  console.table(rows);
  process.exit(0);
}
check();
