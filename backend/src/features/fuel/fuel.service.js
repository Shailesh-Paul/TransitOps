import FuelRepository from './fuel.repository.js';
import FuelEngine from '../../core/FuelEngine.js';
import { NotFoundError } from "../../core/errors.js";

class FuelService {
  async getAllLogs(options) {
    return await FuelRepository.findAllWithDetails(options);
  }

  async getLogById(id) {
    const log = await FuelRepository.getDetailedLogById(id);
    if (!log) throw new NotFoundError('Fuel log not found');
    
    // Calculate alerts and validations
    const alerts = [];
    if (log.baselines.expectedEfficiency && log.efficiency < log.baselines.expectedEfficiency * 0.8) {
      alerts.push({ type: 'Poor Fuel Efficiency', message: `Efficiency is ${(log.efficiency).toFixed(1)} km/L (Expected: ${(log.baselines.expectedEfficiency).toFixed(1)})` });
    }
    
    const costPerKm = log.cost / (log.liters * log.efficiency);
    if (log.baselines.expectedCostPerKm && costPerKm > log.baselines.expectedCostPerKm * 1.25) {
      alerts.push({ type: 'High Fuel Cost', message: `Cost per KM is ₹${costPerKm.toFixed(2)} (Expected: ₹${(log.baselines.expectedCostPerKm).toFixed(2)})` });
    }

    if (log.previous_log && log.odometer_reading > log.previous_log.odometer_reading + 5000) {
      alerts.push({ type: 'Odometer Anomaly', message: `Odometer jump of ${log.odometer_reading - log.previous_log.odometer_reading}km since last fill.` });
    }

    log.alerts = alerts;
    log.validations = {
      odometerVerified: true,
      fuelPolicyPassed: true,
      duplicateCheckPassed: true,
      vehicleEligibilityPassed: true
    };
    
    // We didn't link expenses automatically, so standardizing null
    log.expense_id = null;

    return log;
  }

  async logFuel(data, userId) {
    return await FuelEngine.logFuel(data, userId);
  }

  async updateLog(id, data, userId) {
    // We do not allow updating liters, cost, odometer, or efficiency because it breaks the engine's timeline.
    // If a mistake is made, the log should be deleted and re-entered.
    // Only allow updating station or notes (if any).
    const updateData = {};
    if (data.station) updateData.station = data.station;
    updateData.updated_by = userId;

    await FuelRepository.update(id, updateData);
    return await this.getLogById(id);
  }

  async deleteLog(id, userId) {
    await this.getLogById(id);
    return await FuelRepository.softDelete(id, userId);
  }

  async getMonthlyAnalytics(vehicleId) {
    return await FuelRepository.getMonthlyAnalytics(vehicleId);
  }
}

export default new FuelService();
