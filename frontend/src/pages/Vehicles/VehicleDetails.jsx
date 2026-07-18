import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';
import { ROUTES } from '../../constants/routes';

// Shared Badge Component mapping for enterprise theme
function StatusBadge({ status }) {
  const styles = {
    'Available': 'bg-primary-fixed/20 text-primary-fixed border-primary-fixed/30',
    'Reserved': 'bg-secondary/20 text-secondary border-secondary/30',
    'On Trip': 'bg-secondary/20 text-secondary border-secondary/30',
    'In Shop': 'bg-error/20 text-error border-error/30',
    'Retired': 'bg-white/10 text-on-surface-variant border-white/20'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${styles[status] || styles['Available']}`}>
      {status}
    </span>
  );
}

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    vehicle: null,
    trips: [],
    maintenance: [],
    maintenanceStats: null,
    fuel: [],
    expenses: []
  });

  const loadData = async () => {
    try {
      setLoading(true);
      // Execute all GET requests in parallel
      const [vehicleRes, tripsRes, maintRes, fuelRes, expRes, statsRes] = await Promise.all([
        apiClient.get(`/vehicles/${id}`),
        apiClient.get('/trips', { params: { vehicle_id: id } }),
        apiClient.get('/maintenance', { params: { vehicle_id: id } }),
        apiClient.get('/fuel', { params: { vehicle_id: id } }),
        apiClient.get('/expenses', { params: { vehicle_id: id } }),
        apiClient.get(`/vehicles/${id}/maintenance-stats`)
      ]);

      setData({
        vehicle: vehicleRes,
        // Backend pagination often returns an object with `data` or `results`. 
        // We'll normalize to array just in case it returns paginated objects.
        trips: Array.isArray(tripsRes) ? tripsRes : (tripsRes.data || []),
        maintenance: Array.isArray(maintRes) ? maintRes : (maintRes.data || []),
        maintenanceStats: statsRes || null,
        fuel: Array.isArray(fuelRes) ? fuelRes : (fuelRes.data || []),
        expenses: Array.isArray(expRes) ? expRes : (expRes.data || [])
      });
    } catch (err) {
      console.error("Failed to load vehicle details", err);
      toast.error('Failed to load vehicle details');
      navigate(ROUTES.VEHICLES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (!data.vehicle) return null;

  const { vehicle, trips, maintenance, maintenanceStats, fuel, expenses } = data;

  // Derived Metrics
  const totalTrips = trips.length;
  // Calculate total distance if trip has 'distance' field (mocking if empty since backend schema might not have it yet)
  const totalDistance = trips.reduce((sum, t) => sum + (Number(t.distance) || 0), 0); 
  const totalFuelCost = fuel.reduce((sum, f) => sum + (Number(f.cost) || 0), 0);
  const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
  const genericExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalExpenses = totalFuelCost + totalMaintenanceCost + genericExpenses;

  // Assuming total distance and total fuel litres for efficiency
  const totalLitres = fuel.reduce((sum, f) => sum + (Number(f.liters) || 0), 0);
  const avgEfficiency = totalLitres > 0 && totalDistance > 0 ? (totalDistance / totalLitres).toFixed(2) : "0.00";

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : 'N/A';

  const [expandedMaintId, setExpandedMaintId] = useState(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
        <div>
          <button onClick={() => navigate(ROUTES.VEHICLES)} className="text-primary hover:text-primary-fixed flex items-center gap-1 mb-4 text-sm font-label-bold transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Fleet
          </button>
          <h1 className="font-display-lg text-primary text-4xl mb-2 flex items-center gap-4">
            🚚 {vehicle.make} {vehicle.model}
            <StatusBadge status={vehicle.status || 'Available'} />
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={loadData} className="p-2 rounded-full bg-white/5 text-on-surface-variant hover:bg-white/10 transition-colors border border-white/10" title="Refresh Data">
            <span className="material-symbols-outlined">refresh</span>
          </button>
          <Link to={ROUTES.VEHICLES_EDIT.replace(':id', vehicle.id)} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface-variant font-label-bold flex items-center gap-2 hover:bg-white/10 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Vehicle
          </Link>
          <Link to={ROUTES.TRIPS_CREATE} className="px-4 py-2 rounded-lg bg-primary-fixed text-on-primary-fixed font-label-bold flex items-center gap-2 hover:opacity-90 shadow-[0_0_15px_rgba(168,249,40,0.2)] transition-all">
            <span className="material-symbols-outlined text-[18px]">route</span>
            Create Trip
          </Link>
        </div>
      </div>

      {/* Vehicle Info */}
      <section className="glass-card rounded-2xl p-6 border border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <InfoItem label="Registration" value={vehicle.registration_number} />
          <InfoItem label="Type" value={vehicle.type || 'N/A'} />
          <InfoItem label="Capacity" value={`${vehicle.capacity || 'N/A'} kg`} />
          <InfoItem label="Fuel Type" value={vehicle.fuelType || 'N/A'} />
          <InfoItem label="Odometer" value={`${Number(vehicle.current_odometer || 0).toLocaleString('en-IN')} km`} />
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-gutter mt-2">
        <MetricCard title="Trips" value={totalTrips} icon="route" />
        <MetricCard title="Distance" value={`${totalDistance.toLocaleString('en-IN')} km`} icon="add_road" />
        <MetricCard title="Fuel Cost" value={formatCurrency(totalFuelCost)} icon="local_gas_station" colorClass="secondary" />
        <MetricCard title="Maintenance" value={formatCurrency(totalMaintenanceCost)} icon="build" colorClass="secondary" />
        <MetricCard title="Expenses" value={formatCurrency(totalExpenses)} icon="account_balance_wallet" colorClass="secondary" />
        <MetricCard title="Fuel Efficiency" value={`${avgEfficiency} km/L`} icon="speed" />
      </section>

      {/* Trip History Table */}
      <section className="glass-card rounded-2xl p-6 border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-primary font-headline-md text-xl flex items-center gap-2">
            <span className="material-symbols-outlined">history</span>
            Trip History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-on-surface-variant font-label-bold">
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Start Time</th>
                <th className="py-3 px-4">End Time</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {trips.length > 0 ? trips.map((trip) => (
                <tr key={trip.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-on-surface">
                  <td className="py-3 px-4">{trip.driver_id ? `Driver #${trip.driver_id.substring(0,8)}` : 'Unassigned'}</td>
                  <td className="py-3 px-4">{formatDate(trip.start_time)}</td>
                  <td className="py-3 px-4">{formatDate(trip.end_time)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded text-xs border border-white/20 bg-white/5 uppercase">
                      {trip.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="py-4 px-4 text-center text-on-surface-variant">No trips recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Digital Service Book (Enterprise Maintenance History) */}
        <section className="glass-card rounded-2xl p-6 border border-white/5 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-primary-fixed font-headline-md text-xl flex items-center gap-2">
              <span className="material-symbols-outlined">menu_book</span>
              Digital Service Book
            </h2>
            <Link to={ROUTES.MAINTENANCE_CREATE} className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-label-bold flex items-center gap-2 hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Log Service
            </Link>
          </div>

          {/* Vehicle Statistics */}
          {maintenanceStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
              <StatsBadge label="Total Service" value={maintenanceStats.total_count} />
              <StatsBadge label="Total Cost" value={formatCurrency(maintenanceStats.total_cost)} />
              <StatsBadge label="Avg Cost" value={formatCurrency(maintenanceStats.average_cost)} />
              <StatsBadge label="Avg Downtime" value={`${Math.round((maintenanceStats.average_downtime || 0) / 60)} hrs`} />
              <StatsBadge label="Max Downtime" value={`${Math.round((maintenanceStats.longest_downtime || 0) / 60)} hrs`} />
              <StatsBadge label="Last Service" value={formatDate(maintenanceStats.last_service_date)} />
              <StatsBadge label="Frequent Issue" value={maintenanceStats.most_frequent_type} />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-on-surface-variant font-label-bold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">WO #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4 text-right">Cost (INR)</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.length > 0 ? maintenance.filter(m => m.status === 'Completed').map((m) => (
                  <React.Fragment key={m.id}>
                    <tr 
                      className={`border-b border-white/5 hover:bg-white/5 transition-colors text-on-surface cursor-pointer ${expandedMaintId === m.id ? 'bg-white/5' : ''}`}
                      onClick={() => setExpandedMaintId(expandedMaintId === m.id ? null : m.id)}
                    >
                      <td className="py-3 px-4 font-mono text-sm">{m.work_order_number || `WO-${m.id.toString().padStart(4, '0')}`}</td>
                      <td className="py-3 px-4 text-sm">{formatDate(m.end_date || m.created_at)}</td>
                      <td className="py-3 px-4 text-sm">{m.type}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs border ${m.priority === 'Critical' ? 'border-error text-error bg-error/10' : 'border-white/20 bg-white/5'}`}>
                          {m.priority || 'Normal'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{m.performed_by || 'Unknown'}</td>
                      <td className="py-3 px-4 text-right font-mono text-sm">{formatCurrency(m.cost)}</td>
                      <td className="py-3 px-4 text-center">
                        <Link to={ROUTES.MAINTENANCE_DETAILS.replace(':id', m.id)} className="p-1 rounded hover:bg-white/10 text-primary transition-colors inline-block" onClick={e => e.stopPropagation()}>
                          <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                        </Link>
                      </td>
                    </tr>
                    {expandedMaintId === m.id && (
                      <tr className="bg-white/5 border-b border-white/5">
                        <td colSpan="7" className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-background p-4 rounded-lg border border-white/10">
                            <div>
                              <strong className="text-on-surface-variant uppercase text-xs block mb-1">Completion Summary</strong>
                              <p className="text-on-surface">{m.completion_summary || 'No summary provided.'}</p>
                            </div>
                            <div>
                              <strong className="text-on-surface-variant uppercase text-xs block mb-1">Root Cause</strong>
                              <p className="text-on-surface">{m.root_cause || 'No root cause documented.'}</p>
                            </div>
                            <div>
                              <strong className="text-on-surface-variant uppercase text-xs block mb-1">Corrective Action</strong>
                              <p className="text-on-surface">{m.corrective_action || 'No corrective action documented.'}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )) : (
                  <tr><td colSpan="7" className="py-8 px-4 text-center text-on-surface-variant">No completed service records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Fuel History */}
        <section className="glass-card rounded-2xl p-6 border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-secondary font-headline-md text-xl flex items-center gap-2">
              <span className="material-symbols-outlined">local_gas_station</span>
              Fuel Logs
            </h2>
            <Link to={ROUTES.VEHICLE_FUEL_HISTORY.replace(':id', vehicle.id)} className="text-secondary text-sm font-label-bold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-on-surface-variant font-label-bold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Litres</th>
                  <th className="py-3 px-4 text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {fuel.length > 0 ? fuel.map((f) => (
                  <tr key={f.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-on-surface">
                    <td className="py-3 px-4">{formatDate(f.date)}</td>
                    <td className="py-3 px-4">{f.liters} L</td>
                    <td className="py-3 px-4 text-right font-mono">{formatCurrency(f.cost)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="py-4 px-4 text-center text-on-surface-variant">No fuel logs recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Expense History */}
        <section className="glass-card rounded-2xl p-6 border border-white/5 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-primary-fixed font-headline-md text-xl flex items-center gap-2">
              <span className="material-symbols-outlined">receipt_long</span>
              Expenses
            </h2>
            <Link to={ROUTES.EXPENSES} className="text-primary-fixed text-sm font-label-bold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-on-surface-variant font-label-bold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? expenses.map((e) => (
                  <tr key={e.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-on-surface">
                    <td className="py-3 px-4">{formatDate(e.date)}</td>
                    <td className="py-3 px-4">{e.category}</td>
                    <td className="py-3 px-4"><span className="text-xs uppercase">{e.status}</span></td>
                    <td className="py-3 px-4 text-right font-mono">{formatCurrency(e.amount)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="py-4 px-4 text-center text-on-surface-variant">No generic expenses recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}

// Sub-components for clean UI
function StatsBadge({ label, value }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg bg-white/5 border border-white/10">
      <span className="text-[10px] font-label-bold text-on-surface-variant uppercase truncate">{label}</span>
      <span className="text-sm font-display-md text-primary-fixed truncate">{value}</span>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-label-bold text-on-surface-variant uppercase">{label}</span>
      <span className="text-sm font-body-lg text-on-surface">{value}</span>
    </div>
  );
}

function MetricCard({ title, value, icon, colorClass = 'primary' }) {
  let textColor = 'text-primary';
  let bgColor = 'bg-primary/5';

  if (colorClass === 'secondary') {
    textColor = 'text-secondary';
    bgColor = 'bg-secondary/5';
  } else if (colorClass === 'primary-fixed') {
    textColor = 'text-primary-fixed';
    bgColor = 'bg-primary-fixed/5';
  }

  return (
    <div className={`glass-card rounded-xl p-5 flex flex-col justify-between gap-3 relative overflow-hidden group border border-white/5`}>
      <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl transition-all ${bgColor}`}></div>
      <div className="flex justify-between items-start">
        <span className="text-on-surface-variant font-label-bold uppercase text-xs">{title}</span>
        <span className={`material-symbols-outlined text-[20px] ${textColor}`}>{icon}</span>
      </div>
      <div className={`font-display-lg text-2xl ${textColor}`}>
        {value}
      </div>
    </div>
  );
}
