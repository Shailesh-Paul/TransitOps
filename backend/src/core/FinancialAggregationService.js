import { getDB } from "../config/db.js";

class FinancialAggregationService {

  static async getBaseMetrics(filters = {}) {
    const pool = getDB();
    const { startDate, endDate, departmentId } = filters;
    let where = "WHERE e.deleted_at IS NULL AND e.status != 'Rejected'";
    const params = [];

    if (startDate && endDate) {
      where += " AND e.date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }
    
    // Total Operational Cost
    const [[opCost]] = await pool.query(`
      SELECT SUM(e.amount + e.tax) as total_cost 
      FROM expenses e 
      ${where}
    `, params);

    // Fuel Cost
    let fuelWhere = "WHERE deleted_at IS NULL";
    if (startDate && endDate) fuelWhere += ` AND date BETWEEN '${startDate}' AND '${endDate}'`;
    const [[fuelCost]] = await pool.query(`SELECT SUM(cost) as total_cost FROM fuel_logs ${fuelWhere}`);

    // Maintenance Cost
    let maintWhere = "WHERE deleted_at IS NULL";
    if (startDate && endDate) maintWhere += ` AND start_date BETWEEN '${startDate}' AND '${endDate}'`;
    const [[maintCost]] = await pool.query(`SELECT SUM(cost) as total_cost FROM maintenance_records ${maintWhere}`);

    // Trip Cost (assuming trips distance * flat rate or from expenses where category = 'Trip')
    const [[tripCost]] = await pool.query(`
      SELECT SUM(e.amount + e.tax) as total_cost 
      FROM expenses e 
      ${where} AND e.category = 'Trip'
    `, params);

    // Averages
    const [[tripCount]] = await pool.query(`SELECT COUNT(*) as count FROM trips WHERE status = 'completed'`);
    const [[vehicleCount]] = await pool.query(`SELECT COUNT(*) as count FROM vehicles WHERE status = 'Active'`);
    const [[driverCount]] = await pool.query(`SELECT COUNT(*) as count FROM drivers WHERE status = 'Active'`);
    const [[distCount]] = await pool.query(`
      SELECT SUM(r.distance_km) as total_dist 
      FROM trips t JOIN routes r ON t.route_id = r.id WHERE t.status = 'completed'
    `);

    return {
      totalOperationalCost: Number(opCost?.total_cost || 0),
      fuelCost: Number(fuelCost?.total_cost || 0),
      maintenanceCost: Number(maintCost?.total_cost || 0),
      tripCost: Number(tripCost?.total_cost || 0),
      totalDistance: Number(distCount?.total_dist || 1), // Avoid div by zero
      tripCount: Number(tripCount?.count || 1),
      vehicleCount: Number(vehicleCount?.count || 1),
      driverCount: Number(driverCount?.count || 1)
    };
  }

  static async getVehicleAnalytics(filters = {}) {
    const pool = getDB();
    
    const [vehicles] = await pool.query(`
      SELECT 
        v.id as vehicle_id, 
        v.registration_number, 
        SUM(e.amount + e.tax) as total_spend,
        COUNT(e.id) as expense_count
      FROM vehicles v
      LEFT JOIN expenses e ON v.id = e.vehicle_id AND e.deleted_at IS NULL AND e.status != 'Rejected'
      GROUP BY v.id, v.registration_number
      ORDER BY total_spend DESC
    `);
    
    // Monthly spend per vehicle
    const [monthly] = await pool.query(`
      SELECT 
        DATE_FORMAT(e.date, '%Y-%m') as month, 
        SUM(e.amount + e.tax) as total_spend
      FROM expenses e
      WHERE e.vehicle_id IS NOT NULL AND e.deleted_at IS NULL AND e.status != 'Rejected'
      GROUP BY DATE_FORMAT(e.date, '%Y-%m')
      ORDER BY month ASC
    `);
    
    return { vehicles, monthlyTrend: monthly };
  }

  static async getDriverAnalytics(filters = {}) {
    const pool = getDB();
    const [drivers] = await pool.query(`
      SELECT 
        d.id as driver_id, 
        d.first_name, 
        d.last_name, 
        SUM(e.amount + e.tax) as total_spend
      FROM drivers d
      LEFT JOIN expenses e ON d.id = e.driver_id AND e.deleted_at IS NULL AND e.status != 'Rejected'
      GROUP BY d.id, d.first_name, d.last_name
      ORDER BY total_spend DESC
    `);
    return drivers;
  }

  static async getBudgetsAnalytics() {
    const pool = getDB();
    const yr = new Date().getFullYear().toString();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const periodValue = `${yr}-${month}`;

    const [budgets] = await pool.query(`
      SELECT b.id, b.entity_type, b.entity_id, b.period_type, b.period_value, b.amount, b.currency,
             d.name as department_name
      FROM budgets b
      LEFT JOIN departments d ON b.entity_type = 'department' AND b.entity_id = d.id
      WHERE b.period_value = ? OR b.period_value = ?
    `, [periodValue, yr]);

    // Get current spend by department
    const [spends] = await pool.query(`
      SELECT d.id as department_id, d.name, SUM(e.amount + e.tax) as total_spend
      FROM departments d
      LEFT JOIN users u ON u.department_id = d.id
      LEFT JOIN expenses e ON e.created_by = u.id 
        AND DATE_FORMAT(e.date, '%Y-%m') = ? 
        AND e.deleted_at IS NULL AND e.status != 'Rejected'
      GROUP BY d.id, d.name
    `, [periodValue]);

    return { budgets, spends };
  }

  static async getMonthlyAnalytics() {
    const pool = getDB();
    
    const [monthly] = await pool.query(`
      SELECT 
        DATE_FORMAT(e.date, '%Y-%m') as month, 
        SUM(e.amount + e.tax) as total_spend
      FROM expenses e
      WHERE e.deleted_at IS NULL AND e.status != 'Rejected'
      GROUP BY DATE_FORMAT(e.date, '%Y-%m')
      ORDER BY month ASC
    `);
    
    const [distribution] = await pool.query(`
      SELECT category, SUM(amount + tax) as total_spend
      FROM expenses
      WHERE deleted_at IS NULL AND status != 'Rejected'
      GROUP BY category
    `);

    return { monthly, distribution };
  }

  static async getRankings() {
    const pool = getDB();
    
    const [topCostCenters] = await pool.query(`
      SELECT cost_center_id, SUM(amount + tax) as total_spend
      FROM expenses
      WHERE deleted_at IS NULL AND status != 'Rejected' AND cost_center_id IS NOT NULL
      GROUP BY cost_center_id
      ORDER BY total_spend DESC LIMIT 5
    `);
    
    const [highestFuel] = await pool.query(`
      SELECT v.registration_number, SUM(f.cost) as total_cost
      FROM fuel_logs f
      JOIN vehicles v ON f.vehicle_id = v.id
      WHERE f.deleted_at IS NULL
      GROUP BY v.id, v.registration_number
      ORDER BY total_cost DESC LIMIT 5
    `);

    return { topCostCenters, highestFuel };
  }
}

export default FinancialAggregationService;
