import { getDB } from "../config/db.js";
import FuelAnalyticsEngine from "./FuelAnalyticsEngine.js";

class FuelValidationEngine {
  /**
   * Evaluates a fuel logging payload against enterprise rules.
   * Does NOT mutate the database.
   * @param {Object} payload 
   * @returns {Object} { valid: boolean, errors: [string], warnings: [string] }
   */
  static async validate(payload) {
    const pool = getDB();
    const errors = [];
    const warnings = [];

    // Basic Validation
    if (!payload.vehicle_id) errors.push("Vehicle ID is required.");
    if (parseFloat(payload.liters) <= 0) errors.push("Fuel quantity must be greater than 0.");
    if (parseFloat(payload.cost) <= 0) errors.push("Total amount must be greater than 0.");
    if (parseFloat(payload.odometer_reading) < 0) errors.push("Odometer reading cannot be negative.");

    if (errors.length > 0) return { valid: false, errors, warnings };

    // Fetch context
    const [vehicleRows] = await pool.query(
      "SELECT mileage, status FROM vehicles WHERE id = ? AND deleted_at IS NULL",
      [payload.vehicle_id]
    );

    if (vehicleRows.length === 0) {
      errors.push("Vehicle not found, deleted, or retired.");
      return { valid: false, errors, warnings };
    }

    const vehicle = vehicleRows[0];

    // Status Validation
    if (vehicle.status === "In Shop") {
      errors.push("Vehicle is currently In Shop. Fuel entries are blocked during maintenance.");
    }

    // Odometer Validation
    const currentMileage = parseFloat(vehicle.mileage || 0);
    const newOdometer = parseFloat(payload.odometer_reading);

    if (newOdometer < currentMileage) {
      errors.push(`Odometer reading (${newOdometer}) cannot be less than current vehicle mileage (${currentMileage}).`);
    } else if (newOdometer > currentMileage + 5000) {
      warnings.push(`Unrealistic odometer jump detected (> 5000km since last recorded mileage).`);
    }

    // Fuel Policy Validation (Price per Litre)
    const pricePerLitre = parseFloat(payload.cost) / parseFloat(payload.liters);
    const maxPricePerLitre = 200; // configurable business policy limit
    if (pricePerLitre > maxPricePerLitre) {
      warnings.push(`Price per litre (₹${pricePerLitre.toFixed(2)}) exceeds maximum expected limit (₹${maxPricePerLitre}).`);
    }

    // Duplicate Detection
    const inputDate = payload.date ? new Date(payload.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    const [duplicateCheck] = await pool.query(
      `SELECT id FROM fuel_logs 
       WHERE vehicle_id = ? AND DATE(date) = DATE(?) AND (liters = ? OR odometer_reading = ?) AND deleted_at IS NULL LIMIT 1`,
      [payload.vehicle_id, inputDate, payload.liters, payload.odometer_reading]
    );

    if (duplicateCheck.length > 0) {
      warnings.push("Potential duplicate fuel entry detected today with identical volume or odometer.");
    }

    // Baseline Analytics Validation (Efficiency & Cost/KM)
    if (newOdometer > currentMileage) {
      const distance = newOdometer - currentMileage;
      const currentEfficiency = distance / parseFloat(payload.liters);
      const currentCostPerKm = parseFloat(payload.cost) / distance;

      const base = await FuelAnalyticsEngine.getVehicleAverages(payload.vehicle_id);

      if (base && base.expectedEfficiency) {
        if (currentEfficiency < base.expectedEfficiency * 0.8) {
          warnings.push(`Poor Fuel Efficiency: ${currentEfficiency.toFixed(1)} km/L is below 80% of vehicle average (${parseFloat(base.expectedEfficiency).toFixed(1)} km/L).`);
        }
      }
      if (base && base.expectedCostPerKm) {
        if (currentCostPerKm > base.expectedCostPerKm * 1.25) {
          warnings.push(`High Fuel Cost: ₹${currentCostPerKm.toFixed(2)}/km is >25% higher than vehicle average (₹${parseFloat(base.expectedCostPerKm).toFixed(2)}/km).`);
        }
      }
    }

    // Trip Validation
    if (payload.trip_id) {
      const [tripRows] = await pool.query(
        "SELECT vehicle_id FROM trips WHERE id = ? AND deleted_at IS NULL",
        [payload.trip_id]
      );
      if (tripRows.length === 0) {
        errors.push("Provided Trip ID does not exist.");
      } else if (tripRows[0].vehicle_id !== parseInt(payload.vehicle_id)) {
        errors.push("Provided Trip ID does not belong to the selected vehicle.");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export default FuelValidationEngine;
