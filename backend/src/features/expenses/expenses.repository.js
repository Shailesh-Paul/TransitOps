import BaseRepository from "../../core/BaseRepository.js";
import { ExpenseStatusMapper } from "../../core/ExpenseEngine.js";

class ExpensesRepository extends BaseRepository {
  constructor() {
    super("expenses");
  }

  async findByIdWithDetails(id) {
    const expenseSql = `
      SELECT 
        e.*, 
        v.registration_number as vehicleName, v.make as vehicleMake, v.model as vehicleModel,
        d.first_name as driverFirstName, d.last_name as driverLastName, d.license_number as driverLicense,
        t.start_time as tripStartTime, t.end_time as tripEndTime,
        uc.first_name as createdByFirstName, uc.last_name as createdByLastName,
        ua.first_name as approvedByFirstName, ua.last_name as approvedByLastName,
        up.first_name as postedByFirstName, up.last_name as postedByLastName
      FROM expenses e
      LEFT JOIN vehicles v ON e.vehicle_id = v.id
      LEFT JOIN drivers d ON e.driver_id = d.id
      LEFT JOIN trips t ON e.trip_id = t.id
      LEFT JOIN users uc ON e.created_by = uc.id
      LEFT JOIN users ua ON e.approved_by = ua.id
      LEFT JOIN users up ON e.posted_by = up.id
      WHERE e.id = ? AND e.deleted_at IS NULL
    `;

    const [expenseRows] = await this.pool.query(expenseSql, [id]);
    
    if (expenseRows.length === 0) return null;
    const expense = expenseRows[0];

    const auditSql = `
      SELECT al.*, u.first_name as userFirstName, u.last_name as userLastName 
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.entity_type = 'expense' AND al.entity_id = ?
      ORDER BY al.created_at ASC
    `;
    const [auditRows] = await this.pool.query(auditSql, [id]);

    expense.audit_timeline = auditRows;
    expense.enterprise_status = expense.status; // Keep raw enterprise status
    expense.status = ExpenseStatusMapper.toFrontend(expense.status); // Map for UI compatibility

    return expense;
  }

