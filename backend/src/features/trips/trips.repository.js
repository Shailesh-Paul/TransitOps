import BaseRepository from "../../core/BaseRepository.js";

class TripRepository extends BaseRepository {
  constructor() {
    super("trips");
  }

  /**
   * Overrides standard findAll to inject human-readable JOINs
   * for Routes, Vehicles, and Drivers.
   */
  async findAllWithDetails({ page = 1, limit = 10, status = null, search = "", vehicle_id = null, driver_id = null, startDate = null, endDate = null } = {}) {
    const offset = (page - 1) * limit;
    const queryParams = [];
    let whereClauses = [];

    if (status) {
      whereClauses.push("t.status = ?");
      queryParams.push(status);
    }
    if (vehicle_id) {
      whereClauses.push("t.vehicle_id = ?");
      queryParams.push(vehicle_id);
    }
    if (driver_id) {
      whereClauses.push("t.driver_id = ?");
      queryParams.push(driver_id);
    }
    if (startDate) {
      whereClauses.push("t.created_at >= ?");
      queryParams.push(startDate);
    }
    if (endDate) {
      whereClauses.push("t.created_at <= ?");
      queryParams.push(endDate);
    }
    if (search) {
      whereClauses.push("(t.id LIKE ? OR e.first_name LIKE ? OR e.last_name LIKE ? OR v.registration_number LIKE ? OR r.name LIKE ?)");
      const searchStr = `%${search}%`;
      queryParams.push(searchStr, searchStr, searchStr, searchStr, searchStr);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const dataSql = `
      SELECT 
        t.id, t.status, t.start_time, t.end_time, t.notes,
        r.name as route_name, r.distance_km,
        v.registration_number, v.make as vehicle_make, v.model as vehicle_model,
        e.first_name as driver_first_name, e.last_name as driver_last_name
      FROM trips t
      LEFT JOIN routes r ON t.route_id = r.id
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      LEFT JOIN employees e ON d.employee_id = e.id
      ${whereSql}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `SELECT COUNT(*) as total FROM trips t ${whereSql}`;

    const [dataRows] = await this.pool.query(dataSql, [...queryParams, Number(limit), Number(offset)]);
    const [countRows] = await this.pool.query(countSql, queryParams);

    const total = countRows?.[0]?.total || 0;

    return {
      data: dataRows || [],
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findDetailedById(id) {
    const sql = `
      SELECT 
        t.*,
        r.name as route_name,
        v.registration_number,
        e.first_name as driver_first_name, e.last_name as driver_last_name
      FROM trips t
      LEFT JOIN routes r ON t.route_id = r.id
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      LEFT JOIN employees e ON d.employee_id = e.id
      WHERE t.id = ?
    `;
    const [rows] = await this.pool.query(sql, [id]);
    return rows[0] || null;
  }

  async findOverlappingTrips(vehicleId, driverId, startTime, endTime, excludeTripId = null) {
    let sql = `
      SELECT id, status, vehicle_id, driver_id, start_time, end_time 
      FROM trips 
      WHERE (vehicle_id = ? OR driver_id = ?)
      AND status IN ('Dispatched', 'In Progress')
      AND start_time < ? 
      AND end_time > ?
    `;
    const params = [vehicleId, driverId, endTime, startTime];

    if (excludeTripId) {
      sql += ` AND id != ?`;
      params.push(excludeTripId);
    }

    const [rows] = await this.pool.query(sql, params);
    return rows;
  }
}

export default new TripRepository();
