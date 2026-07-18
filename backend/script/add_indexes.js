import "dotenv/config";
import mysql from "mysql2/promise";

async function migrate() {
  let connection;
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;
    connection = await mysql.createConnection({ uri: databaseUrl, multipleStatements: true });
    
    console.log("Adding composite indexes to trips, vehicles, and drivers...");

    // Ignore index already exists errors
    const queries = [
      "CREATE INDEX idx_trips_status_created ON trips(status, created_at)",
      "CREATE INDEX idx_trips_status_start ON trips(status, start_time)",
      "CREATE INDEX idx_vehicles_status ON vehicles(status)",
      "CREATE INDEX idx_drivers_status ON drivers(status)"
    ];

    for (let q of queries) {
      try {
        await connection.query(q);
        console.log(`Successfully ran: ${q}`);
      } catch(err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          console.log(`Index already exists: ${q}`);
        } else {
          console.error(`Error running ${q}:`, err.message);
        }
      }
    }
    
    console.log("Indexes migration completed!");
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) await connection.end();
  }
}
migrate();
