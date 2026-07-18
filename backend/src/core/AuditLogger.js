import { getDB } from "../config/db.js";

/**
 * AuditLogger handles writing event histories to the audit_logs table.
 */
class AuditLogger {
  /**
   * Logs an action to the audit log table.
   * 
   * @param {Object} params
   * @param {string} params.action - e.g., 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE'
   * @param {string} params.entity_type - e.g., 'vehicle', 'trip'
   * @param {number} params.entity_id - The ID of the affected record
   * @param {number} params.user_id - The ID of the user performing the action
   * @param {Object|null} [params.old_value=null] - The state before the change
   * @param {Object|null} [params.new_value=null] - The state after the change
   */
  static async log({ action, entity_type, entity_id, user_id, old_value = null, new_value = null }) {
    const pool = getDB();
    const sql = `
      INSERT INTO audit_logs (action, entity_type, entity_id, user_id, old_value, new_value)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    // Safely stringify JSON values
    const oldValStr = old_value ? JSON.stringify(old_value) : null;
    const newValStr = new_value ? JSON.stringify(new_value) : null;

    try {
      await pool.query(sql, [action, entity_type, entity_id, user_id, oldValStr, newValStr]);
    } catch (error) {
      console.error(`Failed to write to audit_logs for ${entity_type}:${entity_id}`, error);
      // We purposefully don't throw here so that audit log failure doesn't crash the main transaction
    }
  }
}

export default AuditLogger;
