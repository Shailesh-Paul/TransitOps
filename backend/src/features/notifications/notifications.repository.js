import BaseRepository from "../../core/BaseRepository.js";
import NotificationEngine from "../../core/NotificationEngine.js";

class NotificationRepository extends BaseRepository {
  constructor() {
    super("notifications");
  }

  async findByUserId(userId, { page = 1, limit = 10, status = null } = {}) {
    const offset = (page - 1) * limit;
    const queryParams = [userId];
    let whereClause = "WHERE user_id = ?";

    if (status) {
      whereClause += " AND status = ?";
      queryParams.push(status);
    }

    const dataSql = `
      SELECT * FROM notifications 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;

    const countSql = `SELECT COUNT(*) as total FROM notifications ${whereClause}`;

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

  async updateStatus(id, userId, newStatus) {
    const [result] = await this.pool.query(
      "UPDATE notifications SET status = ? WHERE id = ? AND user_id = ?",
      [newStatus, id, userId]
    );
    if (result.affectedRows > 0) {
      // Log the transition in history
      await NotificationEngine.logHistory(id, userId, newStatus);
      return true;
    }
    return false;
  }

  // Preferences Management
  async getPreferences(userId) {
    const [rows] = await this.pool.query("SELECT * FROM notification_preferences WHERE user_id = ?", [userId]);
    return rows;
  }

  async updatePreference(userId, type, inApp, email) {
    await this.pool.query(`
      INSERT INTO notification_preferences (user_id, notification_type, in_app, email)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE in_app = VALUES(in_app), email = VALUES(email)
    `, [userId, type, inApp, email]);
    return true;
  }

  async markAllAsRead(userId) {
    const [result] = await this.pool.query(
      "UPDATE notifications SET status = 'read' WHERE user_id = ? AND status = 'unread'",
      [userId]
    );
    // Ideally we would log history for all affected rows, but for a bulk action we skip to save DB load
    return result.affectedRows;
  }

  async delete(id, userId) {
    const [result] = await this.pool.query("DELETE FROM notifications WHERE id = ? AND user_id = ?", [id, userId]);
    return result.affectedRows > 0;
  }

  async getCounts(userId) {
    const [rows] = await this.pool.query(`
      SELECT status, COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ? 
      GROUP BY status
    `, [userId]);
    
    // Transform array into an object { unread: 5, read: 12, archived: 0 }
    const counts = { unread: 0, read: 0, archived: 0, dismissed: 0 };
    rows.forEach(r => {
      counts[r.status] = r.count;
    });
    return counts;
  }

  async getHistory(id, userId) {
    // Ensure the notification belongs to the user first
    const [notif] = await this.pool.query("SELECT id FROM notifications WHERE id = ? AND user_id = ?", [id, userId]);
    if (notif.length === 0) return null;

    const [rows] = await this.pool.query(`
      SELECT action, created_at as timestamp 
      FROM notification_history 
      WHERE notification_id = ?
      ORDER BY created_at DESC
    `, [id]);
    return rows;
  }
}

export default new NotificationRepository();
