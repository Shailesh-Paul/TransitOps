import { getDB } from "../config/db.js";

class FuelAnalyticsEngine {
  /**
   * Retrieves the historical expected averages for a specific vehicle.
   * @param {number|string} vehicleId
   * @returns {Promise<{expectedEfficiency: number|null, expectedCostPerKm: number|null}>}
   */
  static async getVehicleAverages(vehicleId) {
    const pool = getDB();
    const sql = `
      SELECT 
        AVG(efficiency) as expectedEfficiency,
        SUM(cost) / NULLIF(SUM(liters * efficiency), 0) as expectedCostPerKm
      FROM fuel_logs 
      WHERE vehicle_id = ? AND deleted_at IS NULL
    `;
    const [rows] = await pool.query(sql, [vehicleId]);
    return {
      expectedEfficiency: rows[0]?.expectedEfficiency ? parseFloat(rows[0].expectedEfficiency) : null,
      expectedCostPerKm: rows[0]?.expectedCostPerKm ? parseFloat(rows[0].expectedCostPerKm) : null
    };
  }

  /**
   * Retrieves expected averages for ALL vehicles, useful for bulk processing (e.g. Dashboard Alerts).
   * @returns {Promise<Map<number|string, {expectedEfficiency: number|null, expectedCostPerKm: number|null}>>}
   */
  static async getAllVehicleAverages() {
    const pool = getDB();
    const sql = `
      SELECT 
        vehicle_id,
        AVG(efficiency) as expectedEfficiency,
        SUM(cost) / NULLIF(SUM(liters * efficiency), 0) as expectedCostPerKm
      FROM fuel_logs 
      WHERE deleted_at IS NULL
      GROUP BY vehicle_id
    `;
    const [rows] = await pool.query(sql);
    
    const map = new Map();
    for (const row of rows) {
      map.set(row.vehicle_id, {
        expectedEfficiency: row.expectedEfficiency ? parseFloat(row.expectedEfficiency) : null,
        expectedCostPerKm: row.expectedCostPerKm ? parseFloat(row.expectedCostPerKm) : null
      });
    }
    return map;
  }

  /**
   * Retrieves weighted averages for a driver across all their assigned trips.
   * Total Distance = SUM(efficiency * liters)
   * Total Fuel Consumed = SUM(liters)
   * Driver Efficiency = Total Distance / Total Fuel Consumed
   * @param {number|string} driverId
   * @returns {Promise<{driverEfficiency: number|null, driverFuelCost: number|null, totalDistance: number|null}>}
   */
  static async getDriverAverages(driverId) {
    const pool = getDB();
    const sql = `
      SELECT 
        SUM(f.liters) as totalConsumed,
        SUM(f.cost) as totalCost,
        SUM(f.efficiency * f.liters) as totalDistance
      FROM fuel_logs f
      INNER JOIN trips t ON f.trip_id = t.id
      WHERE t.driver_id = ? AND f.deleted_at IS NULL AND t.deleted_at IS NULL
    `;
    const [rows] = await pool.query(sql, [driverId]);
    const res = rows[0] || {};
    
    const totalConsumed = parseFloat(res.totalConsumed || 0);
    const totalCost = parseFloat(res.totalCost || 0);
    const totalDistance = parseFloat(res.totalDistance || 0);

    const driverEfficiency = totalConsumed > 0 ? (totalDistance / totalConsumed) : null;
    const driverCostPerKm = totalDistance > 0 ? (totalCost / totalDistance) : null;

    return {
      driverEfficiency,
      driverCostPerKm,
      driverFuelCost: totalCost,
      totalDistance
    };
  }

  /**
   * Retrieves the total fuel cost and consumption for a specific trip.
   * @param {number|string} tripId
   * @returns {Promise<{totalCost: number, totalLiters: number}>}
   */
  static async getTripFuelCost(tripId) {
    const pool = getDB();
    const sql = `
      SELECT SUM(cost) as totalCost, SUM(liters) as totalLiters
      FROM fuel_logs 
      WHERE trip_id = ? AND deleted_at IS NULL
    `;
    const [rows] = await pool.query(sql, [tripId]);
    return {
      totalCost: parseFloat(rows[0]?.totalCost || 0),
      totalLiters: parseFloat(rows[0]?.totalLiters || 0)
    };
  }

