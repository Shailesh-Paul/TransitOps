import { connectDB, getDB } from '../src/config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  console.log("Creating budgets schema...");
  
  try {
    await connectDB();
    const pool = getDB();
    const connection = await pool.getConnection();
    console.log("Connected to database successfully.");

    // Create budgets table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS budgets (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          entity_type ENUM('department', 'cost_center', 'vehicle', 'company') NOT NULL,
          entity_id VARCHAR(100) NOT NULL,
          period_type ENUM('monthly', 'quarterly', 'yearly') NOT NULL,
          period_value VARCHAR(20) NOT NULL, -- e.g., '2026-07' or '2026'
          amount DECIMAL(15,2) NOT NULL,
          currency VARCHAR(10) DEFAULT 'INR',
          status ENUM('Active', 'Closed', 'Draft') DEFAULT 'Active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          created_by BIGINT,
          UNIQUE KEY uk_budget (entity_type, entity_id, period_type, period_value)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createTableQuery);
    console.log("Budgets table created or already exists.");

    connection.release();
    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
