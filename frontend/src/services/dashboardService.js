import apiClient from '../api/apiClient';

export const getDashboardSummary = async () => {
  const data = await apiClient.get('/dashboard');
  
  // Map backend raw data to the structure expected by Dashboard.jsx
  return {
    dateContext: new Date().toLocaleString(),
    fleet: {
      vehicles: { 
        total: data.vehicles?.total || 0, 
        active: data.vehicles?.active_trips || 0, 
        maintenance: data.vehicles?.in_shop || 0 
      },
      underutilizedVehicles: 0, // Not provided by backend yet
      missedMaintenance: 0 // Not provided by backend yet
    },
    dispatch: {
      trips: { 
        total: (data.monthly_trips || []).reduce((acc, curr) => acc + curr.trip_count, 0) || 0, 
        in_progress: data.vehicles?.active_trips || 0, 
        scheduled: 0 
      },
      drivers: { 
        total: data.drivers?.total || 0, 
        available: data.drivers?.available || 0 
      },
      activeTripsList: [], // Requires a separate API call if needed
      driverList: [] // Requires a separate API call if needed
    },
    safety: {
      expiredLicenses: 0,
      upcomingExpiries: { licenses: 0, insurance: 0 }
    },
    finance: {
      metrics: { 
        expenses: Number(data.financials?.total_expenses || 0), 
        fuel: Number(data.financials?.total_fuel_cost || 0), 
        maintenance: Number(data.financials?.total_maintenance_cost || 0)
      }
    }
  };
};