  async findAllWithDetails({ page = 1, limit = 10, vehicle_id = null, driver_id = null, category = null, status = null } = {}) {
    const offset = (page - 1) * limit;
    const queryParams = [];
    let whereClause = "WHERE e.deleted_at IS NULL";

    if (vehicle_id) {
      whereClause += " AND e.vehicle_id = ?";
      queryParams.push(vehicle_id);
    }
    if (driver_id) {
      whereClause += " AND e.driver_id = ?";
      queryParams.push(driver_id);
    }
    if (category) {
      whereClause += " AND e.category = ?";
      queryParams.push(category);
    }
    if (status) {
      whereClause += " AND e.status = ?";
      queryParams.push(ExpenseStatusMapper.fromFrontend(status));
    }

    const dataSql = `
      SELECT e.*, v.registration_number as vehicleName, d.license_number as driverLicense 
      FROM expenses e 
      LEFT JOIN vehicles v ON e.vehicle_id = v.id 
      LEFT JOIN drivers d ON e.driver_id = d.id 
      ${whereClause}
      ORDER BY e.date DESC 
      LIMIT ? OFFSET ?
    `;

    const countSql = `SELECT COUNT(*) as total FROM expenses e ${whereClause}`;

    const [[dataRows], [countRows]] = await Promise.all([
      this.pool.query(dataSql, [...queryParams, Number(limit), Number(offset)]),
      this.pool.query(countSql, queryParams),
    ]);

    const total = countRows[0].total;

    // Map database statuses back to frontend expectations
    const mappedData = dataRows.map(row => ({
      ...row,
      status: ExpenseStatusMapper.toFrontend(row.status)
    }));

    return {
      data: mappedData,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOperationalCosts({ startDate, endDate }) {
    let whereClause = "WHERE deleted_at IS NULL AND status != 'Rejected'";
    const queryParams = [];

    if (startDate && endDate) {
      whereClause += " AND date BETWEEN ? AND ?";
      queryParams.push(startDate, endDate);
    }

    // 1. Total cost
    const [[totalCostRow]] = await this.pool.query(
      `SELECT SUM(amount) as total_operational_cost FROM expenses ${whereClause}`, 
      queryParams
    );

    // 2. Cost by Category
    const [categoryRows] = await this.pool.query(
      `SELECT category, SUM(amount) as total_cost FROM expenses ${whereClause} GROUP BY category ORDER BY total_cost DESC`, 
      queryParams
    );

    // 3. Cost by Vehicle
    const [vehicleRows] = await this.pool.query(
      `SELECT vehicle_id, v.registration_number, SUM(amount) as total_cost 
       FROM expenses e
       LEFT JOIN vehicles v ON e.vehicle_id = v.id
       ${whereClause.replace('deleted_at', 'e.deleted_at').replace('status', 'e.status').replace('date', 'e.date')}
       AND e.vehicle_id IS NOT NULL
       GROUP BY vehicle_id, v.registration_number 
       ORDER BY total_cost DESC LIMIT 10`, 
      queryParams
    );

    return {
      total_operational_cost: totalCostRow?.total_operational_cost || 0,
      breakdown_by_category: categoryRows,
      top_cost_vehicles: vehicleRows
    };
  }

  async getDashboardKpis(filters = {}) {
    // We want to calculate metrics across expenses, fuel, and maintenance.
    
    // 1. Fetch Aggregates
    const [[fuelRows]] = await this.pool.query(`SELECT SUM(cost) as total FROM fuel_logs WHERE deleted_at IS NULL`);
    const [[maintRows]] = await this.pool.query(`SELECT SUM(cost) as total FROM maintenance_records WHERE deleted_at IS NULL`);
    const [expenseRows] = await this.pool.query(`SELECT category, SUM(amount) as total FROM expenses WHERE deleted_at IS NULL GROUP BY category`);
    const [approvalRows] = await this.pool.query(`SELECT status, COUNT(*) as count FROM expenses WHERE deleted_at IS NULL GROUP BY status`);
    const [[tripRows]] = await this.pool.query(`SELECT SUM(r.distance_km) as total_distance FROM trips t JOIN routes r ON t.route_id = r.id WHERE t.status = 'completed'`);

    // Group Expense Categories
    let tripExpenses = 0;
    let otherExpenses = 0;
    let manualMaintenance = 0;
    
    expenseRows.forEach(row => {
      const cat = (row.category || '').toLowerCase();
      const val = Number(row.total);
      if (cat === 'toll' || cat === 'parking') tripExpenses += val;
      else if (cat === 'maintenance') manualMaintenance += val;
      else otherExpenses += val;
    });

    const fuelCost = Number(fuelRows?.total || 0);
    const maintenanceCost = Number(maintRows?.total || 0) + manualMaintenance;
    const manualTotal = tripExpenses + otherExpenses + manualMaintenance; // All manual expenses
    const totalOperationalCost = fuelCost + maintenanceCost + tripExpenses + otherExpenses;
    
    const totalDistance = Number(tripRows?.total_distance || 1);
    const costPerKm = totalOperationalCost / (totalDistance > 0 ? totalDistance : 1);

    // Parse Approvals using mapped frontend equivalents so UI keys (pending, cleared, rejected) remain untouched.
    const approvals = { pending: 0, cleared: 0, rejected: 0 };
    approvalRows.forEach(row => { 
      if (row.status) {
         const mappedStatus = ExpenseStatusMapper.toFrontend(row.status);
         if (approvals[mappedStatus] !== undefined) {
             approvals[mappedStatus] += row.count;
         }
      }
    });

    // 2. Recent Activity (Union of recent transactions)
    const recentQuery = `
      SELECT t.*, v.registration_number as vehicleName, u.email as createdByName
      FROM (
        (SELECT id, 'Manual Expense' as expense_type, 'Expenses' as source_module, vehicle_id, amount, status, created_by, date as transaction_date 
         FROM expenses WHERE deleted_at IS NULL)
        UNION ALL
        (SELECT id, 'Fuel' as expense_type, 'Fuel' as source_module, vehicle_id, cost as amount, 'Posted' as status, created_by, date as transaction_date 
         FROM fuel_logs WHERE deleted_at IS NULL)
        UNION ALL
        (SELECT id, type as expense_type, 'Maintenance' as source_module, vehicle_id, cost as amount, status, created_by, start_date as transaction_date 
         FROM maintenance_records WHERE deleted_at IS NULL AND cost IS NOT NULL)
      ) t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN users u ON t.created_by = u.id
      ORDER BY t.transaction_date DESC
      LIMIT 10
    `;
    const [recentActivity] = await this.pool.query(recentQuery);
    
    // Map recent activity statuses
    const mappedRecentActivity = recentActivity.map(txn => {
        if (txn.source_module === 'Expenses') {
            return { ...txn, status: ExpenseStatusMapper.toFrontend(txn.status) };
        }
        // Fuel and Maintenance already use their own or mapped strings, but we can ensure fuel is 'cleared' for UI.
        if (txn.source_module === 'Fuel') {
            return { ...txn, status: 'cleared' };
        }
        return txn;
    });

    // 3. Monthly Trend (Last 6 months)
    const monthlyQuery = `
      SELECT DATE_FORMAT(transaction_date, '%Y-%m') as month, SUM(amount) as total
      FROM (
        SELECT date as transaction_date, amount FROM expenses WHERE deleted_at IS NULL
        UNION ALL
        SELECT date as transaction_date, cost as amount FROM fuel_logs WHERE deleted_at IS NULL
        UNION ALL
        SELECT start_date as transaction_date, cost as amount FROM maintenance_records WHERE deleted_at IS NULL AND cost IS NOT NULL
      ) t
      WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `;
    const [monthlyTrend] = await this.pool.query(monthlyQuery);

    return {
      kpis: {
        totalOperationalCost,
        fuelCost,
        maintenanceCost,
        tripExpenses,
        otherExpenses,
        costPerKm
      },
      approvals,
      recentActivity: mappedRecentActivity,
      charts: {
        monthlyTrend,
        categoryBreakdown: [
          { name: 'Fuel', value: fuelCost },
          { name: 'Maintenance', value: maintenanceCost },
          { name: 'Trip/Toll', value: tripExpenses },
          { name: 'Other Manual', value: otherExpenses }
        ]
      }
    };
  }
}

export default new ExpensesRepository();
