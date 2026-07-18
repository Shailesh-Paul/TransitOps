import "dotenv/config";
import mysql from "mysql2/promise";

async function migrate() {
  let connection;
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;
    connection = await mysql.createConnection({ uri: databaseUrl, multipleStatements: true });
    
    console.log("Applying ALTER TABLE for maintenance_records...");
    
    const queries = [
      "ALTER TABLE maintenance_records MODIFY COLUMN status VARCHAR(100) DEFAULT 'Scheduled';"
    ];

    for (let q of queries) {
      try {
        await connection.query(q);
        console.log("Success: ", q);
      } catch (e) {
        console.log("Error on: ", q, e.message);
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
