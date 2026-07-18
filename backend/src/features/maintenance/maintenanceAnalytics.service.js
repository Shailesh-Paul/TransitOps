import { getDB } from "../../config/db.js";

class MaintenanceAnalyticsService {
  async getAnalytics(filters = {}) {
    const pool = getDB();

    // 1. Build Filter Clauses
    let filterClauses = [];
    let filterParams = [];

    // Base conditions for financial/completed stats
    let completedClauses = ["status = 'Completed'"];
    let completedParams = [];

    if (filters.year) {
      filterClauses.push("YEAR(created_at) = ?");
      filterParams.push(filters.year);

      completedClauses.push("YEAR(end_date) = ?");
      completedParams.push(filters.year);
    }
    if (filters.month) {
      filterClauses.push("MONTH(created_at) = ?");
      filterParams.push(filters.month);

      completedClauses.push("MONTH(end_date) = ?");
      completedParams.push(filters.month);
    }
    if (filters.vehicle_id) {
      filterClauses.push("vehicle_id = ?");
      filterParams.push(filters.vehicle_id);

      completedClauses.push("vehicle_id = ?");
      completedParams.push(filters.vehicle_id);
    }
    if (filters.category) {
      filterClauses.push("type = ?");
      filterParams.push(filters.category);

      completedClauses.push("type = ?");
      completedParams.push(filters.category);
    }
    if (filters.priority) {
      filterClauses.push("priority = ?");
      filterParams.push(filters.priority);

      completedClauses.push("priority = ?");
      completedParams.push(filters.priority);
    }
    if (filters.technician) {
      filterClauses.push("performed_by = ?");
      filterParams.push(filters.technician);

      completedClauses.push("performed_by = ?");
      completedParams.push(filters.technician);
    }

    const whereSql = filterClauses.length > 0 ? `WHERE ${filterClauses.join(" AND ")}` : "";
    const completedWhereSql = completedClauses.length > 0 ? `WHERE ${completedClauses.join(" AND ")}` : "WHERE status = 'Completed'";

    // 2. KPI Cards
    const [kpiRows] = await pool.query(`
      SELECT 
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as total_scheduled,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'Overdue' THEN 1 ELSE 0 END) as overdue
      FROM maintenance_records
      ${whereSql}
    `, filterParams);

    const [completedRows] = await pool.query(`
      SELECT 
        COUNT(id) as completed_this_month,
        SUM(cost) as total_cost,
        AVG(cost) as average_cost,
        AVG(downtime_minutes) as average_downtime
      FROM maintenance_records
      ${completedWhereSql}
    `, completedParams);

    const [vehicleStats] = await pool.query(`
      SELECT 
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as vehicles_available,
        COUNT(id) as total_vehicles,
        AVG(health_score) as avg_health_score
      FROM vehicles WHERE deleted_at IS NULL
    `);
    const totalVehicles = vehicleStats[0]?.total_vehicles || 1;
    const vehicleAvailability = ((vehicleStats[0]?.vehicles_available || 0) / totalVehicles) * 100;

    // 3. Cost Analytics
    const [monthlyCostRows] = await pool.query(`
      SELECT DATE_FORMAT(end_date, '%b %Y') as month_name, MONTH(end_date) as month_num, YEAR(end_date) as year_num, SUM(cost) as cost
      FROM maintenance_records
      ${completedWhereSql}
      GROUP BY year_num, month_num, month_name
      ORDER BY year_num, month_num
    `, completedParams);

    const [categoryCostRows] = await pool.query(`
      SELECT type as name, SUM(cost) as value
      FROM maintenance_records
      ${completedWhereSql}
      GROUP BY type
    `, completedParams);

    const [priorityCostRows] = await pool.query(`
      SELECT priority as name, COUNT(id) as value
      FROM maintenance_records
      ${completedWhereSql}
      GROUP BY priority
    `, completedParams);

    // 4. Downtime Analytics
    const [downtimeRows] = await pool.query(`
      SELECT 
        MAX(downtime_minutes) as longest_downtime
      FROM maintenance_records
      ${completedWhereSql}
    `, completedParams);

    // 5. Top Vehicles
    const [mostExpensiveVehicle] = await pool.query(`
      SELECT v.registration_number, SUM(m.cost) as total_cost
      FROM maintenance_records m
      JOIN vehicles v ON m.vehicle_id = v.id
      ${completedWhereSql.replace('WHERE', 'WHERE m.')}
      GROUP BY m.vehicle_id
      ORDER BY total_cost DESC
      LIMIT 1
    `, completedParams);

    const [mostFrequentVehicle] = await pool.query(`
      SELECT v.registration_number, COUNT(m.id) as total_services
      FROM maintenance_records m
      JOIN vehicles v ON m.vehicle_id = v.id
      ${completedWhereSql.replace('WHERE', 'WHERE m.')}
      GROUP BY m.vehicle_id
      ORDER BY total_services DESC
      LIMIT 1
    `, completedParams);

    const [highestDowntimeVehicle] = await pool.query(`
      SELECT v.registration_number, SUM(m.downtime_minutes) as total_downtime
      FROM maintenance_records m
      JOIN vehicles v ON m.vehicle_id = v.id
      ${completedWhereSql.replace('WHERE', 'WHERE m.')}
      GROUP BY m.vehicle_id
      ORDER BY total_downtime DESC
      LIMIT 1
    `, completedParams);

    const [mostReliableVehicle] = await pool.query(`
      SELECT v.registration_number, v.health_score
      FROM vehicles v
      WHERE v.deleted_at IS NULL
      ORDER BY v.health_score DESC
      LIMIT 1
    `);

    const [lowestHealthVehicles] = await pool.query(`
      SELECT registration_number, health_score
      FROM vehicles
      WHERE deleted_at IS NULL
      ORDER BY health_score ASC
      LIMIT 5
    `);

    // 6. Overdue Analytics
    const [overdueRows] = await pool.query(`
      SELECT 
        COUNT(id) as total_overdue,
        SUM(CASE WHEN priority = 'Critical' THEN 1 ELSE 0 END) as critical_overdue,
        MIN(scheduled_date) as oldest_overdue
      FROM maintenance_records
      WHERE status = 'Overdue'
    `);

    // 7. Calendar Data (Scheduled, Due Today, Overdue, Completed)
    const [calendarRows] = await pool.query(`
      SELECT id, type, status, priority, scheduled_date as date, work_order_number
      FROM maintenance_records
      WHERE status IN ('Scheduled', 'Overdue')
         OR (status = 'Completed' AND end_date >= DATE_SUB(NOW(), INTERVAL 30 DAY))
    `);

    // 8. Notification Summary
    const todayStr = new Date().toISOString().split('T')[0];
    const [notificationsRows] = await pool.query(`
      SELECT 
        SUM(CASE WHEN status = 'Scheduled' AND DATE(scheduled_date) > ? THEN 1 ELSE 0 END) as upcoming,
        SUM(CASE WHEN status = 'Scheduled' AND DATE(scheduled_date) = ? THEN 1 ELSE 0 END) as due_today,
        SUM(CASE WHEN status = 'Overdue' THEN 1 ELSE 0 END) as overdue,
        SUM(CASE WHEN status = 'Completed' AND DATE(end_date) = ? THEN 1 ELSE 0 END) as completed_today
      FROM maintenance_records
    `, [todayStr, todayStr, todayStr]);

    return {
      kpis: {
        totalScheduled: kpiRows[0]?.total_scheduled || 0,
        inProgress: kpiRows[0]?.in_progress || 0,
        completedThisMonth: completedRows[0]?.completed_this_month || 0,
        overdue: kpiRows[0]?.overdue || 0,
        totalCost: completedRows[0]?.total_cost || 0,
        averageCost: completedRows[0]?.average_cost || 0,
        averageDowntime: completedRows[0]?.average_downtime || 0,
        vehicleAvailability: vehicleAvailability.toFixed(1),
        avgHealthScore: vehicleStats[0]?.avg_health_score || 100
      },
      costAnalytics: {
        monthly: monthlyCostRows,
        category: categoryCostRows,
        priority: priorityCostRows,
      },
      downtimeAnalytics: {
        longestDowntime: downtimeRows[0]?.longest_downtime || 0,
      },
      topVehicles: {
        mostExpensive: mostExpensiveVehicle[0] || null,
        mostFrequent: mostFrequentVehicle[0] || null,
        highestDowntime: highestDowntimeVehicle[0] || null,
        mostReliable: mostReliableVehicle[0] || null,
        lowestHealth: lowestHealthVehicles || []
      },
      overdueAnalytics: {
        totalOverdue: overdueRows[0]?.total_overdue || 0,
        criticalOverdue: overdueRows[0]?.critical_overdue || 0,
        oldestOverdue: overdueRows[0]?.oldest_overdue || null
      },
      notifications: {
        upcoming: notificationsRows[0]?.upcoming || 0,
        dueToday: notificationsRows[0]?.due_today || 0,
        overdue: notificationsRows[0]?.overdue || 0,
        completedToday: notificationsRows[0]?.completed_today || 0
      },
      calendar: calendarRows
    };
  }
}

export default new MaintenanceAnalyticsService();
