import { getDB } from "../config/db.js";

class VehicleHealthEngine {
  /**
   * Recalculates the health score for a specific vehicle and updates the database.
   * This is triggered by business events (maintenance completion, breakdown, etc).
   * 
   * Score formula (Base 100):
   * - Recent breakdowns (Critical/High) in last 6 months: -5 each
   * - High average downtime (>48h): -10
   * - Vehicle age > 5 years: -5
   * 
   * @param {number} vehicleId 
   */
  static async recalculateScore(vehicleId, connection = null) {
    const pool = connection || getDB();
    
    try {
      // 1. Get Vehicle details
      const [vehicleRows] = await pool.query('SELECT created_at FROM vehicles WHERE id = ?', [vehicleId]);
      if (vehicleRows.length === 0) return;
      const vehicle = vehicleRows[0];

      let score = 100;

      // 2. Check for recent critical/high breakdowns in the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const [breakdowns] = await pool.query(`
        SELECT COUNT(*) as count 
        FROM maintenance_records 
        WHERE vehicle_id = ? 
          AND status = 'Completed' 
          AND priority IN ('Critical', 'High')
          AND end_date >= ?
      `, [vehicleId, sixMonthsAgo]);

      const breakdownCount = breakdowns[0]?.count || 0;
      score -= (breakdownCount * 5);

      // 3. Check for high average downtime
      const [downtimeStats] = await pool.query(`
        SELECT AVG(downtime_minutes) as avg_downtime 
        FROM maintenance_records 
        WHERE vehicle_id = ? 
          AND status = 'Completed'
      `, [vehicleId]);
      
      const avgDowntimeMinutes = downtimeStats[0]?.avg_downtime || 0;
      if (avgDowntimeMinutes > (48 * 60)) { // 48 hours
        score -= 10;
      } else if (avgDowntimeMinutes > (24 * 60)) { // 24 hours
        score -= 5;
      }

      // 4. Age deduction
      const vehicleAgeMs = new Date() - new Date(vehicle.created_at);
      const vehicleAgeYears = vehicleAgeMs / (1000 * 60 * 60 * 24 * 365.25);
      if (vehicleAgeYears > 5) {
        score -= 5;
      }

      // Bound score between 0 and 100
      if (score < 0) score = 0;
      if (score > 100) score = 100;

      // 5. Persist the score
      await pool.query('UPDATE vehicles SET health_score = ? WHERE id = ?', [score, vehicleId]);

      return score;
    } catch (err) {
      console.error(`Failed to recalculate health score for vehicle ${vehicleId}`, err);
      // We don't throw to prevent blocking the main business transaction (e.g. completing maintenance)
    }
  }
}

export default VehicleHealthEngine;
