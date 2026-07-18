import "dotenv/config";
import mysql from "mysql2/promise";

async function migrateExpenses() {
  let connection;
  try {
    console.log("🚀 Connecting to database for migration...");
    const databaseUrl =
      process.env.DATABASE_URL ||
      process.env.MYSQL_PUBLIC_URL ||
      process.env.MYSQL_URL;

    if (databaseUrl) {
      connection = await mysql.createConnection({
        uri: databaseUrl,
        multipleStatements: true,
      });
    } else {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true,
      });
    }

    console.log("✅ Connected successfully.");

    await connection.beginTransaction();

    // 1. Add new columns
    const addCols = `
      ALTER TABLE expenses 
      ADD COLUMN expense_id VARCHAR(100) UNIQUE AFTER id,
      ADD COLUMN accounting_reference VARCHAR(100) UNIQUE AFTER expense_id,
      ADD COLUMN source_reference VARCHAR(100) AFTER accounting_reference,
      ADD COLUMN source_module VARCHAR(50) AFTER source_reference,
      ADD COLUMN source_record_id BIGINT AFTER source_module,
      ADD COLUMN cost_center_id VARCHAR(100) AFTER category,
      ADD COLUMN vendor VARCHAR(150) AFTER trip_id,
      ADD COLUMN tax DECIMAL(10,2) DEFAULT 0.00 AFTER amount,
      ADD COLUMN currency VARCHAR(10) DEFAULT 'INR' AFTER tax,
      ADD COLUMN payment_method VARCHAR(50) AFTER currency,
      ADD COLUMN invoice_number VARCHAR(100) AFTER payment_method,
      ADD COLUMN receipt_status ENUM('Pending', 'Verified', 'Rejected', 'Missing') DEFAULT 'Pending' AFTER invoice_number,
      ADD COLUMN approved_by BIGINT AFTER created_by,
      ADD COLUMN posted_by BIGINT AFTER approved_by;
    `;
    
    // Ignore errors if columns already exist
    try {
      await connection.query(addCols);
      console.log("✅ Columns added.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("⚠️ Columns already exist. Skipping add.");
      } else {
        throw e;
      }
    }

    // 2. Modify ENUM status
    // To do this safely without losing data in a strict ENUM transition, we can alter the ENUM to include both old and new.
    // Wait, the old statuses were 'pending', 'cleared', 'rejected'. The new are 'Draft', 'Pending Approval', 'Approved', 'Posted', 'Archived', 'Rejected'.
    // Let's change the column to a temporary VARCHAR or expanded ENUM, update data, then shrink ENUM.
    
    const expandEnum = `
      ALTER TABLE expenses MODIFY status VARCHAR(50) DEFAULT 'Draft';
    `;
    await connection.query(expandEnum);
    console.log("✅ Expanded status to VARCHAR temporarily.");

    // 3. Migrate existing status data
    // 'pending' -> 'Pending Approval'
    // 'cleared' -> 'Posted'
    // 'rejected' -> 'Rejected'
    const updateData = `
      UPDATE expenses SET status = 'Pending Approval' WHERE status = 'pending';
      UPDATE expenses SET status = 'Posted' WHERE status = 'cleared';
      UPDATE expenses SET status = 'Rejected' WHERE status = 'rejected';
      
      -- For older rows missing source_module, let's tag them
      UPDATE expenses SET source_module = 'Manual' WHERE source_module IS NULL;
    `;
    await connection.query(updateData);
    console.log("✅ Data migrated.");

    // 4. Shrink ENUM to strict set
    const shrinkEnum = `
      ALTER TABLE expenses MODIFY status ENUM('Draft', 'Pending Approval', 'Approved', 'Posted', 'Archived', 'Rejected') DEFAULT 'Draft';
    `;
    await connection.query(shrinkEnum);
    console.log("✅ ENUM strictly enforced.");

    // 5. Generate missing IDs for old rows
    const [rows] = await connection.query('SELECT id FROM expenses WHERE expense_id IS NULL OR accounting_reference IS NULL');
    if (rows.length > 0) {
      console.log(`migrating ${rows.length} existing rows to have unique references...`);
      for (const row of rows) {
        const yr = new Date().getFullYear();
        const expId = `EXP-${yr}-${String(row.id).padStart(6, '0')}`;
        const accId = `ACC-${yr}-${String(row.id).padStart(6, '0')}`;
        await connection.query('UPDATE expenses SET expense_id = ?, accounting_reference = ? WHERE id = ?', [expId, accId, row.id]);
      }
    }
    console.log("✅ Backwards compatibility IDs generated.");

    // 6. Add Indexes safely
    const addIndexes = `
      ALTER TABLE expenses
      ADD INDEX idx_expenses_status (status),
      ADD INDEX idx_expenses_source_module (source_module),
      ADD INDEX idx_expenses_created_at (created_at),
      ADD INDEX idx_expenses_vehicle_id (vehicle_id),
      ADD INDEX idx_expenses_cost_center_id (cost_center_id),
      ADD INDEX idx_expenses_accounting_reference (accounting_reference);
    `;
    try {
      await connection.query(addIndexes);
      console.log("✅ Indexes created.");
    } catch (e) {
      if (e.code === 'ER_DUP_KEYNAME') {
         console.log("⚠️ Indexes already exist. Skipping.");
      } else {
         throw e;
      }
    }

    // 7. Add foreign keys for new users safely
    const addFks = `
      ALTER TABLE expenses
      ADD CONSTRAINT fk_exp_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
      ADD CONSTRAINT fk_exp_posted_by FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL;
    `;
    try {
      await connection.query(addFks);
      console.log("✅ Foreign Keys created.");
    } catch (e) {
      // Ignored if they exist
    }

    await connection.commit();
    console.log("🎉 Migration completed successfully!");

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ Migration failed!");
    console.error(err);
  } finally {
    if (connection) {
       await connection.end();
    }
  }
}

migrateExpenses();
