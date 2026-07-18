import "dotenv/config";
import mysql from "mysql2/promise";

async function migrate() {
  let connection;
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;
    connection = await mysql.createConnection({ uri: databaseUrl, multipleStatements: true });
    
    console.log("Applying ALTER TABLE for maintenance_records...");
    
    const queries = [
      "ALTER TABLE maintenance_records MODIFY COLUMN type VARCHAR(100) NOT NULL;",
      "ALTER TABLE maintenance_records MODIFY COLUMN status ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'overdue') DEFAULT 'scheduled';",
      "ALTER TABLE maintenance_records ADD COLUMN work_order_number VARCHAR(50) UNIQUE AFTER id;",
      "ALTER TABLE maintenance_records ADD COLUMN category VARCHAR(50) AFTER type;",
      "ALTER TABLE maintenance_records ADD COLUMN priority VARCHAR(20) DEFAULT 'Medium' AFTER category;",
      "ALTER TABLE maintenance_records ADD COLUMN trigger_type VARCHAR(50) AFTER priority;",
      "ALTER TABLE maintenance_records ADD COLUMN scheduled_date DATE AFTER trigger_type;",
      "ALTER TABLE maintenance_records ADD COLUMN expected_completion_date DATE AFTER scheduled_date;"
    ];

    for (let q of queries) {
      try {
        await connection.query(q);
        console.log("Success: ", q);
      } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
           console.log("Column already exists for: ", q);
        } else {
           console.log("Error on: ", q, e.message);
        }
      }
    }
    
    console.log("Migration successful!");
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) await connection.end();
  }
}
migrate();
