import "dotenv/config";
import mysql from "mysql2/promise";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  let connection;

  try {
    console.log("🚀 Connecting to MySQL...");

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

    // Read SQL files
    const schemaPath = path.join(__dirname, "../database/schema.sql");
    const seedPath = path.join(__dirname, "../database/seed.sql");

    const schemaSQL = await fs.readFile(schemaPath, "utf8");
    const seedSQL = await fs.readFile(seedPath, "utf8");

    console.log("📦 Executing schema.sql...");

    // Enable execution of multiple SQL statements
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    await connection.query(schemaSQL);
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ Schema created.");

    console.log("🌱 Executing seed.sql...");

    await connection.query(seedSQL);

    console.log("✅ Seed data inserted.");
    console.log("🎉 Database initialized successfully.");
  } catch (error) {
    console.error("\n❌ Database initialization failed.\n");
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔒 Connection closed.");
    }
  }
}

initializeDatabase();