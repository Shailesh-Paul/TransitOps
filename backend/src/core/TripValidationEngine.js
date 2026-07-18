import { ConflictError, BusinessRuleError, NotFoundError } from "./errors.js";

class TripValidationEngine {
  
  static validateTripStatus(trip) {
    if (trip.status !== 'Assigned' && trip.status !== 'Draft') {
      throw new BusinessRuleError(`Cannot dispatch trip in status: ${trip.status}`);
    }
  }

  static validateRoute(route) {
    if (!route) throw new NotFoundError("Route not found");
    if (route.is_active !== 1 && route.is_active !== true) {
      throw new ConflictError("Selected route is not active");
    }
  }

  static validateDriver(driver) {
    if (!driver) throw new NotFoundError("Driver not found");
    if (driver.status === 'Suspended') throw new ConflictError("Driver is suspended");
    if (driver.status === 'On Trip') throw new ConflictError("Driver is already on a trip");
    if (!driver.license_expiry) throw new ConflictError("Driver license expiry date is missing and must be recorded before dispatch");
    if (new Date(driver.license_expiry) < new Date()) throw new ConflictError("Driver license is expired");
  }

  static validateVehicle(vehicle) {
    if (!vehicle) throw new NotFoundError("Vehicle not found");
    if (vehicle.status === 'In Shop') throw new ConflictError("Vehicle is in maintenance");
    if (vehicle.status === 'On Trip') throw new ConflictError("Vehicle is already on a trip");
    if (vehicle.status === 'Retired') throw new ConflictError("Vehicle is retired");
  }

  static validateCapacity(vehicle, trip) {
    if (trip.cargo_weight && vehicle.capacity) {
      if (Number(trip.cargo_weight) > Number(vehicle.capacity)) {
        throw new BusinessRuleError(`Cargo weight (${trip.cargo_weight}) exceeds vehicle capacity (${vehicle.capacity})`);
      }
    }
  }

  static async validateConcurrency(connection, trip) {
    if (trip.start_time && trip.end_time) {
      const [overlap] = await connection.query(`
        SELECT id FROM trips 
        WHERE (vehicle_id = ? OR driver_id = ?) 
        AND status IN ('Dispatched', 'In Progress')
        AND start_time < ? 
        AND end_time > ?
        AND id != ?
      `, [trip.vehicle_id, trip.driver_id, trip.end_time, trip.start_time, trip.id]);
      
      if (overlap.length > 0) {
        throw new ConflictError("Scheduling overlap: One Driver/Vehicle can only have one active trip at a time");
      }
    }
  }

  /**
   * Master orchestration method called by DispatchEngine
   */
  static async validateForDispatch(trip, connection) {
    // 1. Basic Trip Status Validation
    this.validateTripStatus(trip);

    if (!trip.driver_id || !trip.vehicle_id || !trip.route_id) {
      throw new BusinessRuleError("Trip must have a Route, Driver, and Vehicle assigned before dispatching");
    }

    // 2. Fetch required entities
    const [driverRows] = await connection.query('SELECT status, license_expiry FROM drivers WHERE id = ? FOR UPDATE', [trip.driver_id]);
    const [vehicleRows] = await connection.query('SELECT status, capacity FROM vehicles WHERE id = ? FOR UPDATE', [trip.vehicle_id]);
    const [routeRows] = await connection.query('SELECT is_active FROM routes WHERE id = ?', [trip.route_id]);

    // 3. Execute Validations
    this.validateRoute(routeRows[0]);
    this.validateDriver(driverRows[0]);
    this.validateVehicle(vehicleRows[0]);
    this.validateCapacity(vehicleRows[0], trip);
    
    // 4. Concurrency Check (Overlaps)
    await this.validateConcurrency(connection, trip);
  }
}

export default TripValidationEngine;
