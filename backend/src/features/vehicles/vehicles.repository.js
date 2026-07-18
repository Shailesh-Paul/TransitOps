import BaseRepository from "../../core/BaseRepository.js";

class VehicleRepository extends BaseRepository {
  constructor() {
    super("vehicles");
  }

  async findByRegistration(registrationNumber) {
    const [rows] = await this.pool.query(
      "SELECT * FROM vehicles WHERE registration_number = ? AND deleted_at IS NULL",
      [registrationNumber]
    );
    return rows[0] || null;
  }

  async findAvailable() {
    // A vehicle is available if it is active, not deleted, and NOT currently assigned 
    // to an active trip or maintenance
    const sql = `
      SELECT v.* 
      FROM vehicles v
      WHERE v.status = 'Available' 
        AND v.deleted_at IS NULL
        AND v.id NOT IN (
          SELECT vehicle_id FROM trips WHERE status IN ('Dispatched', 'In Progress')
        )
        AND v.id NOT IN (
          SELECT vehicle_id FROM maintenance_records WHERE status IN ('Requested', 'Queued', 'In Progress')
        )
    `;
    const [rows] = await this.pool.query(sql);
    return rows || [];
  }

  async getTimeline(vehicleId) {
    // UNION of trips, maintenance_records, and fuel_logs
    const sql = `
      SELECT 
        'trip' AS event_type,
        id AS event_id,
        status AS event_status,
        created_at AS event_date,
        CONCAT('Trip ', status) AS description
      FROM trips
      WHERE vehicle_id = ?

      UNION ALL

      SELECT 
        'maintenance' AS event_type,
        id AS event_id,
        status AS event_status,
        created_at AS event_date,
        CONCAT(type, ' maintenance ', status) AS description
      FROM maintenance_records
      WHERE vehicle_id = ?

      UNION ALL

      SELECT 
        'fuel' AS event_type,
        id AS event_id,
        'completed' AS event_status,
        date AS event_date,
        CONCAT('Refueled ', liters, 'L at ', station) AS description
      FROM fuel_logs
      WHERE vehicle_id = ?

      ORDER BY event_date DESC
    `;
    const [rows] = await this.pool.query(sql, [vehicleId, vehicleId, vehicleId]);
    return rows;
  }

  async getMaintenanceStats(vehicleId) {
    const sql = `
      SELECT 
        COUNT(*) as total_count,
        MAX(end_date) as last_service_date,
        SUM(cost) as total_cost,
        AVG(cost) as average_cost,
        AVG(downtime_minutes) as average_downtime,
        MAX(downtime_minutes) as longest_downtime
      FROM maintenance_records
      WHERE vehicle_id = ? AND status = 'Completed' AND deleted_at IS NULL
    `;
    const [statsRows] = await this.pool.query(sql, [vehicleId]);

    const typeSql = `
      SELECT type
      FROM maintenance_records
      WHERE vehicle_id = ? AND status = 'Completed' AND deleted_at IS NULL
      GROUP BY type
      ORDER BY COUNT(*) DESC
      LIMIT 1
    `;
    const [typeRows] = await this.pool.query(typeSql, [vehicleId]);

    return {
      total_count: statsRows[0]?.total_count || 0,
      last_service_date: statsRows[0]?.last_service_date || null,
      total_cost: statsRows[0]?.total_cost || 0,
      average_cost: statsRows[0]?.average_cost || 0,
      average_downtime: statsRows[0]?.average_downtime || 0,
      longest_downtime: statsRows[0]?.longest_downtime || 0,
      most_frequent_type: typeRows[0]?.type || "N/A"
    };
  }
}

export default new VehicleRepository();
