import BaseRepository from '../../core/BaseRepository.js';

class DashboardRepository extends BaseRepository {
  constructor() {
    super('dashboard_dummy');
  }

  async getEnterpriseKPIs({ startDate, endDate } = {}) {
    const filters = [];
    let dateFilterTrips = "";
    let dateFilterFuel = "";
    let dateFilterExpenses = "";

    if (startDate && endDate) {
      dateFilterTrips = "AND start_time BETWEEN ? AND ?";
      dateFilterFuel = "AND date BETWEEN ? AND ?";
      dateFilterExpenses = "AND date BETWEEN ? AND ?";
      filters.push(startDate, endDate);
    }

    // 1. Vehicle Metrics & Utilization
    const [vehicleRows] = await this.pool.query(
      `SELECT 
         COUNT(*) as total_vehicles,
         SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available_vehicles,
         SUM(CASE WHEN status = 'On Trip' THEN 1 ELSE 0 END) as active_trips,
         SUM(CASE WHEN status = 'In Shop' THEN 1 ELSE 0 END) as in_shop_vehicles
       FROM vehicles WHERE deleted_at IS NULL`
    );

    const vehicleData = vehicleRows[0];
    const fleetUtilization = vehicleData.total_vehicles > 0 
      ? ((vehicleData.active_trips / vehicleData.total_vehicles) * 100).toFixed(2) 
      : "0.00";

    // 2. Driver Availability
    const [driverRows] = await this.pool.query(
      `SELECT 
         COUNT(*) as total_drivers,
         SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available_drivers,
         SUM(CASE WHEN status = 'On Trip' THEN 1 ELSE 0 END) as on_trip_drivers,
         SUM(CASE WHEN status = 'Off Duty' THEN 1 ELSE 0 END) as off_duty_drivers
       FROM drivers WHERE deleted_at IS NULL`
    );

    // 3. Maintenance Queue
    const [maintenanceRows] = await this.pool.query(
      `SELECT COUNT(*) as queue_size 
       FROM maintenance_records 
       WHERE status IN ('Queued', 'In Progress') AND deleted_at IS NULL`
    );

    // 4. Financials: Fuel Cost & Expenses
    const queryParams = filters.length > 0 ? filters : [];
    
    const [fuelRows] = await this.pool.query(
      `SELECT SUM(cost) as total_fuel_cost FROM fuel_logs WHERE deleted_at IS NULL ${dateFilterFuel}`, 
      queryParams
    );

    const [expenseRows] = await this.pool.query(
      `SELECT SUM(amount) as total_expenses FROM expenses WHERE status != 'Rejected' AND deleted_at IS NULL ${dateFilterExpenses}`, 
      queryParams
    );

    const [maintenanceCostRows] = await this.pool.query(
      `SELECT SUM(cost) as total_maintenance_cost FROM maintenance_records WHERE status = 'Completed' AND deleted_at IS NULL`
    );

    // 5. Monthly Trips (Last 12 months, regardless of filter)
    const [monthlyTrips] = await this.pool.query(
      `SELECT DATE_FORMAT(start_time, '%Y-%m') as month, COUNT(*) as trip_count 
       FROM trips 
       WHERE deleted_at IS NULL AND start_time IS NOT NULL
       GROUP BY month 
       ORDER BY month DESC 
       LIMIT 12`
    );

    // 6. Vehicle ROI (Total Cost per Vehicle: Fuel + Expenses)
    const [roiRows] = await this.pool.query(
      `SELECT 
         v.id as vehicle_id, 
         v.registration_number,
         IFNULL(SUM(f.cost), 0) + IFNULL(SUM(e.amount), 0) + IFNULL(SUM(m.cost), 0) as total_operational_cost
       FROM vehicles v
       LEFT JOIN fuel_logs f ON v.id = f.vehicle_id AND f.deleted_at IS NULL
       LEFT JOIN expenses e ON v.id = e.vehicle_id AND e.status != 'Rejected' AND e.deleted_at IS NULL
       LEFT JOIN maintenance_records m ON v.id = m.vehicle_id AND m.status = 'Completed' AND m.deleted_at IS NULL
       WHERE v.deleted_at IS NULL
       GROUP BY v.id, v.registration_number
       ORDER BY total_operational_cost DESC
       LIMIT 10`
    );

    return {
      fleet_utilization_percent: parseFloat(fleetUtilization),
      vehicles: {
        total: vehicleData.total_vehicles,
        available: vehicleData.available_vehicles,
        active_trips: vehicleData.active_trips,
        in_shop: vehicleData.in_shop_vehicles,
      },
      drivers: {
        total: driverRows[0].total_drivers,
        available: driverRows[0].available_drivers,
        on_trip: driverRows[0].on_trip_drivers,
        off_duty: driverRows[0].off_duty_drivers,
      },
      maintenance_queue: maintenanceRows[0].queue_size,
      financials: {
        total_fuel_cost: fuelRows[0].total_fuel_cost || 0,
        total_expenses: expenseRows[0].total_expenses || 0,
        total_maintenance_cost: maintenanceCostRows[0].total_maintenance_cost || 0,
        combined_cost: (fuelRows[0].total_fuel_cost || 0) + (expenseRows[0].total_expenses || 0) + (maintenanceCostRows[0].total_maintenance_cost || 0)
      },
      monthly_trips: monthlyTrips,
      vehicle_roi: roiRows
    };
  }
}

export default new DashboardRepository();
