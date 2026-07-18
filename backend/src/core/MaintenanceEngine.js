import { getDB } from "../config/db.js";
import { NotFoundError, ConflictError, BusinessRuleError } from "./errors.js";
import AuditLogger from "./AuditLogger.js";
import NotificationEngine from "./NotificationEngine.js";
import VehicleStatusEngine from "./VehicleStatusEngine.js";
import VehicleHealthEngine from "./VehicleHealthEngine.js";
import ExpenseEngine from "./ExpenseEngine.js";

class MaintenanceEngine {
  
  static async requestMaintenance(payload, userId) {
    const pool = getDB();
    
    // Validations
    if (payload.cost !== undefined && payload.cost < 0) {
      throw new BusinessRuleError("Estimated Cost cannot be negative");
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduledDate = payload.start_date ? new Date(payload.start_date) : null;
    const expectedDate = payload.end_date ? new Date(payload.end_date) : null;
    if (scheduledDate && scheduledDate < today) {
      throw new BusinessRuleError("Start Date cannot be before today");
    }
    if (scheduledDate && expectedDate && expectedDate < scheduledDate) {
      throw new BusinessRuleError("End Date cannot be before Start Date");
    }

    const data = {
      vehicle_id: payload.vehicle_id,
      type: payload.type,
      description: payload.description || '',
      start_date: payload.start_date || new Date().toISOString().split('T')[0],
      end_date: payload.end_date || null,
      cost: payload.cost || 0,
      status: 'Scheduled',
      created_by: userId
    };
    if (payload.performed_by) data.performed_by = payload.performed_by;

    // Verify vehicle exists and is eligible
    const [vehicleRows] = await pool.query('SELECT status FROM vehicles WHERE id = ? AND deleted_at IS NULL', [payload.vehicle_id]);
    if (vehicleRows.length === 0) throw new NotFoundError("Vehicle not found or deleted");
    
    const validStatuses = ['Available', 'Reserved'];
    if (!validStatuses.includes(vehicleRows[0].status)) {
      throw new ConflictError(`Vehicle is ${vehicleRows[0].status} and cannot be scheduled for maintenance.`);
    }

    // Check overlapping maintenance of same type
    const [activeMaintenance] = await pool.query(
      'SELECT id FROM maintenance_records WHERE vehicle_id = ? AND type = ? AND status IN ("scheduled", "in_progress", "Requested", "Queued")', 
      [payload.vehicle_id, payload.type]
    );
    if (activeMaintenance.length > 0) {
      throw new ConflictError("Vehicle already has an active maintenance schedule for this work type.");
    }

    // Use transaction for insert + update work_order_number
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    let insertId;
    try {
      const [result] = await connection.query('INSERT INTO maintenance_records SET ?', [data]);
      insertId = result.insertId;
      
      const year = new Date().getFullYear();
      const workOrderNumber = `MNT-${year}-${String(insertId).padStart(6, '0')}`;
      await connection.query('UPDATE maintenance_records SET work_order_number = ? WHERE id = ?', [workOrderNumber, insertId]);
      
      data.work_order_number = workOrderNumber;
      
      await connection.commit();
    } catch(err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
    
    await AuditLogger.log({
      action: "MAINTENANCE_SCHEDULED",
      entity_type: "maintenance_record",
      entity_id: insertId,
      user_id: userId,
      new_value: data
    });

    return insertId;
  }

  static async queueMaintenance(id, userId) {
    const pool = getDB();
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [rows] = await connection.query('SELECT * FROM maintenance_records WHERE id = ? FOR UPDATE', [id]);
      if (rows.length === 0) throw new NotFoundError("Maintenance record not found");
      const record = rows[0];

      if (record.status !== 'Requested') {
        throw new BusinessRuleError(`Cannot queue record in status: ${record.status}`);
      }

      // Check if vehicle is on trip before pulling to shop
      const [vehicleRows] = await connection.query('SELECT status FROM vehicles WHERE id = ? FOR UPDATE', [record.vehicle_id]);
      if (vehicleRows[0].status === 'On Trip') {
        throw new ConflictError("Vehicle is currently on a trip and cannot be pulled into the workshop queue");
      }

      // 1. Update Record
      await connection.query('UPDATE maintenance_records SET status = "Queued", updated_by = ? WHERE id = ?', [userId, id]);

      // 2. Transition Vehicle to In Shop (pulls from dispatch pool)
      await VehicleStatusEngine.transitionTo(record.vehicle_id, 'In Shop', userId, connection);

      await connection.commit();

      await AuditLogger.log({
        action: "QUEUE_MAINTENANCE",
        entity_type: "maintenance_record",
        entity_id: id,
        user_id: userId,
        new_value: { status: "Queued" }
      });

    } catch(err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async startMaintenance(id, userId) {
    const pool = getDB();
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [rows] = await connection.query('SELECT * FROM maintenance_records WHERE id = ? FOR UPDATE', [id]);
      if (rows.length === 0) throw new NotFoundError("Maintenance record not found");
      const record = rows[0];

      if (!['Queued', 'Scheduled', 'Overdue'].includes(record.status)) {
        throw new BusinessRuleError(`Only Queued, Scheduled, or Overdue maintenance can be started. Current status: ${record.status}`);
      }

      // Check if vehicle is on trip before pulling to shop
      const [vehicleRows] = await connection.query('SELECT status FROM vehicles WHERE id = ? FOR UPDATE', [record.vehicle_id]);
      if (vehicleRows[0].status === 'On Trip') {
        throw new ConflictError("Vehicle is currently on a trip and cannot be pulled into the workshop.");
      }

      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // 1. Update Record
      await connection.query('UPDATE maintenance_records SET status = "In Progress", start_date = ?, updated_by = ? WHERE id = ?', [now, userId, id]);

      // 2. Transition Vehicle to In Shop
      await VehicleStatusEngine.transitionTo(record.vehicle_id, 'In Shop', userId, connection);

      await connection.commit();

      await AuditLogger.log({
        action: "START_MAINTENANCE",
        entity_type: "maintenance_record",
        entity_id: id,
        user_id: userId,
        new_value: { status: "In Progress", start_date: now }
      });

    } catch(err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async completeMaintenance(id, payload, userId) {
    const pool = getDB();
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [rows] = await connection.query('SELECT * FROM maintenance_records WHERE id = ? FOR UPDATE', [id]);
      if (rows.length === 0) throw new NotFoundError("Maintenance record not found");
      const record = rows[0];

      if (record.status !== 'In Progress') {
        throw new BusinessRuleError(`Only In Progress maintenance can be completed. Current status: ${record.status}`);
      }

      if (record.progress !== 100 && payload.progress !== 100 && payload.force_complete !== true) {
        throw new BusinessRuleError("Cannot complete maintenance. Progress must be 100%.");
      }

      const labourHours = Number(payload.labour_hours || 0);
      const labourRate = Number(payload.labour_rate || 0);
      const miscCost = Number(payload.misc_cost || 0);

      if (labourHours < 0) throw new BusinessRuleError("Labour hours cannot be negative");
      if (labourRate < 0) throw new BusinessRuleError("Labour rate cannot be negative");
      if (miscCost < 0) throw new BusinessRuleError("Miscellaneous cost cannot be negative");

      const labourCost = labourHours * labourRate;
      
      let partsList = payload.parts || [];
      if (typeof partsList === 'string') partsList = JSON.parse(partsList);
      
      let partsCost = 0;
      for (const p of partsList) {
        const pQty = Number(p.quantity || 0);
        const pUnit = Number(p.unit_cost || 0);
        if (pQty < 0 || pUnit < 0) throw new BusinessRuleError("Parts quantity and unit cost cannot be negative");
        partsCost += (pQty * pUnit);
      }

      const totalCost = partsCost + labourCost + miscCost;

      const now = new Date();
      const startDateStr = record.start_date || now;
      const startDate = new Date(startDateStr);
      let diffMs = now - startDate;
      if (diffMs < 0) diffMs = 0;
      const downtimeMinutes = Math.floor(diffMs / 60000);

      const nowStr = now.toISOString().slice(0, 19).replace('T', ' ');
      const partsJson = JSON.stringify(partsList);

      // 1. Update Record
      await connection.query(
        `UPDATE maintenance_records SET 
          status = "Completed", 
          progress = 100,
          end_date = ?, 
          cost = ?, 
          parts = ?, 
          performed_by = IFNULL(performed_by, ?), 
          updated_by = ?,
          completion_summary = ?,
          root_cause = ?,
          corrective_action = ?,
          customer_remarks = ?,
          labour_hours = ?,
          labour_rate = ?,
          labour_cost = ?,
          misc_cost = ?,
          downtime_minutes = ?
        WHERE id = ?`, 
        [
          nowStr, totalCost, partsJson, payload.performed_by || payload.technician || null, userId,
          payload.completion_summary || null,
          payload.root_cause || null,
          payload.corrective_action || null,
          payload.customer_remarks || null,
          labourHours,
          labourRate,
          labourCost,
          miscCost,
          downtimeMinutes,
          id
        ]
      );

      // 1.5 Generate Maintenance Expense in the Enterprise Expense Engine
      if (totalCost > 0) {
        await ExpenseEngine.createExpense({
          source_module: 'Maintenance',
          source_record_id: id,
          source_reference: record.work_order_number || `MNT-${new Date().getFullYear()}-${String(id).padStart(6, '0')}`,
          vehicle_id: record.vehicle_id,
          category: 'Maintenance',
          cost_center_id: 'FLEET_MAINTENANCE',
          vendor: payload.technician || 'Internal Workshop',
          description: `Work Order: ${record.work_order_number || id} - ${payload.completion_summary || 'Maintenance completed'}`,
          amount: totalCost,
          date: nowStr.split(' ')[0],
          status: 'Pending Approval'
        }, userId, { connection });
      }

      // 2. Transition Vehicle back to Available
      await VehicleStatusEngine.transitionTo(record.vehicle_id, 'Available', userId, connection);

      await connection.commit();

      // Recalculate Health Score
      await VehicleHealthEngine.recalculateScore(record.vehicle_id);

      // Notifications (outside transaction)
      const adminRole = 'Fleet Manager';
      await NotificationEngine.notify(adminRole, {
        title: "Maintenance Completed",
        message: `Work Order ${record.work_order_number || id} has been successfully completed by ${payload.technician || 'Technician'}. Cost: ₹${totalCost.toLocaleString('en-IN')}`,
        type: "SUCCESS"
      });
      await NotificationEngine.notify(adminRole, {
        title: "Vehicle Available",
        message: `Vehicle ${record.vehicle_id} has been returned to service and is available for dispatch.`,
        type: "INFO"
      });

      await AuditLogger.log({
        action: "COMPLETE_MAINTENANCE",
        entity_type: "maintenance_record",
        entity_id: id,
        user_id: userId,
        new_value: { status: "Completed", end_date: nowStr, cost: totalCost, parts: partsJson, downtime_minutes: downtimeMinutes }
      });

    } catch(err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async cancelMaintenance(id, userId) {
    const pool = getDB();
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [rows] = await connection.query('SELECT * FROM maintenance_records WHERE id = ? FOR UPDATE', [id]);
      if (rows.length === 0) throw new NotFoundError("Maintenance record not found");
      const record = rows[0];

      if (record.status === 'Completed' || record.status === 'Cancelled') {
        throw new BusinessRuleError(`Cannot cancel maintenance in status: ${record.status}`);
      }

      // 1. Update Record
      await connection.query('UPDATE maintenance_records SET status = "Cancelled", updated_by = ? WHERE id = ?', [userId, id]);

      // 2. If it was Queued or In Progress, vehicle is in shop. Free it.
      if (record.status === 'Queued' || record.status === 'In Progress') {
        await VehicleStatusEngine.transitionTo(record.vehicle_id, 'Available', userId, connection);
      }

      await connection.commit();

      await AuditLogger.log({
        action: "CANCEL_MAINTENANCE",
        entity_type: "maintenance_record",
        entity_id: id,
        user_id: userId,
        new_value: { status: "Cancelled" }
      });

    } catch(err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
  static async updateProgress(id, payload, userId) {
    const pool = getDB();
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [rows] = await connection.query('SELECT * FROM maintenance_records WHERE id = ? FOR UPDATE', [id]);
      if (rows.length === 0) throw new NotFoundError("Maintenance record not found");
      const record = rows[0];

      if (record.status !== 'In Progress') {
        throw new BusinessRuleError(`Progress can only be updated for maintenance In Progress. Current status: ${record.status}`);
      }

      if (payload.progress !== undefined) {
        if (payload.progress < 0 || payload.progress > 100) {
          throw new BusinessRuleError("Progress must be between 0 and 100");
        }
      }

      const updateData = {};
      const newProgress = payload.progress !== undefined ? payload.progress : record.progress;
      if (newProgress !== record.progress) updateData.progress = newProgress;
      
      let newNotes = record.technician_notes || [];
      if (typeof newNotes === 'string') newNotes = JSON.parse(newNotes);
      if (payload.note) {
        newNotes.push({
          timestamp: new Date().toISOString(),
          technician: payload.technician || 'Technician', // we might want to map userId to name, but for now take from payload
          comment: payload.note
        });
        updateData.technician_notes = JSON.stringify(newNotes);
      }

      if (payload.work_performed_checklist !== undefined) {
        updateData.work_performed_checklist = JSON.stringify(payload.work_performed_checklist);
      }
      
      if (payload.attachments !== undefined) {
        updateData.attachments = JSON.stringify(payload.attachments);
      }

      if (payload.workshop_bay !== undefined) {
        updateData.workshop_bay = payload.workshop_bay;
      }

      if (Object.keys(updateData).length > 0) {
        const setClauses = [];
        const queryParams = [];
        for (const [key, val] of Object.entries(updateData)) {
          setClauses.push(`${key} = ?`);
          queryParams.push(val);
        }
        setClauses.push('updated_by = ?');
        queryParams.push(userId);
        queryParams.push(id);

        const sql = `UPDATE maintenance_records SET ${setClauses.join(', ')} WHERE id = ?`;
        await connection.query(sql, queryParams);
      }

      await connection.commit();

      // Notifications (outside transaction)
      const adminRole = 'Fleet Manager';
      if (record.progress < 50 && newProgress >= 50) {
        await NotificationEngine.notify(adminRole, {
          title: "Maintenance at 50%",
          message: `Work Order ${record.work_order_number || id} has reached 50% completion.`,
          type: "INFO"
        });
      }
      if (record.progress < 75 && newProgress >= 75) {
        await NotificationEngine.notify(adminRole, {
          title: "Maintenance at 75%",
          message: `Work Order ${record.work_order_number || id} has reached 75% completion.`,
          type: "INFO"
        });
      }

      await AuditLogger.log({
        action: "PROGRESS_UPDATED",
        entity_type: "maintenance_record",
        entity_id: id,
        user_id: userId,
        old_value: { progress: record.progress },
        new_value: { progress: newProgress, note_added: !!payload.note }
      });

    } catch(err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}

export default MaintenanceEngine;
