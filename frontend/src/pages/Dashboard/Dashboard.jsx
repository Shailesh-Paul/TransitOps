import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboardSummary } from '../../services/dashboardService';
import Loader from '../../components/Loader';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('fleet'); // 'fleet', 'dispatch', 'safety', 'finance'
  
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const summary = await getDashboardSummary();
        setStats(summary);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) return <Loader fullScreen />;
  if (!stats) return <div className="p-10 text-center text-error font-display-md text-xl">Failed to connect to backend. Please ensure the backend server is running.</div>;

  const tabs = [
    { id: 'fleet', label: 'Fleet Manager', icon: 'directions_bus' },
    { id: 'dispatch', label: 'Dispatcher', icon: 'route' },
    { id: 'safety', label: 'Safety Officer', icon: 'gpp_maybe' },
    { id: 'finance', label: 'Financial Analyst', icon: 'monitoring' }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
        <div>
          <h1 className="font-display-lg text-primary text-4xl mb-2">Operations Command Center</h1>
          <p className="text-on-surface-variant font-body-lg flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary-fixed animate-pulse"></span>
            System status: Live • {stats.dateContext}
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-label-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,249,40,0.3)] shrink-0">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Action
          </button>
        </div>
      </header>

      {/* Role Navigation */}
      <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-full font-label-bold flex items-center gap-2 transition-all shrink-0 ${activeTab === tab.id ? 'bg-primary-fixed text-on-primary-fixed shadow-[0_0_15px_rgba(168,249,40,0.3)]' : 'bg-white/5 border border-white/10 text-on-surface-variant hover:bg-white/10 hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Dynamic Content Area */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-gutter"
        >
          {activeTab === 'fleet' && <FleetView stats={stats} />}
          {activeTab === 'dispatch' && <DispatcherView stats={stats} />}
          {activeTab === 'safety' && <SafetyView stats={stats} />}
          {activeTab === 'finance' && <FinanceView stats={stats} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------
// 1. Fleet Manager View
// ----------------------------------------------------
function FleetView({ stats }) {
  const { fleet } = stats;
  const total = fleet.vehicles.total || 1;
  const active = fleet.vehicles.active || 0;
  const maintenance = fleet.vehicles.maintenance || 0;
  const utilization = Math.round((active / total) * 100);

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
        <MetricCard title="Active Vehicles" value={active} icon="sensors" subtitle="Live Fleet" colorClass="primary-fixed" percent={(active/total)*100} />
        <MetricCard title="In Maintenance" value={maintenance} icon="build" subtitle="Vehicles" colorClass="error" percent={(maintenance/total)*100} isAlert={maintenance > 0} />
        <MetricCard title="Fleet Utilization" value={`${utilization}%`} icon="speed" subtitle="Current" colorClass="primary-fixed" percent={utilization} />
        <MetricCard 
          title="Underutilized" 
          value={fleet.underutilizedVehicles} 
          icon="trending_down" 
          subtitle="Zero trips (7 Days)" 
          colorClass="secondary" 
          percent={100} 
          isAlert={fleet.underutilizedVehicles > 0} 
        />
      </section>

      {fleet.missedMaintenance > 0 && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-4 animate-pulse">
          <span className="material-symbols-outlined text-error text-3xl">warning</span>
          <div>
            <h3 className="text-error font-headline-md">Critical Warning: Missed Maintenance</h3>
            <p className="text-on-surface-variant text-body-md">{fleet.missedMaintenance} vehicles have missed their scheduled maintenance windows. Immediate action required to prevent breakdowns.</p>
          </div>
        </div>
      )}
    </>
  );
}

