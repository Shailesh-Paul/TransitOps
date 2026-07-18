import { connectDB, getDB } from "../src/config/db.js";

async function addTripId() {
  await connectDB();
  const pool = getDB();
  try {
    console.log("Adding trip_id to fuel_logs...");
    await pool.query(`ALTER TABLE fuel_logs ADD COLUMN trip_id BIGINT NULL;`);
    await pool.query(`ALTER TABLE fuel_logs ADD CONSTRAINT fk_fuel_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL;`);
    console.log("Successfully added trip_id column.");
  } catch(e) {
    console.error("Migration error:", e.message);
  } finally {
    process.exit(0);
  }
}

addTripId();
