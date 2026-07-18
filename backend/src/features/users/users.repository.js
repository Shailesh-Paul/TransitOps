import BaseRepository from "../../core/BaseRepository.js";
import { NotFoundError } from "../../core/errors.js";

class UserRepository extends BaseRepository {
  constructor() {
    super("users");
  }

  /**
   * Fetches the user identity joined with their employee profile
   * @param {number} userId 
   */
  async getFullProfile(userId) {
    const sql = `
      SELECT 
        u.id as user_id, u.email, u.role_id, u.status, u.created_at,
        r.name as role_name,
        e.id as employee_id, e.first_name, e.last_name, e.phone, e.department_id,
        d.name as department_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN employees e ON u.id = e.user_id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE u.id = ? AND u.deleted_at IS NULL
    `;
    const [rows] = await this.pool.query(sql, [userId]);
    return rows[0] || null;
  }

  /**
   * Updates or creates the employee profile for a user
   * @param {number} userId 
   * @param {Object} profileData 
   */
  async upsertProfile(userId, profileData) {
    // Check if employee record exists
    const [existing] = await this.pool.query("SELECT id FROM employees WHERE user_id = ?", [userId]);
    
    if (existing.length > 0) {
      // Update
      const columns = Object.keys(profileData);
      const values = Object.values(profileData);
      const setClause = columns.map((col) => `${col} = ?`).join(", ");
      const sql = `UPDATE employees SET ${setClause} WHERE user_id = ?`;
      await this.pool.query(sql, [...values, userId]);
    } else {
      // Insert (requires department_id which might need to be handled by HR module, 
      // but for basic profile updates, we might need a default or require it)
      // Since our plan assumes HR creates the employee record, we will just throw an error if missing,
      // or we can allow partial insert if schema allows (schema requires department_id, first_name, last_name).
      // Let's assume for profile updates, the employee record MUST exist.
      throw new NotFoundError("Employee record does not exist. Please contact HR to complete your profile setup.");
    }
  }

  async findByEmail(email) {
    const [rows] = await this.pool.query("SELECT * FROM users WHERE email = ? AND deleted_at IS NULL", [email]);
    return rows[0] || null;
  }
}

export default new UserRepository();
