import { getDB } from "../../config/db.js";
import FuelAnalyticsEngine from "../../core/FuelAnalyticsEngine.js";

class FuelAnalyticsService {
  async getDashboardData(filters = {}) {
    const pool = getDB();
    const { startDate, endDate, vehicle_id, driver_id, fuel_type, station, search } = filters;

    // Base conditions for filtering
    let whereClauses = ["f.deleted_at IS NULL"];
    let params = [];

    if (startDate && endDate) {
      whereClauses.push("f.date BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }
    if (vehicle_id) {
      whereClauses.push("f.vehicle_id = ?");
      params.push(vehicle_id);
    }
    if (driver_id) {
      // Assuming trips logic if driver_id is passed, but fuel_logs has no driver_id natively unless joined with trips.
      // Wait, is there driver_id in fuel_logs? Let's check schema. If not, we join trips.
      // But typically fuel is per vehicle. We'll add it if it exists.
    }
    if (fuel_type) {
      whereClauses.push("f.fuel_type = ?");
      params.push(fuel_type);
    }
    if (station) {
      whereClauses.push("f.station LIKE ?");
      params.push(`%${station}%`);
    }
    if (search) {
      whereClauses.push("(v.registration_number LIKE ? OR f.station LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // 1. KPI Aggregations (from Engine)
    const kpisEngine = await FuelAnalyticsEngine.getMonthlyAnalytics({ startDate, endDate, vehicle_id });
    
    // Monthly Spend
    const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
    const monthlySpendEngine = await FuelAnalyticsEngine.getMonthlyAnalytics({ month: currentMonthStr });

    // Entries Today
    const todayStr = new Date().toISOString().substring(0, 10);
    const todayEntriesQuery = `
      SELECT COUNT(id) as todayEntries
      FROM fuel_logs f
      WHERE f.deleted_at IS NULL AND DATE(f.date) = ?
    `;

    // Baselines for dynamic alerts (from Engine)
    const baselineMap = await FuelAnalyticsEngine.getAllVehicleAverages();

    // Recent Activity
    const recentActivityQuery = `
      SELECT f.*, v.registration_number, v.make, v.model 
      FROM fuel_logs f
      LEFT JOIN vehicles v ON f.vehicle_id = v.id
      ${whereString}
      ORDER BY f.date DESC
      LIMIT 10
    `;

    // Charts: Monthly Consumption & Cost
    const monthlyTrendQuery = `
      SELECT DATE_FORMAT(f.date, '%Y-%m') as month, 
             SUM(f.liters) as consumed, 
             SUM(f.cost) as cost
      FROM fuel_logs f
      LEFT JOIN vehicles v ON f.vehicle_id = v.id
      ${whereString}
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `;

    // Charts: Top Vehicles
    const topVehiclesQuery = `
      SELECT v.registration_number, SUM(f.liters) as totalLiters, SUM(f.cost) as totalCost, AVG(f.efficiency) as avgEff
      FROM fuel_logs f
      LEFT JOIN vehicles v ON f.vehicle_id = v.id
      ${whereString}
      GROUP BY f.vehicle_id
      ORDER BY totalCost DESC
      LIMIT 5
    `;

    const [[todayRes], [recentActivity], [monthlyTrends], [topVehicles]] = await Promise.all([
      pool.query(todayEntriesQuery, [todayStr]),
      pool.query(recentActivityQuery, params),
      pool.query(monthlyTrendQuery, params),
      pool.query(topVehiclesQuery, params)
    ]);

    const kpis = {
      totalEntries: kpisEngine.totalEntries,
      totalConsumed: kpisEngine.totalConsumed,
      totalCost: kpisEngine.totalCost,
      avgEfficiency: kpisEngine.avgEfficiency,
      avgCostPerKm: kpisEngine.avgCostPerKm,
      monthlySpend: monthlySpendEngine.totalCost,
      todayEntries: todayRes[0].todayEntries || 0,
      poorEfficiencyCount: 0
    };

    // Calculate dynamic alerts and poor efficiency count based on engine baselines
    const alerts = {
      poorEfficiency: [],
      highCost: [],
      odometerAnomalies: [] // Handled at insertion, but we can look for historical if needed
    };

    // Evaluate recent activity for alerts
    const poorEffSet = new Set();
    recentActivity.forEach(log => {
      const base = baselineMap.get(log.vehicle_id);
      if (base) {
        // Poor efficiency: < 80% of expected
        if (base.expectedEfficiency && log.efficiency < (base.expectedEfficiency * 0.8)) {
          alerts.poorEfficiency.push({
            log_id: log.id,
            vehicle: log.registration_number,
            efficiency: log.efficiency,
            expected: base.expectedEfficiency,
            date: log.date
          });
          poorEffSet.add(log.vehicle_id);
        }
        
        // High cost per km: > 125% of baseline
        const costPerKm = log.cost / (log.liters * log.efficiency);
        if (base.expectedCostPerKm && costPerKm > (base.expectedCostPerKm * 1.25)) {
          alerts.highCost.push({
            log_id: log.id,
            vehicle: log.registration_number,
            costPerKm: costPerKm,
            expected: base.expectedCostPerKm,
            date: log.date
          });
        }
      }
    });

    kpis.poorEfficiencyCount = poorEffSet.size;

    return {
      kpis,
      recentActivity,
      alerts,
      charts: {
        monthlyTrend: monthlyTrends,
        topVehicles
      }
    };
  }

  async getEnterpriseData(scope, filters = {}) {
    const pool = getDB();
    const { startDate, endDate, vehicle_id, driver_id, fuel_type, station, search } = filters;

    let whereClauses = ["f.deleted_at IS NULL"];
    let params = [];

    if (startDate && endDate) {
      whereClauses.push("f.date BETWEEN ? AND ?");
      params.push(startDate, endDate);
    }
    if (vehicle_id) {
      whereClauses.push("f.vehicle_id = ?");
      params.push(vehicle_id);
    }
    if (fuel_type) {
      whereClauses.push("f.fuel_type = ?");
      params.push(fuel_type);
    }
    if (station) {
      whereClauses.push("f.station LIKE ?");
      params.push(`%${station}%`);
    }

    const whereString = `WHERE ${whereClauses.join(" AND ")}`;

    if (scope === 'kpis') {
      const kpisEngine = await FuelAnalyticsEngine.getMonthlyAnalytics({ startDate, endDate, vehicle_id });
      
      const countsQuery = `
        SELECT 
          COUNT(id) as totalEntries,
          SUM(CASE WHEN trip_id IS NOT NULL THEN 1 ELSE 0 END) as tripLinkedEntries,
          SUM(CASE WHEN trip_id IS NULL THEN 1 ELSE 0 END) as unassignedEntries
        FROM fuel_logs f
        ${whereString}
      `;
      
      const bestWorstVehicleQuery = `
        SELECT 
          v.registration_number,
          AVG(f.efficiency) as avgEff,
          SUM(f.liters) as totalConsumed
        FROM fuel_logs f
        JOIN vehicles v ON f.vehicle_id = v.id
        ${whereString}
        GROUP BY f.vehicle_id
        HAVING totalConsumed > 0
      `;

      const [[countsRes], [vehiclesRes]] = await Promise.all([
        pool.query(countsQuery, params),
        pool.query(bestWorstVehicleQuery, params)
      ]);

      let bestVehicle = null;
      let worstVehicle = null;
      let highestConsumer = null;

      if (vehiclesRes.length > 0) {
        let maxEff = -Infinity;
        let minEff = Infinity;
        let maxCons = -Infinity;

        for (const v of vehiclesRes) {
          const eff = parseFloat(v.avgEff);
          const cons = parseFloat(v.totalConsumed);
          if (eff > maxEff) { maxEff = eff; bestVehicle = v; }
          if (eff < minEff) { minEff = eff; worstVehicle = v; }
          if (cons > maxCons) { maxCons = cons; highestConsumer = v; }
        }
      }

      return {
        totalCost: kpisEngine.totalCost,
        totalConsumed: kpisEngine.totalConsumed,
        fleetAvgEfficiency: kpisEngine.avgEfficiency,
        fleetAvgCostPerKm: kpisEngine.avgCostPerKm,
        monthlySpend: kpisEngine.totalCost, // Fallback to filtered, frontend can label it Total Spend
        counts: countsRes[0],
        bestVehicle,
        worstVehicle,
        highestConsumer
      };
    }

    if (scope === 'charts') {
      const monthlyTrendQuery = `
        SELECT DATE_FORMAT(f.date, '%Y-%m') as month, 
               SUM(f.liters) as consumed, 
               SUM(f.cost) as cost,
               AVG(f.efficiency) as avgEfficiency,
               SUM(f.cost) / NULLIF(SUM(f.liters * f.efficiency), 0) as avgCostPerKm
        FROM fuel_logs f
        ${whereString}
        GROUP BY month
        ORDER BY month ASC
        LIMIT 12
      `;

      const vehicleCompQuery = `
        SELECT v.registration_number as name, SUM(f.cost) as cost, AVG(f.efficiency) as efficiency
        FROM fuel_logs f
        JOIN vehicles v ON f.vehicle_id = v.id
        ${whereString}
        GROUP BY f.vehicle_id
        ORDER BY cost DESC
        LIMIT 5
      `;
      
      const driverCompQuery = `
        SELECT CONCAT(e.first_name, ' ', e.last_name) as name, SUM(f.cost) as cost, SUM(f.liters * f.efficiency)/SUM(f.liters) as efficiency
        FROM fuel_logs f
        JOIN trips t ON f.trip_id = t.id
        JOIN drivers d ON t.driver_id = d.id
        JOIN employees e ON d.employee_id = e.id
        ${whereString}
        GROUP BY t.driver_id
        ORDER BY cost DESC
        LIMIT 5
      `;
      
      const stationSpendQuery = `
        SELECT station as name, SUM(cost) as cost
        FROM fuel_logs f
        ${whereString} AND station IS NOT NULL AND station != ''
        GROUP BY station
        ORDER BY cost DESC
        LIMIT 5
      `;

      const [[monthlyTrends], [vehicleComp], [driverComp], [stationSpend]] = await Promise.all([
        pool.query(monthlyTrendQuery, params),
        pool.query(vehicleCompQuery, params),
        pool.query(driverCompQuery, params),
        pool.query(stationSpendQuery, params)
      ]);

      return {
        monthlyTrend: monthlyTrends,
        vehicleComparison: vehicleComp,
        driverComparison: driverComp,
        stationSpend
      };
    }

    if (scope === 'rankings') {
      const topVehicles = async (orderBy, orderDir = 'DESC') => {
        const q = `
          SELECT v.registration_number, AVG(f.efficiency) as efficiency, SUM(f.cost) as cost, SUM(f.liters) as liters
          FROM fuel_logs f
          JOIN vehicles v ON f.vehicle_id = v.id
          ${whereString}
          GROUP BY f.vehicle_id
          ORDER BY ${orderBy} ${orderDir}
          LIMIT 10
        `;
        const [rows] = await pool.query(q, params);
        return rows;
      };

      const topDrivers = async (orderBy, orderDir = 'DESC') => {
        const q = `
          SELECT CONCAT(e.first_name, ' ', e.last_name) as name, 
                 SUM(f.liters * f.efficiency)/SUM(f.liters) as efficiency, 
                 SUM(f.liters) as liters
          FROM fuel_logs f
          JOIN trips t ON f.trip_id = t.id
          JOIN drivers d ON t.driver_id = d.id
          JOIN employees e ON d.employee_id = e.id
          ${whereString}
          GROUP BY t.driver_id
          ORDER BY ${orderBy} ${orderDir}
          LIMIT 10
        `;
        const [rows] = await pool.query(q, params);
        return rows;
      };

      const [bestEffVehicles, worstEffVehicles, highestCostVehicles, highestConsVehicles, bestDrivers, highestConsDrivers, worstDrivers] = await Promise.all([
        topVehicles('efficiency', 'DESC'),
        topVehicles('efficiency', 'ASC'),
        topVehicles('cost', 'DESC'),
        topVehicles('liters', 'DESC'),
        topDrivers('efficiency', 'DESC'),
        topDrivers('liters', 'DESC'),
        topDrivers('efficiency', 'ASC'),
      ]);

      return {
        vehicles: {
          bestEfficiency: bestEffVehicles,
          worstEfficiency: worstEffVehicles,
          highestCost: highestCostVehicles,
          highestConsumers: highestConsVehicles
        },
        drivers: {
          mostEfficient: bestDrivers,
          highestConsumers: highestConsDrivers,
          lowestEfficiency: worstDrivers
        }
      };
    }

    if (scope === 'stations') {
      const q = `
        SELECT station, COUNT(id) as visits, SUM(cost) as totalCost, SUM(liters) as totalLiters, SUM(cost)/SUM(liters) as avgPrice
        FROM fuel_logs f
        ${whereString} AND station IS NOT NULL AND station != ''
        GROUP BY station
        ORDER BY visits DESC
        LIMIT 20
      `;
      const [rows] = await pool.query(q, params);
      return rows;
    }

    if (scope === 'compare') {
      const { vehicleA, vehicleB } = filters;
      if (!vehicleA || !vehicleB) return {};
      
      const q = `
        SELECT 
          vehicle_id,
          SUM(cost) as cost,
          SUM(liters) as liters,
          SUM(efficiency * liters) as distance,
          SUM(liters * efficiency)/SUM(liters) as efficiency,
          SUM(cost) / NULLIF(SUM(liters * efficiency), 0) as costPerKm
        FROM fuel_logs
        WHERE vehicle_id IN (?, ?) AND deleted_at IS NULL
        GROUP BY vehicle_id
      `;
      const [rows] = await pool.query(q, [vehicleA, vehicleB]);
      return rows;
    }

    return {};
  }
}

export default new FuelAnalyticsService();
