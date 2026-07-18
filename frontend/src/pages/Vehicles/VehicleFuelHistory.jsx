import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';
import { ROUTES } from '../../constants/routes';
import Loader from '../../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';

export default function VehicleFuelHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fuelType, setFuelType] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Load Profile only once
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await apiClient.get(`/vehicles/${id}/fuel-profile`);
        setProfileData(res);
      } catch (err) {
        toast.error('Failed to load vehicle fuel profile');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [id]);

  // Load logs on filter change
  useEffect(() => {
    const loadLogs = async () => {
      setLogsLoading(true);
      try {
        const params = { vehicle_id: id, page, limit: 10 };
        if (debouncedSearch) params.search = debouncedSearch;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (fuelType) params.fuelType = fuelType;
        
        const res = await apiClient.get('/fuel', { params });
        setLogs(res.data);
        setMeta(res.meta);
      } catch (err) {
        toast.error('Failed to load fuel logs');
      } finally {
        setLogsLoading(false);
      }
    };
    loadLogs();
  }, [id, page, debouncedSearch, startDate, endDate, fuelType]);

  const handleExport = (type) => {
    toast(`Export to ${type} is being prepared by the backend logic.`, {
      icon: '⚙️',
      style: { background: '#1e293b', color: '#fff' }
    });
  };

  if (loading) return <Loader fullScreen />;
  if (!profileData) return null;

  const { vehicle, fuelProfile, relatedInfo } = profileData;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
        <div>
          <button onClick={() => navigate(ROUTES.VEHICLES_DETAILS.replace(':id', id))} className="text-primary hover:text-primary-fixed flex items-center gap-1 mb-4 text-sm font-label-bold transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Vehicle
          </button>
          <h1 className="font-display-lg text-primary text-4xl mb-2 flex items-center gap-4">
            <span className="material-symbols-outlined text-[36px] text-secondary">local_gas_station</span>
            Enterprise Fuel History
          </h1>
          <p className="text-on-surface-variant font-body-lg">
            {vehicle.make} {vehicle.model} ({vehicle.registration_number})
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => handleExport('CSV')} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface-variant font-label-bold flex items-center gap-2 hover:bg-white/10 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">data_table</span>
            Export CSV
          </button>
          <button onClick={() => handleExport('Excel')} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface-variant font-label-bold flex items-center gap-2 hover:bg-white/10 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            Export Excel
          </button>
          <button onClick={() => handleExport('PDF')} className="px-4 py-2 rounded-lg bg-secondary/20 border border-secondary/30 text-secondary font-label-bold flex items-center gap-2 hover:bg-secondary/30 transition-colors">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <section className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-all"></div>
            <h3 className="text-on-surface-variant font-label-bold uppercase text-xs mb-6">Fuel Profile</h3>
            
            <div className="flex flex-col gap-6">
              <ProfileItem label="Avg Efficiency" value={fuelProfile.avgEfficiency ? `${Number(fuelProfile.avgEfficiency).toFixed(2)} km/L` : 'N/A'} icon="speed" color="text-primary-fixed" />
              <ProfileItem label="Avg Cost / KM" value={fuelProfile.avgCostPerKm ? formatCurrency(fuelProfile.avgCostPerKm) : 'N/A'} icon="trending_up" color="text-error" />
              <ProfileItem label="Total Consumed" value={fuelProfile.totalConsumed ? `${Number(fuelProfile.totalConsumed).toLocaleString('en-IN')} L` : '0 L'} icon="oil_barrel" color="text-secondary" />
              <ProfileItem label="Total Cost" value={formatCurrency(fuelProfile.totalCost)} icon="payments" color="text-primary" />
              
              <div className="h-px bg-white/10 w-full my-2"></div>
              
              <ProfileItem label="Best Efficiency" value={fuelProfile.bestEfficiency ? `${Number(fuelProfile.bestEfficiency).toFixed(2)} km/L` : 'N/A'} icon="arrow_upward" color="text-primary-fixed" />
              <ProfileItem label="Worst Efficiency" value={fuelProfile.worstEfficiency ? `${Number(fuelProfile.worstEfficiency).toFixed(2)} km/L` : 'N/A'} icon="arrow_downward" color="text-error" />
              <ProfileItem label="Last Refuel" value={fuelProfile.lastRefuelDate ? new Date(fuelProfile.lastRefuelDate).toLocaleDateString('en-IN') : 'N/A'} icon="calendar_today" />
              <ProfileItem label="Most Used Station" value={fuelProfile.mostUsedStation || 'N/A'} icon="ev_station" />
            </div>
          </section>

          <section className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
            <h3 className="text-on-surface-variant font-label-bold uppercase text-xs mb-6">Related Information</h3>
            
            <div className="flex flex-col gap-6">
              <ProfileItem label="Current Health" value={vehicle.status === 'In Shop' ? 'Requires Attention' : 'Optimal'} icon="monitor_heart" color={vehicle.status === 'In Shop' ? 'text-error' : 'text-primary-fixed'} />
              <ProfileItem label="Total Trips" value={relatedInfo.tripSummary.totalTrips || '0'} icon="route" />
              <ProfileItem label="Total Distance" value={`${Number(relatedInfo.tripSummary.totalDistance || 0).toLocaleString('en-IN')} km`} icon="add_road" />
              <ProfileItem label="Service WOs" value={relatedInfo.maintenanceStats.total_count || '0'} icon="build" />
            </div>
          </section>
        </div>

        {/* Main Service Book */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <section className="glass-card rounded-2xl flex flex-col flex-1 border border-white/5 min-h-[600px]">
            <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md rounded-t-2xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-primary font-headline-md text-xl flex items-center gap-2">
                  <span className="material-symbols-outlined">menu_book</span>
                  Service Book History
                </h2>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                  <input
                    type="text"
                    placeholder="Search ID, Station, Driver..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-on-surface focus:border-primary-fixed focus:outline-none transition-colors"
                  />
                </div>
                <input 
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="bg-background border border-white/10 rounded-xl px-4 py-2 text-sm text-on-surface focus:border-primary-fixed"
                  title="Start Date"
                />
                <input 
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="bg-background border border-white/10 rounded-xl px-4 py-2 text-sm text-on-surface focus:border-primary-fixed"
                  title="End Date"
                />
                <select
                  value={fuelType}
                  onChange={e => setFuelType(e.target.value)}
                  className="bg-background border border-white/10 rounded-xl px-4 py-2 text-sm text-on-surface focus:border-primary-fixed"
                >
                  <option value="">All Fuel Types</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto no-scrollbar p-0">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-surface-container-lowest sticky top-0 z-10 backdrop-blur-md shadow-sm">
                  <tr>
                    <th className="py-4 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Tx ID</th>
                    <th className="py-4 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Date</th>
                    <th className="py-4 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Station</th>
                    <th className="py-4 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Driver / Trip</th>
                    <th className="py-4 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider text-right">Odometer</th>
                    <th className="py-4 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider text-right">Distance</th>
                    <th className="py-4 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider text-right">Quantity</th>
                    <th className="py-4 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider text-right">Price/L</th>
                    <th className="py-4 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider text-right">Total Cost</th>
                    <th className="py-4 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider text-right">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {logsLoading ? (
                    <tr><td colSpan="10" className="text-center py-10 text-on-surface-variant">Loading service book...</td></tr>
                  ) : logs.length === 0 ? (
                    <tr><td colSpan="10" className="text-center py-10 text-on-surface-variant">No fuel logs found in this period.</td></tr>
                  ) : (
                    <AnimatePresence>
                      {logs.map((log, i) => (
                        <motion.tr 
                          key={log.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          onClick={() => navigate(ROUTES.FUEL_DETAILS.replace(':id', log.id))}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer text-sm"
                        >
                          <td className="py-3 px-4 font-mono text-xs">
                            <span className="bg-white/5 px-2 py-1 rounded text-primary">TX-{String(log.id).padStart(5, '0')}</span>
                          </td>
                          <td className="py-3 px-4">{new Date(log.date).toLocaleDateString('en-IN')}</td>
                          <td className="py-3 px-4 font-bold text-primary">{log.station}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold">{log.driverName || 'Unassigned'}</span>
                              <span className="text-xs text-on-surface-variant">{log.tripId ? `TRIP-${log.tripId}` : 'No Trip'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono">{log.odometer_reading?.toLocaleString('en-IN') || 'N/A'}</td>
                          <td className="py-3 px-4 text-right font-mono text-secondary">{log.distance ? `${log.distance} km` : '-'}</td>
                          <td className="py-3 px-4 text-right font-mono">{Number(log.liters).toFixed(1)} {log.fuel_type === 'CNG' ? 'kg' : 'L'}</td>
                          <td className="py-3 px-4 text-right font-mono">{formatCurrency(log.cost / log.liters)}</td>
                          <td className="py-3 px-4 text-right font-mono text-error font-bold">{formatCurrency(log.cost)}</td>
                          <td className="py-3 px-4 text-right font-mono text-primary-fixed">{log.efficiency ? `${Number(log.efficiency).toFixed(1)} kpl` : '-'}</td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && (
              <div className="p-4 border-t border-white/10 flex justify-between items-center bg-background rounded-b-2xl">
                <span className="text-xs text-on-surface-variant">Showing {logs.length} of {meta.total} records</span>
                <div className="flex gap-2">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 rounded text-sm transition-colors"
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1 text-sm">{page} / {meta.totalPages}</span>
                  <button 
                    disabled={page === meta.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 rounded text-sm transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ label, value, icon, color = 'text-on-surface-variant' }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center ${color}`}>
          <span className="material-symbols-outlined text-[16px]">{icon}</span>
        </div>
        <span className="text-sm font-label-bold text-on-surface-variant">{label}</span>
      </div>
      <span className={`text-sm font-display-md ${color === 'text-on-surface-variant' ? 'text-primary' : color}`}>{value}</span>
    </div>
  );
}
