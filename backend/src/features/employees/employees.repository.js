import BaseRepository from "../../core/BaseRepository.js";

class EmployeeRepository extends BaseRepository {
  constructor() {
    super("employees");
  }

  async findByUserId(userId) {
    const [rows] = await this.pool.query(
      "SELECT * FROM employees WHERE user_id = ? AND deleted_at IS NULL",
      [userId]
    );
    return rows[0] || null;
  }

  async findByPhone(phone) {
    const [rows] = await this.pool.query(
      "SELECT * FROM employees WHERE phone = ? AND deleted_at IS NULL",
      [phone]
    );
    return rows[0] || null;
  }

  /**
   * Custom findAll that JOINs users (for email) and departments (for name)
   */
  async findAllWithDetails({ page = 1, limit = 10, status = null, department_id = null, search = "" } = {}) {
    const offset = (page - 1) * limit;
    const queryParams = [];
    const whereClauses = ["e.deleted_at IS NULL"];

    if (status) {
      whereClauses.push("e.status = ?");
      queryParams.push(status);
    }

    if (department_id) {
      whereClauses.push("e.department_id = ?");
      queryParams.push(department_id);
    }

    if (search) {
      whereClauses.push("(e.first_name LIKE ? OR e.last_name LIKE ? OR e.phone LIKE ? OR u.email LIKE ?)");
      const searchStr = `%${search}%`;
      queryParams.push(searchStr, searchStr, searchStr, searchStr);
    }

    const whereSql = `WHERE ${whereClauses.join(" AND ")}`;

    const dataSql = `
      SELECT 
        e.id, e.user_id, e.department_id, e.first_name, e.last_name, e.phone, e.hire_date, e.status, e.created_at,
        u.email,
        d.name as department_name
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      ${whereSql}
      ORDER BY e.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) as total 
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      ${whereSql}
    `;

    const [dataRows] = await this.pool.query(dataSql, [...queryParams, Number(limit), Number(offset)]);
    const [countRows] = await this.pool.query(countSql, queryParams);

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
        e.*,
        u.email,
        d.name as department_name
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.id = ? AND e.deleted_at IS NULL
    `;
    const [rows] = await this.pool.query(sql, [id]);
    return rows[0] || null;
  }
}

export default new EmployeeRepository();
