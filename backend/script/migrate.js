import "dotenv/config";
import mysql from "mysql2/promise";

async function migrate() {
  let connection;
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;
    connection = await mysql.createConnection({ uri: databaseUrl, multipleStatements: true });
    
    console.log("Applying ALTER TABLE...");
    await connection.query(`
      ALTER TABLE users
      ADD COLUMN last_login_at DATETIME NULL AFTER status,
      ADD COLUMN failed_login_attempts INT DEFAULT 0 AFTER last_login_at,
      ADD COLUMN account_locked_until DATETIME NULL AFTER failed_login_attempts,
      ADD COLUMN email_verified_at DATETIME NULL AFTER reset_token_expires_at;
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
