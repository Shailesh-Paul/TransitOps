import BaseRepository from "../../core/BaseRepository.js";

class FuelRepository extends BaseRepository {
  constructor() {
    super("fuel_logs");
  }

  async findAllWithDetails({ page = 1, limit = 10, vehicle_id = null, startDate, endDate, fuelType, station, search, driver_id } = {}) {
    const offset = (page - 1) * limit;
    const queryParams = [];
    const whereClauses = ["f.deleted_at IS NULL"];

    if (vehicle_id) {
      whereClauses.push("f.vehicle_id = ?");
      queryParams.push(vehicle_id);
    }
    
    if (startDate && endDate) {
      whereClauses.push("f.date BETWEEN ? AND ?");
      queryParams.push(startDate, endDate);
    }
    
    if (fuelType) {
      whereClauses.push("f.fuel_type = ?");
      queryParams.push(fuelType);
    }
    
    if (station) {
      whereClauses.push("f.station LIKE ?");
      queryParams.push(`%${station}%`);
    }
    
    if (driver_id) {
      whereClauses.push("t.driver_id = ?");
      queryParams.push(driver_id);
    }

    if (search) {
      whereClauses.push("(v.registration_number LIKE ? OR f.station LIKE ? OR e.first_name LIKE ? OR e.last_name LIKE ?)");
      const searchStr = `%${search}%`;
      queryParams.push(searchStr, searchStr, searchStr, searchStr);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const dataSql = `
      SELECT f.*, 
             v.registration_number as vehicleName,
             t.id as tripId,
             CONCAT(e.first_name, ' ', e.last_name) as driverName
      FROM fuel_logs f 
      LEFT JOIN vehicles v ON f.vehicle_id = v.id 
      LEFT JOIN trips t ON f.trip_id = t.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      LEFT JOIN employees e ON d.employee_id = e.id
      ${whereString}
      ORDER BY f.date DESC 
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(f.id) as total 
      FROM fuel_logs f 
      LEFT JOIN vehicles v ON f.vehicle_id = v.id 
      LEFT JOIN trips t ON f.trip_id = t.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      LEFT JOIN employees e ON d.employee_id = e.id
      ${whereString}
    `;

    const [[dataRows], [countRows]] = await Promise.all([
      this.pool.query(dataSql, [...queryParams, Number(limit), Number(offset)]),
      this.pool.query(countSql, queryParams),
    ]);

    const total = countRows[0].total;

    return {
      data: dataRows,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMonthlyAnalytics(vehicleId) {
    const sql = `
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(liters) as total_liters,
        SUM(cost) as total_cost,
        AVG(efficiency) as average_efficiency_km_per_liter
      FROM fuel_logs
      WHERE vehicle_id = ? AND deleted_at IS NULL
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `;
    const [rows] = await this.pool.query(sql, [vehicleId]);
    return rows;
  }

  async getDetailedLogById(id) {
    // 1. Fetch base log + vehicle info + creator/updater
    const sql = `
      SELECT f.*, 
             v.registration_number as vehicleName, v.make, v.model, v.status as vehicleStatus,
             t.status as tripStatus,
             c.name as creatorName, u.name as updaterName
      FROM fuel_logs f
      LEFT JOIN vehicles v ON f.vehicle_id = v.id
      LEFT JOIN trips t ON f.trip_id = t.id
      LEFT JOIN users c ON f.created_by = c.id
      LEFT JOIN users u ON f.updated_by = u.id
      WHERE f.id = ? AND f.deleted_at IS NULL
    `;
    const [rows] = await this.pool.query(sql, [id]);
    const log = rows[0];

    if (!log) return null;

    // 2. Fetch Previous Log
    const [prevRows] = await this.pool.query(
      `SELECT id, date, odometer_reading FROM fuel_logs 
       WHERE vehicle_id = ? AND date < ? AND deleted_at IS NULL 
       ORDER BY date DESC LIMIT 1`,
      [log.vehicle_id, log.date]
    );

    // 3. Fetch Next Log
    const [nextRows] = await this.pool.query(
      `SELECT id, date, odometer_reading FROM fuel_logs 
       WHERE vehicle_id = ? AND date > ? AND deleted_at IS NULL 
       ORDER BY date ASC LIMIT 1`,
      [log.vehicle_id, log.date]
    );

    // 4. Fetch Vehicle Baselines (for alerts)
    const [baselineRows] = await this.pool.query(
      `SELECT AVG(efficiency) as expectedEfficiency, AVG(cost / (liters * efficiency)) as expectedCostPerKm
       FROM fuel_logs WHERE vehicle_id = ? AND deleted_at IS NULL`,
      [log.vehicle_id]
    );

    log.previous_log = prevRows[0] || null;
    log.next_log = nextRows[0] || null;
    log.baselines = baselineRows[0] || { expectedEfficiency: null, expectedCostPerKm: null };

    return log;
  }
}

export default new FuelRepository();
