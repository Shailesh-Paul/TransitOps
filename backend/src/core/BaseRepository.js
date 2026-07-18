import { getDB } from "../config/db.js";

/**
 * Reusable BaseRepository for raw mysql2 queries.
 * Provides dynamic CRUD, Pagination, Sorting, and Filtering capabilities.
 */
class BaseRepository {
  constructor(tableName) {
    if (!tableName) {
      throw new Error("BaseRepository requires a tableName");
    }
    this.tableName = tableName;
  }

  /**
   * Helper to get the DB pool (in case of dynamic injection later)
   */
  get pool() {
    return getDB();
  }

  /**
   * Find a record by ID (ignores soft-deleted records by default)
   */
  async findById(id, includeDeleted = false) {
    let sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    if (!includeDeleted) {
      sql += ` AND deleted_at IS NULL`;
    }
    const [rows] = await this.pool.query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Dynamically insert a new record
   * @param {Object} data - Key-value pairs representing column names and values
   * @returns {number} The insertId of the newly created record
   */
  async create(data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    
    if (columns.length === 0) {
      throw new Error("No data provided for insertion");
    }

    const placeholders = columns.map(() => "?").join(", ");
    const sql = `INSERT INTO ${this.tableName} (${columns.join(", ")}) VALUES (${placeholders})`;
    
    const [result] = await this.pool.query(sql, values);
    return result.insertId;
  }

  /**
   * Dynamically update an existing record
   * @param {number} id - Record ID
   * @param {Object} data - Key-value pairs to update
   */
  async update(id, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);

    if (columns.length === 0) {
      throw new Error("No data provided for update");
    }

    const setClause = columns.map((col) => `${col} = ?`).join(", ");
    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ? AND deleted_at IS NULL`;
    
    const [result] = await this.pool.query(sql, [...values, id]);
    return result.affectedRows > 0;
  }

  /**
   * Soft delete a record by setting deleted_at
   * @param {number} id - Record ID
   */
  async softDelete(id) {
    const sql = `UPDATE ${this.tableName} SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL`;
    const [result] = await this.pool.query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Hard delete a record completely from the database
   * @param {number} id - Record ID
   */
  async hardDelete(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const [result] = await this.pool.query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Advanced query builder for finding multiple records
   * Supports: Pagination, Sorting, Exact Filtering, and Fuzzy Searching
   * 
   * @param {Object} options
   * @param {number} [options.page=1]
   * @param {number} [options.limit=10]
   * @param {string} [options.sort="id"] - Column to sort by
   * @param {string} [options.order="DESC"] - ASC or DESC
   * @param {Object} [options.filters={}] - Exact match filters e.g., { status: 'active', role_id: 2 }
   * @param {string} [options.search=""] - Fuzzy search string
   * @param {Array} [options.searchFields=[]] - Array of columns to apply fuzzy search on
   * @param {boolean} [options.includeDeleted=false]
   * @param {boolean} [options.calculateTotal=true] - Whether to perform a SELECT COUNT(*) query
   */
  async findAll({
    page = 1,
    limit = 10,
    sort = "id",
    order = "DESC",
    filters = {},
    search = "",
    searchFields = [],
    includeDeleted = false,
    calculateTotal = true,
  } = {}) {
    const offset = (page - 1) * limit;
    const queryParams = [];
    const whereClauses = [];

    // 1. Soft Delete Check
    if (!includeDeleted) {
      whereClauses.push("deleted_at IS NULL");
    }

    // 2. Exact Filters (e.g. status = 'active')
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        whereClauses.push(`${key} = ?`);
        queryParams.push(value);
      }
    }

    // 3. Fuzzy Search (e.g. LIKE '%john%')
    if (search && searchFields.length > 0) {
      const searchClauses = searchFields.map((field) => `${field} LIKE ?`);
      whereClauses.push(`(${searchClauses.join(" OR ")})`);
      searchFields.forEach(() => queryParams.push(`%${search}%`));
    }

    // Assemble WHERE block
    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Assemble ORDER block (Prevent SQL injection by ensuring order is valid)
    const validOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
    // For sort columns, we trust the caller (controller) to validate against a whitelist
    const orderSql = `ORDER BY ${sort} ${validOrder}`;

    // Assemble complete SQL queries
    const dataSql = `SELECT * FROM ${this.tableName} ${whereSql} ${orderSql} LIMIT ? OFFSET ?`;
    
    let total = 0;
    let dataRows = [];

    if (calculateTotal) {
      const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereSql}`;
      // Execute sequentially to prevent Railway proxy connection burst timeouts
      const [dataResult] = await this.pool.query(dataSql, [...queryParams, Number(limit), Number(offset)]);
      const [countResult] = await this.pool.query(countSql, queryParams);
      dataRows = dataResult || [];
      total = countResult?.[0]?.total || 0;
    } else {
      // Skip the count query entirely
      const [result] = await this.pool.query(dataSql, [...queryParams, Number(limit), Number(offset)]);
      dataRows = result || [];
      // We don't know the total, so we can't reliably return it or totalPages.
      // Set to null or a default to indicate it's unknown.
      total = null;
    }

    return {
      data: dataRows,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: total !== null ? Math.ceil(total / limit) : null,
      },
    };
  }
}

export default BaseRepository;
