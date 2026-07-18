import BaseRepository from "../../core/BaseRepository.js";

class LeaveRepository extends BaseRepository {
  constructor() {
    super("leave_requests");
  }

  /**
   * Custom findAll that JOINs employees and the reviewing user
   */
  async findAllWithDetails({ page = 1, limit = 10, status = null, employee_id = null } = {}) {
    const offset = (page - 1) * limit;
    const queryParams = [];
    const whereClauses = ["1=1"];

    if (status) {
      whereClauses.push("l.status = ?");
      queryParams.push(status);
    }

    if (employee_id) {
      whereClauses.push("l.employee_id = ?");
      queryParams.push(employee_id);
    }

    const whereSql = `WHERE ${whereClauses.join(" AND ")}`;

    const dataSql = `
      SELECT 
        l.id, l.employee_id, l.type, l.start_date, l.end_date, l.reason, l.status, l.created_at,
        e.first_name, e.last_name,
        u.email as reviewed_by_email
      FROM leave_requests l
      LEFT JOIN employees e ON l.employee_id = e.id
      LEFT JOIN users u ON l.reviewed_by = u.id
      ${whereSql}
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) as total 
      FROM leave_requests l
      ${whereSql}
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

  async findDetailedById(id) {
    const sql = `
      SELECT 
        l.*,
        e.first_name, e.last_name,
        u.email as reviewed_by_email
      FROM leave_requests l
      LEFT JOIN employees e ON l.employee_id = e.id
      LEFT JOIN users u ON l.reviewed_by = u.id
      WHERE l.id = ?
    `;
    const [rows] = await this.pool.query(sql, [id]);
    return rows[0] || null;
  }
}

export default new LeaveRepository();
