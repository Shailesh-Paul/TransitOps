import dotenv from 'dotenv';
dotenv.config();
import { getDB, connectDB } from '../src/config/db.js';

async function check() {
  await connectDB();
  const [rows] = await getDB().query('SHOW TABLES');
  console.log(rows);
  process.exit(0);
}
check();
