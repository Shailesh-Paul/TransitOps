import "dotenv/config";
import mysql from "mysql2/promise";

async function checkSchema() {
  const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;
  const connection = await mysql.createConnection({ uri: databaseUrl });
  const [rows] = await connection.query("DESCRIBE trips");
  console.log(rows.map(r => r.Field).join(", "));
  await connection.end();
}
checkSchema();
