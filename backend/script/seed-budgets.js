import { connectDB, getDB } from '../src/config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function seed() {
  console.log("Seeding budgets...");
  
  try {
    await connectDB();
    const pool = getDB();
    const connection = await pool.getConnection();

    const yr = new Date().getFullYear().toString();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const periodValue = `${yr}-${month}`;

    const budgets = [
      ['department', '1', 'monthly', periodValue, 50000.00], // HR
      ['department', '2', 'monthly', periodValue, 120000.00], // Operations
      ['department', '3', 'monthly', periodValue, 80000.00], // Maintenance
      ['department', '4', 'monthly', periodValue, 150000.00], // Fleet Management
      ['company', 'ALL', 'yearly', yr, 5000000.00]
    ];

    for (const b of budgets) {
      await connection.query(
        `INSERT IGNORE INTO budgets (entity_type, entity_id, period_type, period_value, amount) VALUES (?, ?, ?, ?, ?)`,
        b
      );
    }
    
    console.log("Budgets seeded.");
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
