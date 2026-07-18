import MaintenanceRepository from './maintenance.repository.js';
import { NotFoundError } from "../../core/errors.js";
import MaintenanceEngine from "../../core/MaintenanceEngine.js";

class MaintenanceService {
  
  async getMaintenanceRecords(options) {
    return await MaintenanceRepository.findAll(options);
  }

  async getRecordById(id) {
    const record = await MaintenanceRepository.findById(id);
    if (!record) {
      throw new NotFoundError('Maintenance record not found');
    }
    return record;
  }

  async getComprehensiveDetails(id) {
    const details = await MaintenanceRepository.getComprehensiveDetails(id);
    if (!details) {
      throw new NotFoundError('Maintenance details not found');
    }
    return details;
  }

  async getDashboardKpis() {
    return await MaintenanceRepository.getDashboardKpis();
  }

  async getQueue() {
    return await MaintenanceRepository.getWorkshopQueue();
  }

  async requestMaintenance(data, userId) {
    return await MaintenanceEngine.requestMaintenance(data, userId);
  }

  async queueMaintenance(id, userId) {
    await MaintenanceEngine.queueMaintenance(id, userId);
  }

  async startMaintenance(id, userId) {
    await MaintenanceEngine.startMaintenance(id, userId);
  }

  async completeMaintenance(id, payload, userId) {
    await MaintenanceEngine.completeMaintenance(id, payload, userId);
  }

  async cancelMaintenance(id, userId) {
    await MaintenanceEngine.cancelMaintenance(id, userId);
    return { message: "Maintenance cancelled successfully" };
  }

  async updateProgress(id, payload, userId) {
    await MaintenanceEngine.updateProgress(id, payload, userId);
    return { message: "Progress updated successfully" };
  }

  async updateRecord(id, data, userId) {
    const existing = await this.getRecordById(id);
    const updateData = { ...data, updated_by: userId };

    // Prevent direct status/cost/parts update
    if (updateData.status) delete updateData.status;
    if (updateData.cost) delete updateData.cost;
    if (updateData.parts) delete updateData.parts;

    await MaintenanceRepository.update(id, updateData);
    return await MaintenanceRepository.findById(id);
  }

  async deleteRecord(id) {
    await this.getRecordById(id);
    return await MaintenanceRepository.hardDelete(id);
  }
}

export default new MaintenanceService();
