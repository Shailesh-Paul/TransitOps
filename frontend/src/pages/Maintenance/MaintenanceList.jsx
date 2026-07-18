import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMaintenanceRecords, getDashboardKpis } from '../../services/maintenanceService';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiAlertCircle, FiTool, FiCalendar, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function MaintenanceList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpis, setKpis] = useState(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recordsRes, kpisRes] = await Promise.all([
        getMaintenanceRecords({ limit: 100 }),
        getDashboardKpis()
      ]);
      setRecords(recordsRes.data || []);
      setKpis(kpisRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load maintenance records. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Filter Data
  const filteredRecords = records.filter(record => {
    const matchStatus = filterStatus === 'ALL' || record.status === filterStatus;
    const matchSearch = search === '' || 
      record.work_order_number?.toLowerCase().includes(search.toLowerCase()) || 
      record.registration_number?.toLowerCase().includes(search.toLowerCase()) ||
      record.description?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Calculate KPIs
  const todayDate = new Date().toDateString();
  const scheduledMaintenance = records.filter(r => r.status === 'Scheduled').length;
  const inProgressMaintenance = records.filter(r => r.status === 'In Progress').length;
  const completedMaintenance = records.filter(r => r.status === 'Completed').length;
  const overdueMaintenance = records.filter(r => r.status === 'Overdue').length;
  const dueToday = records.filter(r => r.status === 'Scheduled' && r.scheduled_date && new Date(r.scheduled_date).toDateString() === todayDate).length;
  const upcomingMaintenance = records.filter(r => r.status === 'Scheduled' && r.scheduled_date && new Date(r.scheduled_date) > new Date()).length;

  const inProgressRecords = records.filter(r => r.status === 'In Progress');
  const averageCompletion = inProgressRecords.length > 0 
    ? Math.round(inProgressRecords.reduce((acc, curr) => acc + (curr.progress || 0), 0) / inProgressRecords.length)
    : 0;

  const vehiclesAvailable = kpis?.vehiclesAvailable || 0;
  const vehiclesInShop = kpis?.vehiclesInShop || 0;
  const totalMaintCost = kpis?.totalMaintenanceCost || 0;
  const avgDowntime = kpis?.averageDowntimeMinutes ? Math.round(kpis.averageDowntimeMinutes / 60) : 0;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-primary-fixed/20 text-primary-fixed border-primary-fixed/30';
      case 'In Progress': return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'Scheduled': return 'bg-surface-container-highest text-on-surface border-white/20';
      case 'Overdue':
      case 'Cancelled': return 'bg-error/20 text-error border-error/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'Critical': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-error/20 text-error border border-error/30">CRITICAL</span>;
      case 'High': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-error/10 text-error">HIGH</span>;
      case 'Medium': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/10 text-secondary">MEDIUM</span>;
      case 'Low': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-fixed/10 text-primary-fixed">LOW</span>;
      default: return null;
    }
  };

  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 w-full">
        <div>
          <h1 className="font-display-lg text-primary text-4xl mb-2 tracking-tighter uppercase font-extrabold">Enterprise Maintenance</h1>
          <p className="text-on-surface-variant font-body-lg">Track fleet services, workshop queues, and repair costs.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchRecords}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-primary hover:bg-white/10 transition-all shrink-0"
            title="Refresh"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => navigate('/maintenance/history')}
            className="px-6 py-2 rounded-full bg-surface-container-highest border border-white/20 text-on-surface font-label-bold flex items-center gap-2 hover:bg-white/10 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            History
          </button>
          <button 
            onClick={() => navigate('/maintenance/analytics')}
            className="px-6 py-2 rounded-full bg-surface-container-highest border border-white/20 text-on-surface font-label-bold flex items-center gap-2 hover:bg-white/10 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            Analytics
          </button>
          <button 
            onClick={() => navigate('/maintenance/create')}
            className="px-6 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-label-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,249,40,0.3)] shrink-0"
          >
            <FiTool />
            Request Maintenance
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-gutter mb-gutter">
        <div className="glass-card rounded-xl p-5 border border-white/5 group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-fixed/10 rounded-full blur-2xl transition-all"></div>
          <p className="text-on-surface-variant font-label-bold uppercase mb-2 text-xs">Vehicles Available</p>
          <p className="text-3xl font-display-lg text-primary">{vehiclesAvailable}</p>
        </div>
        <div className="glass-card rounded-xl p-5 border border-white/5 group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl transition-all"></div>
          <p className="text-on-surface-variant font-label-bold uppercase mb-2 text-xs">Vehicles In Shop</p>
          <p className="text-3xl font-display-lg text-secondary">{vehiclesInShop}</p>
        </div>
        <div className="glass-card rounded-xl p-5 border border-error/20 group relative overflow-hidden">
          <p className="text-error font-label-bold uppercase mb-2 text-xs">Due Today</p>
          <p className="text-3xl font-display-lg text-error">{dueToday}</p>
        </div>
        <div className="glass-card rounded-xl p-5 border border-error/20 group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-error/10 rounded-full blur-2xl transition-all"></div>
          <p className="text-error font-label-bold uppercase mb-2 text-xs">Overdue</p>
          <p className="text-3xl font-display-lg text-error">{overdueMaintenance}</p>
        </div>
        <div className="glass-card rounded-xl p-5 border border-white/5 group relative overflow-hidden">
           <p className="text-on-surface-variant font-label-bold uppercase mb-2 text-xs">Avg. Completion</p>
          <p className="text-3xl font-display-lg text-primary">{averageCompletion}%</p>
        </div>
        <div className="glass-card rounded-xl p-5 border border-white/5 group relative overflow-hidden">
           <p className="text-on-surface-variant font-label-bold uppercase mb-2 text-xs">Completed Maintenance</p>
          <p className="text-3xl font-display-lg text-primary-fixed">{completedMaintenance}</p>
        </div>
        <div className="glass-card rounded-xl p-5 border border-white/5 group relative overflow-hidden">
           <p className="text-on-surface-variant font-label-bold uppercase mb-2 text-xs">Total Cost (INR)</p>
          <p className="text-3xl font-display-lg text-primary">₹{Number(totalMaintCost).toLocaleString('en-IN')}</p>
        </div>
        <div className="glass-card rounded-xl p-5 border border-white/5 group relative overflow-hidden">
           <p className="text-on-surface-variant font-label-bold uppercase mb-2 text-xs">Average Downtime</p>
          <p className="text-3xl font-display-lg text-primary">{avgDowntime} hrs</p>
        </div>
      </section>

      {/* Main Table Area */}
      <section className="glass-card rounded-xl flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex bg-surface-container-low rounded-full p-1 border border-white/5 overflow-x-auto w-full md:w-auto">
            {['ALL', 'Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Overdue'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-label-bold uppercase transition-all whitespace-nowrap ${
                  filterStatus === f ? 'bg-white/10 text-primary' : 'text-on-surface-variant hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search Work Order, Vehicle, or Description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-low border border-white/10 rounded-full py-2 pl-4 pr-4 text-sm text-primary focus:border-primary-fixed/50 focus:outline-none transition-all"
            />
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto no-scrollbar relative p-0">
          
          {error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FiAlertCircle className="w-12 h-12 text-error mb-4 opacity-80" />
              <p className="text-error font-label-bold mb-4">{error}</p>
              <button onClick={fetchRecords} className="px-4 py-2 border border-white/20 rounded font-label-bold text-xs uppercase hover:bg-white/5 transition-all text-primary">Retry Connection</button>
            </div>
          ) : loading ? (
            <div className="p-6 space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-16 bg-white/5 animate-pulse rounded-lg w-full"></div>
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <FiTool className="w-6 h-6 text-on-surface-variant" />
              </div>
              <h3 className="text-primary font-headline-sm mb-1">No Maintenance Records Found</h3>
              <p className="text-on-surface-variant text-sm">Adjust your filters or schedule a new maintenance job.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="py-3 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Work Order</th>
                  <th className="py-3 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Vehicle</th>
                  <th className="py-3 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Type & Priority</th>
                  <th className="py-3 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Cost</th>
                  <th className="py-3 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredRecords.map((log) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <td className="py-4 px-4 w-32">
                        <span className="text-[11px] font-bold text-primary">{log.work_order_number || `MNT-${log.id}`}</span>
                        <div className="text-[10px] text-on-surface-variant mt-1 font-mono">
                          {log.scheduled_date ? new Date(log.scheduled_date).toLocaleDateString() : new Date(log.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-bold text-primary">{log.registration_number || log.vehicle_id}</span>
                        <div className="text-[11px] text-on-surface-variant line-clamp-1 pr-4 max-w-[250px]">{log.description || 'No description provided'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-primary uppercase">{log.type}</span>
                        </div>
                        {getPriorityBadge(log.priority)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase border inline-block ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs text-primary font-mono">{log.cost ? `₹${Number(log.cost).toLocaleString('en-IN')}` : '-'}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => navigate(`/maintenance/${log.id}`)}
                          className="px-3 py-1 rounded border border-white/10 text-[10px] font-bold text-primary hover:bg-white/10 transition-all uppercase"
                        >
                          Manage
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
