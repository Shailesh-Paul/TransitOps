import BaseRepository from '../../core/BaseRepository.js';

class PayrollRepository extends BaseRepository {
  constructor() {
    super('payroll');
  }

  /**
   * Override findAll to join with employees for full context
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

    // Base filter for soft deletes
    whereClauses.push(`p.deleted_at IS NULL`);

    // Exact Filters
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        whereClauses.push(`p.${key} = ?`);
        queryParams.push(value);
      }
    }

    // Fuzzy Search on employee name
    if (search) {
      whereClauses.push(`(e.first_name LIKE ? OR e.last_name LIKE ?)`);
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const validOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const baseSql = `
      FROM payroll p
      LEFT JOIN employees e ON p.employee_id = e.id
      ${whereSql}
    `;

    const dataSql = `
      SELECT 
        p.*,
        e.first_name,
        e.last_name,
        e.department_id
      ${baseSql}
      ORDER BY p.${sort} ${validOrder}
      LIMIT ? OFFSET ?
    `;
    
    const countSql = `SELECT COUNT(*) as total ${baseSql}`;

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
}

export default new PayrollRepository();
