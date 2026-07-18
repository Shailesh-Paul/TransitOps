import { getDB } from "../config/db.js";
import AuditLogger from "./AuditLogger.js";

class DriverStatusEngine {
  
  /**
   * Translates internal application status requests into the centralized DB ENUMs.
   * Forces state transitions and writes to the audit log simultaneously.
   * 
   * @param {number|string} driverId 
   * @param {string} newStatus 'Available', 'On Trip', 'Off Duty', 'Suspended', 'Retired'
   * @param {number|string} userId 
   * @param {object|null} connection Optional transaction connection
   */
  static async transitionTo(driverId, newStatus, userId, connection = null) {
    const validStatuses = ['Available', 'Reserved', 'On Trip', 'Off Duty', 'Suspended', 'Retired'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid driver status transition to: ${newStatus}`);
    }

    const pool = connection || getDB();
    
    // Fetch old status to verify change and log it
    const [rows] = await pool.query(`SELECT status FROM drivers WHERE id = ?`, [driverId]);
    if (rows.length === 0) return;
    
    const oldStatus = rows[0].status;
    if (oldStatus === newStatus) return; // No operation needed

    // Perform transition
    await pool.query(`UPDATE drivers SET status = ?, updated_by = ?, updated_at = NOW() WHERE id = ?`, [newStatus, userId, driverId]);

    // Log the transition
    await AuditLogger.log({
      action: "STATUS_CHANGE",
      entity_type: "driver",
      entity_id: driverId,
      user_id: userId,
      old_value: { status: oldStatus },
      new_value: { status: newStatus }
    });
  }

  /**
   * Business rule: Handles driver state based on trip progression.
   */
  static async handleTripStatusChange(tripData, userId, connection = null) {
    if (!tripData.driver_id) return;
    
    let newStatus;
    switch(tripData.status) {
      case 'scheduled':
        newStatus = 'Reserved';
        break;
      case 'in_progress':
        newStatus = 'On Trip';
        break;
      case 'completed':
      case 'cancelled':
        newStatus = 'Available';
        break;
      default:
        return;
    }
    
    await this.transitionTo(tripData.driver_id, newStatus, userId, connection);
  }
}

export default DriverStatusEngine;
