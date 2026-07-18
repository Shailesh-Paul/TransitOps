import { getDB } from "../config/db.js";
import { NotFoundError, BusinessRuleError } from "./errors.js";
import AuditLogger from "./AuditLogger.js";
import NotificationService from "./NotificationService.js";

const VALID_TRANSITIONS = {
  'Draft': ['Pending Approval'],
  'Pending Approval': ['Approved', 'Rejected'],
  'Approved': ['Posted'],
  'Posted': ['Archived'],
  'Archived': [],
  'Rejected': [] // Cannot transition out of rejected in this workflow
};

class ApprovalEngine {
  
  static async processAction(entityType, entityId, action, userId, comments = null, reason = null) {
    const pool = getDB();
    const connection = await pool.getConnection();
    
    // We will run this inside a transaction
    await connection.beginTransaction();
    
    try {
      let currentStatus;
      let createdBy;
      let accRef;
      
      // Abstracted to support multiple entity types in the future, 
      // but currently explicitly supporting 'expense'
      if (entityType === 'expense') {
        const [rows] = await connection.query('SELECT status, created_by, accounting_reference FROM expenses WHERE id = ? FOR UPDATE', [entityId]);
        if (rows.length === 0) throw new NotFoundError("Expense not found.");
        currentStatus = rows[0].status;
        createdBy = rows[0].created_by;
        accRef = rows[0].accounting_reference;
      } else {
        throw new BusinessRuleError(`Entity type ${entityType} not supported by Approval Engine.`);
      }

      let targetStatus;
      switch (action) {
        case 'SUBMIT': targetStatus = 'Pending Approval'; break;
        case 'APPROVE': targetStatus = 'Approved'; break;
        case 'REJECT': targetStatus = 'Rejected'; break;
        case 'POST': targetStatus = 'Posted'; break;
        case 'ARCHIVE': targetStatus = 'Archived'; break;
        default: throw new BusinessRuleError("Invalid workflow action.");
      }

      // Check transition validity
      const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
      if (!allowedNext.includes(targetStatus)) {
        throw new BusinessRuleError(`Illegal workflow transition from ${currentStatus} to ${targetStatus}.`);
      }

      // Action-specific validations
      if (action === 'REJECT' && !reason) {
        throw new BusinessRuleError("A rejection reason is mandatory.");
      }

      // Update the entity status
      if (entityType === 'expense') {
        let updateQuery = 'UPDATE expenses SET status = ?, updated_by = ?';
        const params = [targetStatus, userId];
        
        if (targetStatus === 'Approved') {
          updateQuery += ', approved_by = ?';
          params.push(userId);
        } else if (targetStatus === 'Posted') {
          updateQuery += ', posted_by = ?';
          params.push(userId);
        }
        
        updateQuery += ' WHERE id = ?';
        params.push(entityId);
        await connection.query(updateQuery, params);
      }

      // Create Audit Log with comments embedded in new_value
      const logPayload = {
        action: `WORKFLOW_${action}`,
        entity_type: entityType,
        entity_id: entityId,
        user_id: userId,
        old_value: { status: currentStatus },
        new_value: { 
          status: targetStatus,
          comments: comments,
          reason: reason
        }
      };
      
      await AuditLogger.log(logPayload, { connection });

      // Notifications
      if (createdBy && createdBy !== userId) {
        await NotificationService.notify({
          user_id: createdBy,
          title: `Expense ${targetStatus}`,
          message: `Your expense ${accRef} has been moved to ${targetStatus}. ${reason ? `Reason: ${reason}` : ''}`,
          notification_type: 'workflow',
          priority: action === 'REJECT' ? 'high' : 'medium',
          entity_type: entityType,
          entity_id: entityId,
          action_url: `/finance/approvals/${entityId}`
        }, { connection, throwOnError: false });
      }

      await connection.commit();
      
      return {
        success: true,
        previousStatus: currentStatus,
        newStatus: targetStatus
      };
      
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async submit(entityType, entityId, userId, comments = null) {
    return await this.processAction(entityType, entityId, 'SUBMIT', userId, comments);
  }

  static async approve(entityType, entityId, userId, comments = null) {
    return await this.processAction(entityType, entityId, 'APPROVE', userId, comments);
  }

  static async reject(entityType, entityId, userId, reason, comments = null) {
    return await this.processAction(entityType, entityId, 'REJECT', userId, comments, reason);
  }

  static async post(entityType, entityId, userId, comments = null) {
    return await this.processAction(entityType, entityId, 'POST', userId, comments);
  }

  static async archive(entityType, entityId, userId, comments = null) {
    return await this.processAction(entityType, entityId, 'ARCHIVE', userId, comments);
  }
}

export default ApprovalEngine;
