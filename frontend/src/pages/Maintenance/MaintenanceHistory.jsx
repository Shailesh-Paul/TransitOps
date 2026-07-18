import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMaintenanceRecords } from '../../services/maintenanceService';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiAlertCircle, FiDownload, FiCalendar, FiFilter, FiSearch } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export default function MaintenanceHistory() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMaintId, setExpandedMaintId] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL');

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMaintenanceRecords({ status: 'Completed', limit: 1000 });
      // Since backend doesn't filter exactly on status via GET /maintenance sometimes, we ensure it's filtered
      const data = res.data || [];
      const completed = data.filter(r => r.status === 'Completed');
      // Sort newest first
      completed.sort((a, b) => new Date(b.end_date || b.created_at) - new Date(a.end_date || a.created_at));
      setRecords(completed);
    } catch (err) {
      console.error(err);
      setError('Failed to load maintenance history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter Data
  const filteredRecords = records.filter(record => {
    const recordDate = new Date(record.end_date || record.created_at);
    const matchSearch = search === '' || 
      record.work_order_number?.toLowerCase().includes(search.toLowerCase()) || 
      record.registration_number?.toLowerCase().includes(search.toLowerCase()) ||
      record.performed_by?.toLowerCase().includes(search.toLowerCase()) ||
      record.type?.toLowerCase().includes(search.toLowerCase());
    
    const matchCategory = filterCategory === 'ALL' || record.type === filterCategory;
    const matchYear = filterYear === 'ALL' || recordDate.getFullYear().toString() === filterYear;

    return matchSearch && matchCategory && matchYear;
  });

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : 'N/A';
  const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

  const handleExport = (type) => {
    toast(`Export to ${type} is coming soon in a future update!`, { icon: '🚧' });
  };

  // Derive unique categories and years for filters
  const categories = ['ALL', ...new Set(records.map(r => r.type).filter(Boolean))];
  const years = ['ALL', ...new Set(records.map(r => new Date(r.end_date || r.created_at).getFullYear().toString()))];

  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 w-full">
        <div>
          <button onClick={() => navigate(ROUTES.MAINTENANCE)} className="text-primary hover:text-primary-fixed flex items-center gap-1 mb-4 text-sm font-label-bold transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Active Maintenance
          </button>
          <h1 className="font-display-lg text-primary text-4xl mb-2 tracking-tighter uppercase font-extrabold flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary-fixed">menu_book</span>
            Service History
          </h1>
          <p className="text-on-surface-variant font-body-lg">Immutable ledger of all completed fleet maintenance records.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchHistory}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-primary hover:bg-white/10 transition-all shrink-0"
            title="Refresh"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>
          <div className="flex bg-white/5 border border-white/10 rounded-full p-1">
            <button onClick={() => handleExport('PDF')} className="px-4 py-1.5 rounded-full text-xs font-label-bold text-on-surface-variant hover:text-primary hover:bg-white/5 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span> PDF
            </button>
            <button onClick={() => handleExport('Excel')} className="px-4 py-1.5 rounded-full text-xs font-label-bold text-on-surface-variant hover:text-primary hover:bg-white/5 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">table_view</span> Excel
            </button>
          </div>
        </div>
      </header>

      {/* Main Table Area */}
      <section className="glass-card rounded-xl flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-surface-container-low border border-white/10 rounded-full px-3 py-1.5">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">category</span>
              <select 
                value={filterCategory} 
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-transparent border-none text-xs font-label-bold text-primary focus:outline-none uppercase"
              >
                {categories.map(c => <option key={c} value={c} className="bg-background text-on-surface">{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low border border-white/10 rounded-full px-3 py-1.5">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">calendar_today</span>
              <select 
                value={filterYear} 
                onChange={e => setFilterYear(e.target.value)}
                className="bg-transparent border-none text-xs font-label-bold text-primary focus:outline-none uppercase"
              >
                {years.map(y => <option key={y} value={y} className="bg-background text-on-surface">{y}</option>)}
              </select>
            </div>
          </div>
          
          <div className="relative w-full md:w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              <FiSearch />
            </span>
            <input 
              type="text" 
              placeholder="Search WO, Reg, Technician..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-low border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-primary focus:border-primary-fixed/50 focus:outline-none transition-all"
            />
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto no-scrollbar relative p-0">
          {error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FiAlertCircle className="w-12 h-12 text-error mb-4 opacity-80" />
              <p className="text-error font-label-bold mb-4">{error}</p>
              <button onClick={fetchHistory} className="px-4 py-2 border border-white/20 rounded font-label-bold text-xs uppercase hover:bg-white/5 transition-all text-primary">Retry Connection</button>
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
                <span className="material-symbols-outlined text-on-surface-variant text-3xl">menu_book</span>
              </div>
              <h3 className="text-primary font-headline-sm mb-1">No History Found</h3>
              <p className="text-on-surface-variant text-sm">No completed maintenance records match your filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="py-3 px-6 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Date & Time</th>
                  <th className="py-3 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">WO / Vehicle</th>
                  <th className="py-3 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Type & Priority</th>
                  <th className="py-3 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Technician</th>
                  <th className="py-3 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider text-right">Cost (INR)</th>
                  <th className="py-3 px-6 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredRecords.map((log) => (
                    <React.Fragment key={log.id}>
                      <motion.tr 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setExpandedMaintId(expandedMaintId === log.id ? null : log.id)}
                        className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${expandedMaintId === log.id ? 'bg-white/5' : ''}`}
                      >
                        <td className="py-4 px-6 w-32">
                          <span className="text-sm font-bold text-primary block">{formatDate(log.end_date || log.created_at)}</span>
                          <span className="text-[11px] text-on-surface-variant font-mono">{formatTime(log.end_date || log.created_at)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-[12px] font-bold text-primary block">{log.work_order_number || `WO-${log.id.toString().padStart(4, '0')}`}</span>
                          <span className="text-sm text-on-surface-variant">{log.registration_number || `Vehicle #${log.vehicle_id}`}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs font-bold text-primary uppercase block mb-1">{log.type}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border inline-block ${log.priority === 'Critical' ? 'bg-error/10 text-error border-error/30' : 'bg-white/5 text-on-surface-variant border-white/20'}`}>
                            {log.priority || 'Normal'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-on-surface block">{log.performed_by || 'Unknown'}</span>
                          {log.downtime_minutes > 0 && <span className="text-[10px] text-error">Downtime: {Math.round(log.downtime_minutes / 60)}h {log.downtime_minutes % 60}m</span>}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-sm text-primary-fixed font-mono">{formatCurrency(log.cost)}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Link 
                            to={ROUTES.MAINTENANCE_DETAILS.replace(':id', log.id)} 
                            className="px-3 py-1.5 rounded-lg border border-primary/30 text-[10px] font-bold text-primary hover:bg-primary hover:text-on-primary transition-all uppercase inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Details <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </Link>
                        </td>
                      </motion.tr>
                      {/* Expandable Summary Row */}
                      {expandedMaintId === log.id && (
                        <tr className="bg-white/5 border-b border-white/5">
                          <td colSpan="6" className="p-0">
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="p-6"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-background rounded-xl p-5 border border-white/10 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-fixed"></div>
                                
                                <div className="flex flex-col gap-2">
                                  <span className="text-[10px] font-label-bold text-on-surface-variant uppercase flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">fact_check</span> Completion Summary
                                  </span>
                                  <p className="text-sm text-on-surface leading-relaxed">
                                    {log.completion_summary || 'No detailed summary was provided upon completion.'}
                                  </p>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                  <span className="text-[10px] font-label-bold text-on-surface-variant uppercase flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">troubleshoot</span> Root Cause
                                  </span>
                                  <p className="text-sm text-on-surface leading-relaxed">
                                    {log.root_cause || 'Root cause analysis was not documented.'}
                                  </p>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                  <span className="text-[10px] font-label-bold text-on-surface-variant uppercase flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">build_circle</span> Corrective Action
                                  </span>
                                  <p className="text-sm text-on-surface leading-relaxed">
                                    {log.corrective_action || 'Specific corrective actions were not documented.'}
                                  </p>
                                </div>
                                
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
