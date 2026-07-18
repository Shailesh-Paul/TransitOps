import BaseRepository from '../../core/BaseRepository.js';

class MaintenanceRepository extends BaseRepository {
  constructor() {
    super('maintenance_records');
  }

  /**
   * Override findAll to join with vehicles for comprehensive details
   */
  async findAll({
    page = 1,
    limit = 10,
    sort = "created_at",
    order = "DESC",
    filters = {},
    search = ""
  } = {}) {
    const offset = (page - 1) * limit;
    const queryParams = [];
    const whereClauses = [];

    // Exact Filters
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        whereClauses.push(`m.${key} = ?`);
        queryParams.push(value);
      }
    }

    // Fuzzy Search on description or performed_by or vehicle registration
    if (search) {
      whereClauses.push(`(m.description LIKE ? OR m.performed_by LIKE ? OR v.registration_number LIKE ?)`);
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const validOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const baseSql = `
      FROM maintenance_records m
      LEFT JOIN vehicles v ON m.vehicle_id = v.id
      ${whereSql}
    `;

    const dataSql = `
      SELECT 
        m.*,
        v.registration_number,
        v.make,
        v.model
      ${baseSql}
      ORDER BY m.${sort} ${validOrder}
      LIMIT ? OFFSET ?
    `;
    
    const countSql = `SELECT COUNT(*) as total ${baseSql}`;

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

  async getUpcomingExpiries(days = 30) {
      const sql = `
        SELECT 
            id, registration_number, 
            insurance_expiry, puc_expiry, registration_expiry
        FROM vehicles
        WHERE 
            (insurance_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)) OR
            (puc_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)) OR
            (registration_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY))
      `;
      const [rows] = await this.pool.query(sql, [days, days, days]);
      return rows;
  }

  async getWorkshopQueue() {
    // Sort logic: Queued first, then In Progress. Sort by Priority (Critical > High > Medium > Low), then by created_at ascending
    const sql = `
      SELECT m.*, v.registration_number, v.make, v.model 
      FROM maintenance_records m
      LEFT JOIN vehicles v ON m.vehicle_id = v.id
      WHERE m.status IN ('Queued', 'In Progress')
      ORDER BY 
        CASE m.status
          WHEN 'In Progress' THEN 1
          WHEN 'Queued' THEN 2
          ELSE 3
        END,
        CASE m.priority 
          WHEN 'Critical' THEN 1 
          WHEN 'High' THEN 2 
          WHEN 'Medium' THEN 3 
          WHEN 'Low' THEN 4 
          ELSE 5 
        END,
        m.created_at ASC
    `;
    const [rows] = await this.pool.query(sql);
    return rows || [];
  }

  async getComprehensiveDetails(id) {
    // 1. Core record + Vehicle details
    const recordSql = `
      SELECT m.*, 
             v.registration_number, v.make, v.model, v.capacity, v.status as vehicle_status
      FROM maintenance_records m
      JOIN vehicles v ON m.vehicle_id = v.id
      WHERE m.id = ?
    `;
    const [recordRows] = await this.pool.query(recordSql, [id]);
    if (recordRows.length === 0) return null;
    const record = recordRows[0];

    // Current driver if active trip
    const driverSql = `
      SELECT e.first_name, e.last_name 
      FROM trips t
      JOIN drivers d ON t.driver_id = d.id
      JOIN employees e ON d.employee_id = e.id
      WHERE t.vehicle_id = ? AND t.status IN ('scheduled', 'in_progress')
      ORDER BY t.start_time ASC LIMIT 1
    `;
    const [driverRows] = await this.pool.query(driverSql, [record.vehicle_id]);
    const current_driver = driverRows.length > 0 ? `${driverRows[0].first_name} ${driverRows[0].last_name}` : null;

    // 2. Audit logs
    const auditSql = `
      SELECT a.*, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.entity_type = 'maintenance_record' AND a.entity_id = ?
      ORDER BY a.created_at DESC
    `;
    const [auditRows] = await this.pool.query(auditSql, [id]);

    // 3. Previous maintenance
    const prevMaintSql = `
      SELECT id, type, status, created_at, work_order_number 
      FROM maintenance_records 
      WHERE vehicle_id = ? AND id != ?
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    const [prevMaintRows] = await this.pool.query(prevMaintSql, [record.vehicle_id, id]);

    // 4. Recent trips
    const tripsSql = `
      SELECT id, start_time, end_time, status 
      FROM trips 
      WHERE vehicle_id = ? 
      ORDER BY start_time DESC 
      LIMIT 5
    `;
    const [tripRows] = await this.pool.query(tripsSql, [record.vehicle_id]);

    // 5. Fuel history
    const fuelSql = `
      SELECT id, date, liters, cost 
      FROM fuel_logs 
      WHERE vehicle_id = ? 
      ORDER BY date DESC 
      LIMIT 5
    `;
    const [fuelRows] = await this.pool.query(fuelSql, [record.vehicle_id]);

    return {
      record: { ...record, current_driver },
      audit_logs: auditRows,
      previous_maintenance: prevMaintRows,
      recent_trips: tripRows,
      fuel_history: fuelRows
    };
  }

  async getDashboardKpis() {
    // We need: Vehicles Available, Vehicles In Shop, Completed Maintenance (count), Maintenance Cost (sum), Average Downtime
    const [vehicleStats] = await this.pool.query(`
      SELECT 
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as vehicles_available,
        SUM(CASE WHEN status = 'In Shop' THEN 1 ELSE 0 END) as vehicles_in_shop
      FROM vehicles WHERE deleted_at IS NULL
    `);

    const [maintStats] = await this.pool.query(`
      SELECT 
        COUNT(id) as completed_count,
        SUM(cost) as total_cost,
        AVG(downtime_minutes) as avg_downtime
      FROM maintenance_records 
      WHERE status = 'Completed' AND deleted_at IS NULL
    `);

    return {
      vehiclesAvailable: vehicleStats[0]?.vehicles_available || 0,
      vehiclesInShop: vehicleStats[0]?.vehicles_in_shop || 0,
      completedMaintenance: maintStats[0]?.completed_count || 0,
      totalMaintenanceCost: maintStats[0]?.total_cost || 0,
      averageDowntimeMinutes: maintStats[0]?.avg_downtime || 0
    };
  }
}

export default new MaintenanceRepository();
