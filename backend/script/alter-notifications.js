import { connectDB, getDB } from '../src/config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  console.log("Fixing notification schema...");
  
  try {
    await connectDB();
    const pool = getDB();
    const connection = await pool.getConnection();
    console.log("Connected to database successfully.");

    const [columns] = await connection.query(`SHOW COLUMNS FROM notifications`);
    const columnNames = columns.map(c => c.Field);
    console.log("Columns:", columnNames);

    if (!columnNames.includes('is_read')) {
      console.log("Adding is_read...");
      await connection.query(`ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE`);
    }

    try {
      await connection.query(`CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read)`);
      console.log("Added idx_notifications_user_read index.");
    } catch (e) {
      if (e.code === 'ER_DUP_KEYNAME') {
        console.log("Index idx_notifications_user_read already exists.");
      } else {
        console.log("Could not create index:", e.message);
      }
    }

    connection.release();
    console.log("Notification migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
