import { getDB } from "../config/db.js";
import AuditLogger from "./AuditLogger.js";

class VehicleStatusEngine {
  
  /**
   * Translates internal application status requests into the centralized DB ENUMs.
   * Forces state transitions and writes to the audit log simultaneously.
   * 
   * @param {number|string} vehicleId 
   * @param {string} newStatus 'Available', 'Reserved', 'On Trip', 'In Shop', 'Retired'
   * @param {number|string} userId 
   * @param {object|null} connection Optional transaction connection
   */
  static async transitionTo(vehicleId, newStatus, userId, connection = null) {
    const validStatuses = ['Available', 'Reserved', 'On Trip', 'In Shop', 'Retired'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid vehicle status transition to: ${newStatus}`);
    }

    const pool = connection || getDB();
    
    // Fetch old status to verify change and log it
    const [rows] = await pool.query(`SELECT status FROM vehicles WHERE id = ?`, [vehicleId]);
    if (rows.length === 0) return;
    
    const oldStatus = rows[0].status;
    if (oldStatus === newStatus) return; // No operation needed

    // Perform transition
    await pool.query(`UPDATE vehicles SET status = ?, updated_by = ?, updated_at = NOW() WHERE id = ?`, [newStatus, userId, vehicleId]);

    // Log the transition
    await AuditLogger.log({
      action: "STATUS_CHANGE",
      entity_type: "vehicle",
      entity_id: vehicleId,
      user_id: userId,
      old_value: { status: oldStatus },
      new_value: { status: newStatus }
    });
  }

  /**
   * Business rule: Handles vehicle state based on trip progression.
   */
  static async handleTripStatusChange(tripData, userId, connection = null) {
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
    
    await this.transitionTo(tripData.vehicle_id, newStatus, userId, connection);
  }

  /**
   * Business rule: Handles vehicle state based on maintenance progression.
   */
  static async handleMaintenanceStatusChange(maintenanceData, userId, connection = null) {
    let newStatus;
    switch(maintenanceData.status) {
      case 'scheduled':
      case 'cancelled':
      case 'completed':
        newStatus = 'Available';
        break;
      case 'in_progress':
        newStatus = 'In Shop';
        break;
      default:
        return;
    }

    await this.transitionTo(maintenanceData.vehicle_id, newStatus, userId, connection);
  }
}

export default VehicleStatusEngine;
