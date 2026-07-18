import "dotenv/config";
import mysql from "mysql2/promise";

async function migrate() {
  let connection;
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;
    connection = await mysql.createConnection({ uri: databaseUrl, multipleStatements: true });
    
    console.log("Applying ALTER TABLE for trips (metrics)...");
    await connection.query(`
      ALTER TABLE trips
      ADD COLUMN actual_distance DECIMAL(10,2) DEFAULT NULL,
      ADD COLUMN fuel_efficiency DECIMAL(10,2) DEFAULT NULL;
    `);
    console.log("Migration successful!");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Columns already exist.");
    } else {
      console.error(err);
    }
  } finally {
    if (connection) await connection.end();
  }
}
migrate();