// ----------------------------------------------------
// 2. Dispatcher View
// ----------------------------------------------------
function DispatcherView({ stats }) {
  const { dispatch } = stats;
  const totalTrips = dispatch.trips.total || 1;
  const activeTrips = dispatch.trips.in_progress || 0;
  const scheduledTrips = dispatch.trips.scheduled || 0;
  
  const totalDrivers = dispatch.drivers.total || 1;
  const availableDrivers = dispatch.drivers.available || 0;

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
        <MetricCard title="Active Deliveries" value={activeTrips} icon="local_shipping" subtitle="En Route" colorClass="primary-fixed" percent={(activeTrips/totalTrips)*100} />
        <MetricCard title="Scheduled Trips" value={scheduledTrips} icon="event" subtitle="Upcoming" colorClass="secondary" percent={(scheduledTrips/totalTrips)*100} />
        <MetricCard title="Available Drivers" value={availableDrivers} icon="person_available" subtitle="Ready for Dispatch" colorClass="primary-fixed" percent={(availableDrivers/totalDrivers)*100} />
        <MetricCard title="System Conflict Check" value="Active" icon="check_circle" subtitle="Double-booking prevented" colorClass="primary-fixed" percent={100} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <section className="glass-card rounded-xl p-6">
          <h2 className="text-primary font-headline-md text-xl mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">route</span>
            Recent Active Trips
          </h2>
          <div className="flex flex-col gap-3">
            {dispatch.activeTripsList && dispatch.activeTripsList.length > 0 ? (
              dispatch.activeTripsList.map(trip => (
                <div key={trip.id} className="p-4 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center hover:bg-white/10 transition-colors">
                  <div>
                    <h3 className="text-on-surface font-label-bold">{trip.first_name} {trip.last_name}</h3>
                    <p className="text-on-surface-variant text-body-sm">Dest: {trip.destination}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-primary-fixed/20 text-primary-fixed border border-primary-fixed/30 uppercase">
                      {trip.status.replace('_', ' ')}
                    </span>
                    <p className="text-on-surface-variant text-body-sm mt-1">{trip.registration_number}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-on-surface-variant text-body-md">No active trips found.</p>
            )}
          </div>
        </section>

        <section className="glass-card rounded-xl p-6">
          <h2 className="text-secondary font-headline-md text-xl mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">badge</span>
            Active Driver Roster
          </h2>
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {dispatch.driverList && dispatch.driverList.length > 0 ? (
              dispatch.driverList.map(driver => (
                <div key={driver.id} className="p-4 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center hover:bg-white/10 transition-colors">
                  <div>
                    <h3 className="text-on-surface font-label-bold">{driver.first_name} {driver.last_name}</h3>
                    <p className="text-on-surface-variant text-body-sm font-mono text-secondary/80">{driver.license_number}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${
                      driver.status === 'available' ? 'bg-primary-fixed/20 text-primary-fixed border-primary-fixed/30' :
                      driver.status === 'on_trip' ? 'bg-secondary/20 text-secondary border-secondary/30' :
                      'bg-white/10 text-on-surface-variant border-white/20'
                    }`}>
                      {driver.status.replace('_', ' ')}
                    </span>
                    <span className="text-on-surface-variant text-[10px]">{driver.phone}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-on-surface-variant text-body-md">No drivers found.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

// ----------------------------------------------------
// 3. Safety Officer View
// ----------------------------------------------------
function SafetyView({ stats }) {
  const { safety } = stats;
  const expiredLicenses = safety.expiredLicenses;
  const upcomingLicenses = safety.upcomingExpiries?.licenses || 0;
  const upcomingInsurance = safety.upcomingExpiries?.insurance || 0;

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-gutter">
        <MetricCard 
          title="Expired Licenses" 
          value={expiredLicenses} 
          icon="no_accounts" 
          subtitle="Non-compliant Drivers" 
          colorClass="error" 
          percent={100} 
          isAlert={expiredLicenses > 0} 
        />
        <MetricCard title="Upcoming License Renewals" value={upcomingLicenses} icon="id_card" subtitle="Next 30 Days" colorClass="secondary" percent={100} />
        <MetricCard title="Upcoming Insurance Renewals" value={upcomingInsurance} icon="verified_user" subtitle="Next 30 Days" colorClass="secondary" percent={100} />
      </section>

      {expiredLicenses > 0 && (
        <div className="p-6 rounded-xl bg-error/10 border border-error/30 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-3xl">dangerous</span>
            <h3 className="text-error font-headline-md text-2xl">Compliance Violation</h3>
          </div>
          <p className="text-on-surface-variant text-body-lg ml-10">There are {expiredLicenses} drivers with expired licenses. The system will automatically block these drivers from being dispatched on new trips. Immediate review is mandatory.</p>
        </div>
      )}
    </>
  );
}

// ----------------------------------------------------
// 4. Financial Analyst View
// ----------------------------------------------------
function FinanceView({ stats }) {
  const { finance } = stats;
  const { expenses, fuel, maintenance } = finance.metrics;
  
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-gutter">
        <MetricCard title="Operational Expenses" value={formatCurrency(expenses)} icon="receipt_long" subtitle="Current Month" colorClass="secondary" percent={100} />
        <MetricCard title="Fuel Consumption Cost" value={formatCurrency(fuel)} icon="local_gas_station" subtitle="Current Month" colorClass="secondary" percent={100} />
        <MetricCard title="Maintenance Cost" value={formatCurrency(maintenance)} icon="build_circle" subtitle="Current Month" colorClass="secondary" percent={100} />
      </section>

      <section className="glass-card rounded-xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-transparent"></div>
        <h2 className="text-primary font-headline-md text-xl mb-2 relative z-10">Profitability & Cost Tracking</h2>
        <p className="text-on-surface-variant text-body-md mb-6 relative z-10">
          Total operational outgoing this month: <span className="text-secondary font-bold">{formatCurrency(Number(expenses) + Number(fuel) + Number(maintenance))}</span>
        </p>
        
        <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex relative z-10">
          <div className="h-full bg-error/80" style={{ width: `${(expenses / (expenses+fuel+maintenance+1))*100}%` }} title="Expenses"></div>
          <div className="h-full bg-secondary/80" style={{ width: `${(fuel / (expenses+fuel+maintenance+1))*100}%` }} title="Fuel"></div>
          <div className="h-full bg-primary-fixed/80" style={{ width: `${(maintenance / (expenses+fuel+maintenance+1))*100}%` }} title="Maintenance"></div>
        </div>
        <div className="flex gap-6 mt-4 relative z-10">
          <div className="flex items-center gap-2 text-[12px]"><span className="w-3 h-3 rounded-full bg-error/80"></span> Operational</div>
          <div className="flex items-center gap-2 text-[12px]"><span className="w-3 h-3 rounded-full bg-secondary/80"></span> Fuel</div>
          <div className="flex items-center gap-2 text-[12px]"><span className="w-3 h-3 rounded-full bg-primary-fixed/80"></span> Maintenance</div>
        </div>
      </section>
    </>
  );
}

// ----------------------------------------------------
// Reusable Metric Card Component
// ----------------------------------------------------
function MetricCard({ title, value, icon, subtitle, colorClass, percent, isAlert }) {
  // Map colorClass to specific tailwind text/bg classes for our neon theme
  let textColor = 'text-primary-fixed';
  let bgColor = 'bg-primary-fixed/5';
  let glowColor = 'bg-primary-fixed/10';
  let barColor = 'bg-primary-fixed';

  if (colorClass === 'secondary') {
    textColor = 'text-secondary';
    bgColor = 'bg-secondary/5';
    glowColor = 'bg-secondary/10';
    barColor = 'bg-secondary';
  } else if (colorClass === 'error') {
    textColor = 'text-error';
    bgColor = 'bg-error/5';
    glowColor = 'bg-error/10';
    barColor = 'bg-error';
  }

  return (
    <div className={`glass-card rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group ${isAlert ? 'border border-error/50 shadow-[0_0_15px_rgba(255,84,73,0.2)]' : ''}`}>
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl transition-all ${bgColor} group-hover:${glowColor}`}></div>
      <div className="flex justify-between items-start">
        <span className="text-on-surface-variant font-label-bold uppercase">{title}</span>
        <span className={`material-symbols-outlined ${textColor}`}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <span className={`font-display-lg text-4xl ${colorClass === 'primary-fixed' ? 'cyber-lime-glow text-primary' : 'text-primary'}`}>{value}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-label-bold ${textColor}`}>{subtitle}</span>
      </div>
      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-auto">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }} 
          transition={{ duration: 1 }} 
          className={`${barColor} h-full rounded-full`}
        ></motion.div>
      </div>
    </div>
  );
}

