import BaseRepository from "../../core/BaseRepository.js";

class DriverRepository extends BaseRepository {
  constructor() {
    super("drivers");
  }

  async findByEmployeeId(employeeId) {
    const [rows] = await this.pool.query(
      "SELECT * FROM drivers WHERE employee_id = ? AND deleted_at IS NULL",
      [employeeId]
    );
    return rows[0] || null;
  }

  async findByLicenseNumber(licenseNumber) {
    const [rows] = await this.pool.query(
      "SELECT * FROM drivers WHERE license_number = ? AND deleted_at IS NULL",
      [licenseNumber]
    );
    return rows[0] || null;
  }

  /**
   * Custom findAll that JOINs employees for first_name, last_name, and phone
   */
  async findAllWithDetails({ page = 1, limit = 10, status = null, search = "", includeDeleted = false, validity = null } = {}) {
    const offset = (page - 1) * limit;
    const queryParams = [];
    const whereClauses = [];
    
    if (!includeDeleted) {
      whereClauses.push("d.deleted_at IS NULL");
    }

    if (status) {
      whereClauses.push("d.status = ?");
      queryParams.push(status);
    }

    if (validity) {
      if (validity === 'valid') {
        whereClauses.push("d.license_expiry >= DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY)");
      } else if (validity === 'expiring_soon') {
        whereClauses.push("d.license_expiry >= CURRENT_DATE AND d.license_expiry < DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY)");
      } else if (validity === 'expired') {
        whereClauses.push("d.license_expiry < CURRENT_DATE");
      }
    }

    if (search) {
      whereClauses.push("(d.license_number LIKE ? OR e.first_name LIKE ? OR e.last_name LIKE ? OR e.phone LIKE ?)");
      const searchStr = `%${search}%`;
      queryParams.push(searchStr, searchStr, searchStr, searchStr);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const dataSql = `
      SELECT 
        d.id, d.employee_id, d.license_number, d.license_expiry, d.status, d.created_at, d.deleted_at,
        e.first_name, e.last_name, e.phone
      FROM drivers d
      LEFT JOIN employees e ON d.employee_id = e.id
      ${whereSql}
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) as total 
      FROM drivers d
      LEFT JOIN employees e ON d.employee_id = e.id
      ${whereSql}
    `;

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
        d.*,
        e.first_name, e.last_name, e.phone
      FROM drivers d
      LEFT JOIN employees e ON d.employee_id = e.id
      WHERE d.id = ? AND d.deleted_at IS NULL
    `;
    const [rows] = await this.pool.query(sql, [id]);
    return rows[0] || null;
  }

  async findAvailable() {
    const sql = `
      SELECT d.*, e.first_name, e.last_name, e.phone
      FROM drivers d
      LEFT JOIN employees e ON d.employee_id = e.id
      WHERE d.status = 'Available'
        AND d.deleted_at IS NULL
        AND d.license_expiry >= CURRENT_DATE
        AND d.id NOT IN (
          SELECT driver_id FROM trips WHERE status IN ('Dispatched', 'In Progress')
        )
    `;
    const [rows] = await this.pool.query(sql);
    return rows || [];
  }

  async getTimeline(driverId) {
    // UNION of trips and audit_logs
    const sql = `
      SELECT 
        'trip' AS event_type,
        id AS event_id,
        status AS event_status,
        created_at AS event_date,
        CONCAT('Assigned to trip ', status) AS description
      FROM trips
      WHERE driver_id = ?

      UNION ALL

      SELECT 
        'audit' AS event_type,
        id AS event_id,
        action AS event_status,
        created_at AS event_date,
        CONCAT(action, ' action performed') AS description
      FROM audit_logs
      WHERE entity_type = 'driver' AND entity_id = ?

      ORDER BY event_date DESC
    `;
    const [rows] = await this.pool.query(sql, [driverId, driverId]);
    return rows;
  }
}

export default new DriverRepository();
