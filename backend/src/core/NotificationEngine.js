import { getDB } from "../config/db.js";

class NotificationEngine {
  
  static async compileTemplate(templateName, variables) {
    const pool = getDB();
    const [rows] = await pool.query(`SELECT * FROM notification_templates WHERE name = ?`, [templateName]);
    if (rows.length === 0) throw new Error(`Template ${templateName} not found`);
    
    const template = rows[0];
    let title = template.title_template;
    let body = template.body_template;
    
    for (const [key, value] of Object.entries(variables)) {
      title = title.replace(new RegExp(`{{${key}}}`, 'g'), value);
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return { title, message: body, priority: template.default_priority };
  }

  static async canDispatchToUser(userId, type) {
    const pool = getDB();
    const [rows] = await pool.query(`
      SELECT in_app FROM notification_preferences 
      WHERE user_id = ? AND notification_type = ?
    `, [userId, type]);
    
    // If no preference found, default is true
    if (rows.length === 0) return true;
    return rows[0].in_app === 1;
  }

  static async logHistory(notificationId, userId, action) {
    const pool = getDB();
    await pool.query(`
      INSERT INTO notification_history (notification_id, user_id, action) 
      VALUES (?, ?, ?)
    `, [notificationId, userId, action]);
  }

  static async dispatch({ userId, title, message, priority = 'normal', type = 'SYSTEM', reference_id = null, reference_type = null }) {
    const canDispatch = await this.canDispatchToUser(userId, type);
    if (!canDispatch) return null;

    const pool = getDB();
    
    const logData = {
      user_id: userId,
      title,
      message,
      priority,
      type,
      reference_id,
      reference_type,
      status: 'unread'
    };

    const [result] = await pool.query('INSERT INTO notifications SET ?', [logData]);
    const newId = result.insertId;

    await this.logHistory(newId, userId, 'created');
    return newId;
  }

  static async dispatchToRole(roleName, payload) {
    const pool = getDB();
    const [users] = await pool.query(`
      SELECT u.id FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = ? AND u.status = 'active'
    `, [roleName]);

    const notificationIds = [];
    for (const user of users) {
      const id = await this.dispatch({ ...payload, userId: user.id });
      if (id) notificationIds.push(id);
    }
    return notificationIds;
  }

  static async hasDispatched({ title, reference_id, reference_type }) {
    const pool = getDB();
    const [rows] = await pool.query(`
      SELECT id FROM notifications 
      WHERE title = ? AND reference_id = ? AND reference_type = ?
      LIMIT 1
    `, [title, reference_id, reference_type]);
    return rows.length > 0;
  }

  // Semantic Wrappers using Templates

  static async notifyExpiry(adminRoleName, { item, daysLeft, reference_id, reference_type }) {
    const { title, message, priority } = await this.compileTemplate('EXPIRY_WARNING', { item, daysLeft });
    
    if (await this.hasDispatched({ title, reference_id, reference_type })) {
      return []; // Deduplication skip
    }

    return await this.dispatchToRole(adminRoleName, {
      title, message, priority, type: 'EXPIRY', reference_id, reference_type
    });
  }

  static async notifyAssignment(driverUserId, { tripId, vehicleRegistration }) {
    const { title, message, priority } = await this.compileTemplate('TRIP_ASSIGNED', { vehicleRegistration });
    return await this.dispatch({
      userId: driverUserId, title, message, priority, type: 'ASSIGNMENT', reference_id: tripId, reference_type: 'trip'
    });
  }

  static async notifyMaintenance(adminRoleName, { vehicleRegistration, status, reference_id }) {
    const { title, message, priority } = await this.compileTemplate('MAINTENANCE_STATUS', { vehicleRegistration, status });
    return await this.dispatchToRole(adminRoleName, {
      title, message, priority, type: 'SYSTEM', reference_id, reference_type: 'maintenance_record'
    });
  }

  static async notifyApprovalRequired(adminRoleName, { title: customTitle, message: customMessage, reference_id, reference_type }) {
    const { title, message, priority } = await this.compileTemplate('APPROVAL_REQUIRED', { title: customTitle, message: customMessage });
    return await this.dispatchToRole(adminRoleName, {
      title, message, priority, type: 'APPROVAL', reference_id, reference_type
    });
  }
}

export default NotificationEngine;
