import FinancialAggregationService from './FinancialAggregationService.js';
import NotificationService from './NotificationService.js';

class FinancialAnalyticsEngine {

  static async getKpis(filters = {}) {
    const raw = await FinancialAggregationService.getBaseMetrics(filters);
    
    const kpis = {
      totalOperationalCost: raw.totalOperationalCost + raw.fuelCost + raw.maintenanceCost,
      fuelCost: raw.fuelCost,
      maintenanceCost: raw.maintenanceCost,
      tripCost: raw.tripCost,
      avgCostPerKm: (raw.totalOperationalCost + raw.fuelCost + raw.maintenanceCost) / (raw.totalDistance || 1),
      avgCostPerVehicle: (raw.totalOperationalCost + raw.fuelCost + raw.maintenanceCost) / (raw.vehicleCount || 1),
      avgCostPerTrip: (raw.tripCost) / (raw.tripCount || 1),
      avgCostPerDriver: (raw.totalOperationalCost + raw.fuelCost + raw.maintenanceCost) / (raw.driverCount || 1)
    };

    return kpis;
  }

  static async getVehicleAnalytics(filters = {}) {
    const raw = await FinancialAggregationService.getVehicleAnalytics(filters);
    
    // Derived values
    const highestCostVehicle = raw.vehicles[0] || null;
    const lowestCostVehicle = raw.vehicles[raw.vehicles.length - 1] || null;
    
    return {
      highestCostVehicle,
      lowestCostVehicle,
      vehicleLifetimeCost: raw.vehicles,
      monthlyVehicleSpend: raw.monthlyTrend
    };
  }

  static async getDriverAnalytics(filters = {}) {
    const drivers = await FinancialAggregationService.getDriverAnalytics(filters);
    return { driverOperationalCost: drivers };
  }

  static async getBudgetAnalytics() {
    const { budgets, spends } = await FinancialAggregationService.getBudgetsAnalytics();
    
    const analytics = [];
    const overspent = [];

    for (const b of budgets) {
      if (b.entity_type === 'department') {
        const spendObj = spends.find(s => s.department_id === parseInt(b.entity_id));
        const spend = spendObj ? Number(spendObj.total_spend) : 0;
        const limit = Number(b.amount);
        const remaining = limit - spend;
        const utilization = limit > 0 ? (spend / limit) * 100 : 0;

        const stat = {
          department: b.department_name || b.entity_id,
          budget: limit,
          spend,
          remaining,
          utilization: utilization.toFixed(2) + '%'
        };

        analytics.push(stat);

        if (spend > limit) {
          overspent.push(stat);
        }

        // Trigger Notification if over 80% (Threshold logic)
        if (utilization >= 80) {
          await this.checkThresholds(b, utilization);
        }
      }
    }

    return {
      budgetUtilization: analytics,
      budgetVariance: analytics, // Typically Budget - Spend (which is 'remaining')
      remainingBudget: analytics,
      overspentBudgets: overspent
    };
  }

  static async getMonthlyAnalytics() {
    const { monthly, distribution } = await FinancialAggregationService.getMonthlyAnalytics();
    
    // Calculate Monthly Growth
    const trends = [];
    for (let i = 0; i < monthly.length; i++) {
      let growth = 0;
      if (i > 0) {
        const prev = Number(monthly[i-1].total_spend);
        const curr = Number(monthly[i].total_spend);
        if (prev > 0) growth = ((curr - prev) / prev) * 100;
      }
      trends.push({
        month: monthly[i].month,
        spend: Number(monthly[i].total_spend),
        growth: growth.toFixed(2) + '%'
      });
    }

    return { monthlySpend: trends, costTrend: trends, expenseDistribution: distribution };
  }

  static async getRankings() {
    return await FinancialAggregationService.getRankings();
  }

  // --- Threshold & Notification Engine ---

  static async checkThresholds(budgetRecord, utilizationPercent) {
    if (utilizationPercent >= 100) {
      await NotificationService.notify({
        user_id: budgetRecord.created_by || 1, // fallback to admin
        title: "Overspending Alert",
        message: `Budget for ${budgetRecord.entity_type} ${budgetRecord.entity_id} has exceeded 100% utilization.`,
        notification_type: 'budget_risk',
        priority: 'critical'
      });
    } else if (utilizationPercent >= 80) {
      await NotificationService.notify({
        user_id: budgetRecord.created_by || 1,
        title: "Budget Risk Warning",
        message: `Budget for ${budgetRecord.entity_type} ${budgetRecord.entity_id} is at ${utilizationPercent.toFixed(1)}% utilization.`,
        notification_type: 'budget_risk',
        priority: 'high'
      });
    }
  }

}

export default FinancialAnalyticsEngine;
