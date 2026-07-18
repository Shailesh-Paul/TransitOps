import DashboardRepository from './dashboard.repository.js';

class DashboardService {
  async getEnterpriseDashboard(options) {
    return await DashboardRepository.getEnterpriseKPIs(options);
  }
}

export default new DashboardService();
