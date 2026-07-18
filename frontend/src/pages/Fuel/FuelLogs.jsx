import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFuelLogs, deleteFuelLog } from '../../services/fuelService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import LogFuelModal from './components/LogFuelModal';

export default function FuelLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const data = await getFuelLogs();
      setLogs(data);
    } catch (err) {
      toast.error('Failed to load fuel logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this fuel log?")) return;
    try {
      await deleteFuelLog(id);
      toast.success('Log deleted');
      loadData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalSpend = logs.reduce((sum, l) => sum + parseFloat(l.cost), 0);
  const totalLiters = logs.reduce((sum, l) => sum + parseFloat(l.liters), 0);

  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 w-full">
        <div>
          <h1 className="font-display-lg text-primary text-4xl mb-2 tracking-tighter uppercase font-extrabold">Fuel & Energy Management</h1>
          <p className="text-on-surface-variant font-body-lg">Monitor fleet fuel consumption and expenditure.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate(ROUTES.FUEL_DASHBOARD)} className="px-6 py-2 rounded-full bg-surface-container-highest border border-white/20 text-on-surface font-label-bold flex items-center gap-2 hover:bg-white/10 transition-all shrink-0">
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            Dashboard
          </button>
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-label-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,249,40,0.3)] shrink-0">
            <span className="material-symbols-outlined text-[18px]">local_gas_station</span>
            Log Fuel
          </button>
        </div>
      </header>

      <LogFuelModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onLogged={loadData} 
      />

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-gutter">
        <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary-fixed/5 rounded-full blur-3xl group-hover:bg-primary-fixed/10 transition-all"></div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-on-surface-variant font-label-bold uppercase">Total Spend</span>
            <span className="material-symbols-outlined text-primary-fixed text-[24px]">payments</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-primary font-display-lg text-4xl">₹{totalSpend.toFixed(2)}</span>
            <span className="text-primary-fixed text-label-bold">Monthly</span>
          </div>
        </div>
        
        <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-all"></div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-on-surface-variant font-label-bold uppercase">Total Volume</span>
            <span className="material-symbols-outlined text-secondary text-[24px]">oil_barrel</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-primary font-display-lg text-4xl">{totalLiters.toFixed(1)}</span>
            <span className="text-secondary text-label-bold">Liters</span>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-error/5 rounded-full blur-3xl group-hover:bg-error/10 transition-all"></div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-on-surface-variant font-label-bold uppercase">Avg Price/Liter</span>
            <span className="material-symbols-outlined text-error text-[24px]">trending_up</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-primary font-display-lg text-4xl">₹{totalLiters > 0 ? (totalSpend/totalLiters).toFixed(2) : '0.00'}</span>
            <span className="text-error text-label-bold">Live Avg</span>
          </div>
        </div>
      </section>

      {/* Main Table */}
      <section className="glass-card rounded-xl flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md rounded-t-xl">
          <h2 className="text-primary font-headline-md text-xl">Recent Refuels</h2>
          <div className="flex gap-2">
            <button className="text-on-surface-variant hover:text-primary transition-colors material-symbols-outlined">more_horiz</button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto no-scrollbar p-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-lowest sticky top-0 z-10 backdrop-blur-md shadow-sm">
              <tr>
                <th className="py-4 px-6 text-[11px] text-on-surface-variant font-label-bold uppercase tracking-wider">Date & Time</th>
                <th className="py-4 px-6 text-[11px] text-on-surface-variant font-label-bold uppercase tracking-wider">Vehicle</th>
                <th className="py-4 px-6 text-[11px] text-on-surface-variant font-label-bold uppercase tracking-wider">Station</th>
                <th className="py-4 px-6 text-[11px] text-on-surface-variant font-label-bold uppercase tracking-wider text-right">Volume</th>
                <th className="py-4 px-6 text-[11px] text-on-surface-variant font-label-bold uppercase tracking-wider text-right">Cost</th>
                <th className="py-4 px-6 text-[11px] text-on-surface-variant font-label-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-on-surface-variant">Loading fuel logs...</td>
                </tr>
              ) : (
                <AnimatePresence>
                  {logs.map((log, i) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => navigate(ROUTES.FUEL_DETAILS.replace(':id', log.id))}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-6 align-middle">
                        <div className="flex flex-col">
                          <span className="text-sm text-primary font-bold group-hover:text-primary-fixed transition-colors">{new Date(log.date).toLocaleDateString()}</span>
                          <span className="text-xs text-on-surface-variant">{new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 align-middle">
                        <span className="text-sm text-primary font-mono bg-white/5 px-2 py-0.5 rounded inline-block w-fit">{log.vehicleName || `ID: ${log.vehicle_id}`}</span>
                      </td>
                      <td className="py-4 px-6 align-middle">
                        <span className="text-sm text-primary">{log.station}</span>
                      </td>
                      <td className="py-4 px-6 align-middle text-right">
                        <span className="text-sm text-secondary font-bold">{parseFloat(log.liters).toFixed(1)} L</span>
                      </td>
                      <td className="py-4 px-6 align-middle text-right">
                        <span className="text-sm text-error font-bold">₹{parseFloat(log.cost).toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-6 align-middle text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(log.id); }} className="w-8 h-8 rounded-full bg-error/10 hover:bg-error/20 text-error flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
