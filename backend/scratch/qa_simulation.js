import dotenv from 'dotenv';
dotenv.config();
import { connectDB, getDB } from '../src/config/db.js';
import * as vehicleService from '../src/features/vehicles/vehicles.service.js';
import * as driversService from '../src/features/drivers/drivers.service.js';
import * as tripsService from '../src/features/trips/trips.service.js';
import * as maintenanceService from '../src/features/maintenance/maintenance.service.js';
import * as expensesService from '../src/features/expenses/expenses.service.js';
import * as fuelService from '../src/features/fuel/fuel.service.js';
import dashboardRepository from '../src/features/dashboard/dashboard.repository.js';

async function runQA() {
  await connectDB();
  const pool = getDB();
  const report = [];

  const log = (step, result, details = null) => {
    report.push({ step, result, details });
    console.log(`[${result}] ${step}`);
    if (details) console.log(`   -> ${JSON.stringify(details)}`);
  };

  try {
    const fleetManagerUserId = 2; // Auth bypass
    let vehicleId, driverId, routeId, tripId, maintenanceId;

    // PRE-REQ: Create a Route
    try {
      const [routeRes] = await pool.query(`INSERT INTO routes (name, origin, destination, distance_km) VALUES ('Test Route', 'A', 'B', 100)`);
      routeId = routeRes.insertId;
    } catch(e) { console.log("Failed to create route", e.message); }

    // STEP 1
    try {
      const v = await vehicleService.createVehicle({
        make: 'Van',
        model: '05',
        registration_number: 'MP04AB1234',
        capacity: 500,
        fuel_type: 'Diesel' // removed 'type'
      });
      vehicleId = v.id;
      log('Step 1: Register Vehicle', 'SUCCESS', { vehicleId });
    } catch (e) { log('Step 1: Register Vehicle', 'FAILED', e.message); }

    // STEP 2
    try {
      // Create user then employee
      const [userRes] = await pool.query(`INSERT INTO users (email, password_hash, role_id) VALUES ('alex@test.com', 'hash', 6)`);
      const userId = userRes.insertId;
      const [empRes] = await pool.query(`INSERT INTO employees (user_id, first_name, last_name, department_id) VALUES (?, 'Alex', 'Driver', 1)`, [userId]);
      const employeeId = empRes.insertId;

      const d = await driversService.createDriver({
        employee_id: employeeId,
        license_number: 'DL-458965214',
        license_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      driverId = d.id;
      log('Step 2: Register Driver', 'SUCCESS', { driverId });
    } catch (e) { log('Step 2: Register Driver', 'FAILED', e.message); }

    // STEP 3
    try {
      const t = await tripsService.createTrip({
        vehicle_id: vehicleId,
        driver_id: driverId,
        route_id: routeId,
        cargo_weight: 450,
        start_time: new Date().toISOString()
      }, fleetManagerUserId);
      tripId = t; 
      log('Step 3: Create Trip', 'SUCCESS', { tripId });
    } catch (e) { log('Step 3: Create Trip', 'FAILED', e.message); }

    // STEP 4
    try {
      await tripsService.dispatchTrip(tripId, fleetManagerUserId);
      log('Step 4: Dispatch Trip', 'SUCCESS');
    } catch (e) { log('Step 4: Dispatch Trip', 'FAILED', e.message); }

    // STEP 5
    try {
      await tripsService.completeTrip(tripId, {
        final_odometer: 1500,
        fuel_consumed: 10,
        distance_travelled: 100
      }, fleetManagerUserId);
      log('Step 5: Complete Trip', 'SUCCESS');
    } catch (e) { log('Step 5: Complete Trip', 'FAILED', e.message); }

    // STEP 6
    try {
      const m = await maintenanceService.createMaintenanceRecord({
        vehicle_id: vehicleId,
        type: 'Repair',
        description: 'Routine check',
        estimated_cost: 200,
        priority: 'Normal'
      }, fleetManagerUserId);
      maintenanceId = m.id || m;
      log('Step 6: Create Maintenance', 'SUCCESS', { maintenanceId });
    } catch (e) { log('Step 6: Create Maintenance', 'FAILED', e.message); }

    // STEP 7
    try {
      if (maintenanceId) {
        await maintenanceService.updateMaintenanceStatus(maintenanceId, 'Completed', 180, fleetManagerUserId);
        log('Step 7: Close Maintenance', 'SUCCESS');
      }
    } catch (e) { log('Step 7: Close Maintenance', 'FAILED', e.message); }

    // STEP 8
    try {
      await fuelService.createFuelLog({
        vehicle_id: vehicleId,
        driver_id: driverId,
        liters: 20,
        cost: 1500,
        odometer_reading: 1600,
        station_name: 'Test Station'
      }, fleetManagerUserId);
      log('Step 8: Add Fuel Log', 'SUCCESS');
    } catch (e) { log('Step 8: Add Fuel Log', 'FAILED', e.message); }

    // STEP 9
    try {
      await expensesService.createExpense({
        vehicle_id: vehicleId,
        driver_id: driverId,
        trip_id: tripId,
        category: 'Toll',
        amount: 50,
        description: 'Highway toll'
      }, fleetManagerUserId);
      log('Step 9: Create Expense', 'SUCCESS');
    } catch (e) { log('Step 9: Create Expense', 'FAILED', e.message); }

    // STEP 10
    try {
      const kpis = await dashboardRepository.getEnterpriseKPIs();
      log('Step 10: Dashboard KPIs Generated', 'SUCCESS');
    } catch (e) { log('Step 10: Dashboard KPIs Generated', 'FAILED', e.message); }

  } catch(e) {
    console.error("Simulation crashed critically:", e);
  } finally {
    pool.end();
  }
}
runQA();
