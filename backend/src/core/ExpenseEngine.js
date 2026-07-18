import { getDB } from "../config/db.js";
import { NotFoundError, BusinessRuleError, ConflictError } from "./errors.js";
import AuditLogger from "./AuditLogger.js";
import { v4 as uuidv4 } from "uuid";

class ExpenseStatusMapper {
  static toFrontend(status) {
    if (!status) return 'pending';
    switch (status) {
      case 'Posted':
      case 'Approved':
      case 'Archived':
        return 'cleared';
      case 'Rejected':
        return 'rejected';
      case 'Draft':
      case 'Pending Approval':
      default:
        return 'pending';
    }
  }

  static fromFrontend(frontendStatus) {
    switch (frontendStatus) {
      case 'cleared': return 'Posted';
      case 'rejected': return 'Rejected';
      case 'pending':
      default: return 'Pending Approval';
    }
  }
}

class ExpenseEngine {

  static generateAccountingReference(type = 'EXP') {
    const yr = new Date().getFullYear();
    const shortId = uuidv4().split('-')[0].toUpperCase();
    return `${type}-${yr}-${shortId}`;
  }

  static async createExpense(payload, userId, options = {}) {
    const pool = getDB();
    const connection = options.connection || await pool.getConnection();
    let manageTransaction = false;

    if (!options.connection) {
      manageTransaction = true;
      await connection.beginTransaction();
    }

    try {
      // Validation Engine Logic
      const amount = Number(payload.amount || 0);
      const tax = Number(payload.tax || 0);
      
      if (amount < 0) throw new BusinessRuleError("Expense amount cannot be negative.");
      if (tax < 0) throw new BusinessRuleError("Expense tax cannot be negative.");

      if (payload.invoice_number) {
        // Invoice duplicate check
        const [invRows] = await connection.query(
          'SELECT id FROM expenses WHERE invoice_number = ? AND vendor = ? AND deleted_at IS NULL', 
          [payload.invoice_number, payload.vendor]
        );
        if (invRows.length > 0) {
          throw new ConflictError("Duplicate invoice number for this vendor.");
        }
      }

      const expenseId = this.generateAccountingReference('EXP');
      const accRef = this.generateAccountingReference('ACC');

      const logData = {
        expense_id: expenseId,
        accounting_reference: accRef,
        source_reference: payload.source_reference || null,
        source_module: payload.source_module || 'Manual',
        source_record_id: payload.source_record_id || null,
        vehicle_id: payload.vehicle_id || null,
        driver_id: payload.driver_id || null,
        trip_id: payload.trip_id || null,
        category: payload.category,
        cost_center_id: payload.cost_center_id || 'DEFAULT',
        vendor: payload.vendor || null,
        description: payload.description || 'Auto-generated expense',
        amount: amount,
        tax: tax,
        currency: payload.currency || 'INR',
        payment_method: payload.payment_method || null,
        invoice_number: payload.invoice_number || null,
        receipt_status: payload.receipt_status || 'Pending',
        date: payload.date || new Date().toISOString().slice(0, 10),
        status: payload.status || 'Pending Approval',
        created_by: userId
      };

      const [result] = await connection.query('INSERT INTO expenses SET ?', [logData]);
      const logId = result.insertId;

      await AuditLogger.log({
        action: "EXPENSE_CREATED",
        entity_type: "expense",
        entity_id: logId,
        user_id: userId,
        new_value: logData
      });

      if (manageTransaction) await connection.commit();

      return { id: logId, expense_id: expenseId, accounting_reference: accRef, data: logData };

    } catch (err) {
      if (manageTransaction) await connection.rollback();
      throw err;
    } finally {
      if (manageTransaction) connection.release();
    }
  }

  static async transitionStatus(id, newStatus, userId, connection = null) {
    const pool = getDB();
    const conn = connection || await pool.getConnection();
    let manageTransaction = !connection;

    if (manageTransaction) await conn.beginTransaction();

    try {
      const [rows] = await conn.query('SELECT status FROM expenses WHERE id = ? FOR UPDATE', [id]);
      if (rows.length === 0) throw new NotFoundError("Expense not found");
      const currentStatus = rows[0].status;

      if (currentStatus === newStatus) return true;

      // Lifecycle Rules
      const illegalTransitions = {
        'Draft': ['Posted', 'Archived'],
        'Pending Approval': ['Draft', 'Archived'],
        'Approved': ['Draft', 'Pending Approval'],
        'Posted': ['Draft', 'Pending Approval', 'Approved', 'Rejected'],
        'Archived': ['Draft', 'Pending Approval', 'Approved', 'Posted', 'Rejected'],
        'Rejected': ['Posted', 'Archived']
      };

      if (illegalTransitions[currentStatus]?.includes(newStatus)) {
        throw new BusinessRuleError(`Illegal state transition from ${currentStatus} to ${newStatus}.`);
      }

      let updateQuery = 'UPDATE expenses SET status = ?, updated_by = ?';
      const updateParams = [newStatus, userId];

      if (newStatus === 'Approved') {
        updateQuery += ', approved_by = ?';
        updateParams.push(userId);
      } else if (newStatus === 'Posted') {
        updateQuery += ', posted_by = ?';
        updateParams.push(userId);
      }
      updateQuery += ' WHERE id = ?';
      updateParams.push(id);

      await conn.query(updateQuery, updateParams);

      await AuditLogger.log({
        action: "EXPENSE_STATUS_UPDATED",
        entity_type: "expense",
        entity_id: id,
        user_id: userId,
        new_value: { status: newStatus },
        old_value: { status: currentStatus }
      });

      if (manageTransaction) await conn.commit();
      return true;

    } catch (err) {
      if (manageTransaction) await conn.rollback();
      throw err;
    } finally {
      if (manageTransaction) conn.release();
    }
  }

  // Backwards compatibility layer
  static async logExpense(payload, userId) {
    // Map the old payload style to new style
    const newPayload = { ...payload };
    
    if (newPayload.status) {
      newPayload.status = ExpenseStatusMapper.fromFrontend(newPayload.status);
    }

    const res = await this.createExpense(newPayload, userId);
    return res.id;
  }

  static async updateExpenseStatus(id, frontendStatus, userId) {
    const newStatus = ExpenseStatusMapper.fromFrontend(frontendStatus);
    
    // Check if newStatus is 'Rejected' but old status is 'Cleared'.
    // Handled by transitionStatus naturally now if it throws a transition error.
    
    await this.transitionStatus(id, newStatus, userId);
    
    const pool = getDB();
    const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ?', [id]);
    const expense = rows[0];
    
    // Return with mapped status to not break the frontend
    return { ...expense, status: ExpenseStatusMapper.toFrontend(expense.status) };
  }
}

export { ExpenseEngine as default, ExpenseStatusMapper };
