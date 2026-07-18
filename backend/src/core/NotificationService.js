import { getDB } from "../config/db.js";

/**
 * Enterprise Centralized Notification Service
 * Handles notification dispatching across all modules.
 */
class NotificationService {
  /**
   * Send a rich notification to a user.
   * 
   * @param {Object} payload
   * @param {number} payload.user_id - Target user ID
   * @param {string} payload.title - Notification title
   * @param {string} payload.message - Notification message body
   * @param {string} [payload.notification_type='system'] - Category of notification
   * @param {string} [payload.priority='medium'] - Priority (low, medium, high, critical)
   * @param {string} [payload.entity_type=null] - Related entity type (e.g. 'expense')
   * @param {number|string} [payload.entity_id=null] - Related entity ID
   * @param {string} [payload.action_url=null] - URL to redirect to upon click
   * @param {Object} [options] - Additional options (e.g., connection for transaction)
   */
  static async notify(payload, options = {}) {
    const pool = getDB();
    const conn = options.connection || pool;

    const data = {
      user_id: payload.user_id,
      title: payload.title,
      message: payload.message,
      notification_type: payload.notification_type || 'system',
      priority: payload.priority || 'medium',
      entity_type: payload.entity_type || null,
      entity_id: payload.entity_id || null,
      action_url: payload.action_url || null,
      is_read: false,
    };

    const sql = `INSERT INTO notifications SET ?`;
    
    try {
      const [result] = await conn.query(sql, [data]);
      return result.insertId;
    } catch (err) {
      console.error("Failed to send notification:", err);
      // We generally do not want to fail a core transaction if a notification fails
      // However, if passed a transaction connection, the caller must decide on throw
      if (options.throwOnError) {
        throw err;
      }
      return null;
    }
  }
}

export default NotificationService;
