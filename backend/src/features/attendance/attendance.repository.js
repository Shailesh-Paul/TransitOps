import BaseRepository from "../../core/BaseRepository.js";

class AttendanceRepository extends BaseRepository {
  constructor() {
    super("attendance");
  }

  async findByEmployeeAndDate(employeeId, dateStr) {
    const [rows] = await this.pool.query(
      "SELECT * FROM attendance WHERE employee_id = ? AND date = ?",
      [employeeId, dateStr]
    );
    return rows[0] || null;
  }

  /**
   * Custom findAll that JOINs employees to get their name
   */
  async findAllWithDetails({ page = 1, limit = 10, status = null, employee_id = null, date = null } = {}) {
    const offset = (page - 1) * limit;
    const queryParams = [];
    const whereClauses = ["1=1"]; // simple trick to allow appending ANDs

    if (status) {
      whereClauses.push("a.status = ?");
      queryParams.push(status);
    }

    if (employee_id) {
      whereClauses.push("a.employee_id = ?");
      queryParams.push(employee_id);
    }

    if (date) {
      whereClauses.push("a.date = ?");
      queryParams.push(date);
    }

    const whereSql = `WHERE ${whereClauses.join(" AND ")}`;

    const dataSql = `
      SELECT 
        a.id, a.employee_id, a.date, a.clock_in, a.clock_out, a.status, a.created_at,
        e.first_name, e.last_name
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.id
      ${whereSql}
      ORDER BY a.date DESC, a.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) as total 
      FROM attendance a
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
        a.*,
        e.first_name, e.last_name
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.id
      WHERE a.id = ?
    `;
    const [rows] = await this.pool.query(sql, [id]);
    return rows[0] || null;
  }
}

export default new AttendanceRepository();
