import { connectDB, getDB } from '../src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const migrate = async () => {
  try {
    await connectDB();
    const pool = getDB();

    const addColumn = async (table, colDef) => {
      try {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
        console.log(`Added column: ${colDef} to ${table}`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`Column already exists: ${colDef.split(' ')[0]} in ${table}`);
        } else {
          throw err;
        }
      }
    };

    console.log("Starting Migration...");
    
    await addColumn('maintenance_records', 'completion_summary TEXT');
    await addColumn('maintenance_records', 'root_cause VARCHAR(255)');
    await addColumn('maintenance_records', 'corrective_action TEXT');
    await addColumn('maintenance_records', 'customer_remarks TEXT');
    await addColumn('maintenance_records', 'labour_hours DECIMAL(10,2) DEFAULT 0.00');
    await addColumn('maintenance_records', 'labour_rate DECIMAL(10,2) DEFAULT 0.00');
    await addColumn('maintenance_records', 'labour_cost DECIMAL(10,2) DEFAULT 0.00');
    await addColumn('maintenance_records', 'misc_cost DECIMAL(10,2) DEFAULT 0.00');
    await addColumn('maintenance_records', 'downtime_minutes INT DEFAULT 0');

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();