  /**
   * Retrieves fleet-wide averages.
   * @returns {Promise<{fleetEfficiency: number|null, fleetCostPerKm: number|null}>}
   */
  static async getFleetAverages() {
    const pool = getDB();
    const sql = `
      SELECT 
        SUM(liters) as totalLiters,
        SUM(cost) as totalCost,
        SUM(efficiency * liters) as totalDistance
      FROM fuel_logs 
      WHERE deleted_at IS NULL
    `;
    const [rows] = await pool.query(sql);
    const res = rows[0] || {};
    
    const totalLiters = parseFloat(res.totalLiters || 0);
    const totalCost = parseFloat(res.totalCost || 0);
    const totalDistance = parseFloat(res.totalDistance || 0);

    return {
      fleetEfficiency: totalLiters > 0 ? (totalDistance / totalLiters) : null,
      fleetCostPerKm: totalDistance > 0 ? (totalCost / totalDistance) : null
    };
  }

  /**
   * Generates a monthly summary based on arbitrary dynamic filters.
   * @param {Object} filters - e.g. { vehicle_id, startDate, endDate }
   */
  static async getMonthlyAnalytics(filters = {}) {
    const pool = getDB();
    let whereClauses = ["deleted_at IS NULL"];
    let params = [];

    if (filters.startDate && filters.endDate) {
      whereClauses.push("date BETWEEN ? AND ?");
      params.push(filters.startDate, filters.endDate);
    } else if (filters.month) {
      // filters.month format: YYYY-MM
      whereClauses.push("DATE_FORMAT(date, '%Y-%m') = ?");
      params.push(filters.month);
    } else {
      // Default to current month
      const currentMonth = new Date().toISOString().substring(0, 7);
      whereClauses.push("DATE_FORMAT(date, '%Y-%m') = ?");
      params.push(currentMonth);
    }

    if (filters.vehicle_id) {
      whereClauses.push("vehicle_id = ?");
      params.push(filters.vehicle_id);
    }

    const whereString = `WHERE ${whereClauses.join(" AND ")}`;
    
    const sql = `
      SELECT 
        COUNT(id) as totalEntries,
        SUM(liters) as totalConsumed,
        SUM(cost) as totalCost,
        SUM(efficiency * liters) as totalDistance
      FROM fuel_logs 
      ${whereString}
    `;

    const [rows] = await pool.query(sql, params);
    const res = rows[0] || {};

    const totalConsumed = parseFloat(res.totalConsumed || 0);
    const totalCost = parseFloat(res.totalCost || 0);
    const totalDistance = parseFloat(res.totalDistance || 0);

    return {
      totalEntries: parseInt(res.totalEntries || 0, 10),
      totalConsumed,
      totalCost,
      avgEfficiency: totalConsumed > 0 ? (totalDistance / totalConsumed) : null,
      avgCostPerKm: totalDistance > 0 ? (totalCost / totalDistance) : null
    };
  }

  /**
   * Retrieve rolling averages (Last X days).
   * @param {number} days - e.g., 30, 90, 365
   */
  static async getRollingAverages(days, vehicleId = null) {
    const pool = getDB();
    let whereClause = "WHERE deleted_at IS NULL AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)";
    const params = [days];

    if (vehicleId) {
      whereClause += " AND vehicle_id = ?";
      params.push(vehicleId);
    }

    const sql = `
      SELECT 
        SUM(liters) as totalConsumed,
        SUM(cost) as totalCost,
        SUM(efficiency * liters) as totalDistance
      FROM fuel_logs 
      ${whereClause}
    `;

    const [rows] = await pool.query(sql, params);
    const res = rows[0] || {};
    
    const totalConsumed = parseFloat(res.totalConsumed || 0);
    const totalCost = parseFloat(res.totalCost || 0);
    const totalDistance = parseFloat(res.totalDistance || 0);

    return {
      days,
      totalConsumed,
      totalCost,
      avgEfficiency: totalConsumed > 0 ? (totalDistance / totalConsumed) : null,
      avgCostPerKm: totalDistance > 0 ? (totalCost / totalDistance) : null
    };
  }

  /**
   * Gets vehicle comparison: Current Month vs Historical Average
   */
  static async getVehicleComparison(vehicleId) {
    const historical = await this.getVehicleAverages(vehicleId);
    const currentMonth = await this.getMonthlyAnalytics({ vehicle_id: vehicleId });
    return {
      current: currentMonth,
      historical: historical
    };
  }

  /**
   * Gets Fleet comparison: Current Month vs Previous Month
   */
  static async getFleetComparison() {
    const today = new Date();
    const currentMonthStr = today.toISOString().substring(0, 7);
    
    // Calculate previous month string
    today.setMonth(today.getMonth() - 1);
    const previousMonthStr = today.toISOString().substring(0, 7);

    const currentMonth = await this.getMonthlyAnalytics({ month: currentMonthStr });
    const previousMonth = await this.getMonthlyAnalytics({ month: previousMonthStr });

    return {
      currentMonth,
      previousMonth
    };
  }
}

export default FuelAnalyticsEngine;
