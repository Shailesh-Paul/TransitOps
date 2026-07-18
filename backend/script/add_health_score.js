import "dotenv/config";
import mysql from "mysql2/promise";

async function migrate() {
  let connection;
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;
    connection = await mysql.createConnection({ uri: databaseUrl, multipleStatements: true });
    
    console.log("Applying ALTER TABLE to add health_score to vehicles...");
    await connection.query(`
      ALTER TABLE vehicles
      ADD COLUMN health_score INT DEFAULT 100 AFTER current_odometer;
    `);
    console.log("Migration successful! health_score added to vehicles.");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Column health_score already exists.");
    } else {
      console.error(err);
    }
  } finally {
    if (connection) await connection.end();
  }
}
migrate();
