import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getExpenses, deleteExpense } from '../../services/expenseService';
import toast from 'react-hot-toast';

export default function ExpenseList() {
  const [filter, setFilter] = useState('ALL');
  const [expenses, setExpenses] = useState([]);
  const [metrics, setMetrics] = useState({ totalSpend: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data.data);
      if(data.metrics) setMetrics(data.metrics);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      toast.success('Expense deleted');
      loadData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 w-full">
        <div>
          <h1 className="font-display-lg text-primary text-4xl mb-2 tracking-tighter uppercase font-extrabold">Financial & Resource Analytics</h1>
          <p className="text-on-surface-variant font-body-lg">Monitor fuel consumption and operational costs across the fleet.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-primary font-label-bold flex items-center gap-2 hover:bg-white/10 transition-all shrink-0">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
          <button className="px-6 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-label-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,249,40,0.3)] shrink-0">
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            Log Expense
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-gutter">
        <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary-fixed/5 rounded-full blur-3xl group-hover:bg-primary-fixed/10 transition-all"></div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-on-surface-variant font-label-bold uppercase">Total Spend (Live)</span>
            <span className="material-symbols-outlined text-primary-fixed text-[24px]">account_balance_wallet</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-primary font-display-lg text-4xl">₹{metrics.totalSpend.toFixed(2)}</span>
            <span className="text-error text-label-bold">+4.2%</span>
          </div>
          <div className="mt-4 text-[10px] text-on-surface-variant font-label-bold uppercase">Current Month vs Prior</div>
        </div>
        
        <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-all"></div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-on-surface-variant font-label-bold uppercase">Fuel Efficiency Avg</span>
            <span className="material-symbols-outlined text-secondary text-[24px]">local_gas_station</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-primary font-display-lg text-4xl">4.2</span>
            <span className="text-secondary text-label-bold">km/L</span>
          </div>
          <div className="mt-4 text-[10px] text-primary-fixed font-label-bold uppercase inline-block bg-primary-fixed/10 px-2 py-1 rounded">Optimal</div>
        </div>

        <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-error/5 rounded-full blur-3xl group-hover:bg-error/10 transition-all"></div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-on-surface-variant font-label-bold uppercase">Maintenance Outlay</span>
            <span className="material-symbols-outlined text-error text-[24px]">build</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-primary font-display-lg text-4xl">$28,140</span>
            <span className="text-error text-label-bold">-1.5%</span>
          </div>
          <div className="mt-4 text-[10px] text-on-surface-variant font-label-bold uppercase">Projected Under Budget</div>
        </div>
      </section>

      {/* Main Charts & Expenses Table Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        
        {/* Cost Analysis Chart Placeholder */}
        <section className="lg:col-span-2 glass-card rounded-xl p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-primary font-headline-md text-xl">Operational Cost Analysis</h2>
            <div className="flex gap-2">
               <span className="px-3 py-1 rounded-full text-[10px] uppercase font-label-bold bg-white/5 text-primary cursor-pointer hover:bg-white/10 transition">Week</span>
               <span className="px-3 py-1 rounded-full text-[10px] uppercase font-label-bold bg-primary-fixed/20 text-primary-fixed cursor-pointer">Month</span>
            </div>
          </div>
          <div className="flex-1 w-full bg-surface-container-low rounded-lg border border-white/5 relative overflow-hidden flex items-end justify-between p-4 min-h-[300px]">
            {/* Simulated Bar Chart */}
            {[40, 60, 45, 80, 55, 90, 75, 45, 60, 100, 85, 70].map((h, i) => (
              <div key={i} className="w-[6%] h-full flex flex-col justify-end gap-1 items-center group">
                <motion.div 
                  initial={{ height: 0 }} 
                  animate={{ height: `${h}%` }} 
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="w-full bg-gradient-to-t from-primary-fixed/20 to-primary-fixed/60 rounded-t group-hover:to-primary-fixed transition-colors relative"
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-primary-fixed opacity-0 group-hover:opacity-100 transition-opacity">
                    ${(h * 123).toFixed(0)}
                  </span>
                </motion.div>
              </div>
            ))}
            <div className="absolute inset-0 border-b border-primary-fixed/20 w-full h-[50%] pointer-events-none border-dashed opacity-50"></div>
          </div>
        </section>

        {/* Recent Expenditures Table in Sidebar */}
        <section className="glass-card rounded-xl flex flex-col h-[500px]">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-primary font-headline-md text-lg line-clamp-1">Recent Expenditures</h2>
            <button className="text-on-surface-variant hover:text-primary transition-colors material-symbols-outlined">more_horiz</button>
          </div>
          
          <div className="flex-1 overflow-auto no-scrollbar p-0">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="py-3 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase">ID / Desc</th>
                  <th className="py-3 px-4 text-[10px] text-on-surface-variant font-label-bold uppercase text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="2" className="text-center py-4 text-on-surface-variant">Loading...</td></tr>
                ) : (
                  <AnimatePresence>
                    {expenses.map((expense, i) => (
                      <motion.tr 
                        key={expense.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => navigate(`/expenses/${expense.id}`)}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group relative"
                      >
                        <td className="py-4 px-4 w-full">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-primary font-bold group-hover:text-primary-fixed transition-colors">ID: {expense.id} • {expense.category}</span>
                            <span className="text-[10px] text-on-surface-variant line-clamp-1">{expense.description}</span>
                            <span className="text-[10px] text-on-surface-variant/50">{new Date(expense.date).toLocaleDateString()} • {expense.vehicleName || 'General'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right align-top">
                          <span className="text-sm font-bold text-error break-keep">
                            -₹{parseFloat(expense.amount).toFixed(2)}
                          </span>
                          <div className="mt-1">
                            {expense.status === 'cleared' ? (
                              <span className="text-[9px] uppercase font-bold text-secondary">Cleared</span>
                            ) : (
                              <span className="text-[9px] uppercase font-bold text-error">{expense.status}</span>
                            )}
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(expense.id); }} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-error hover:bg-error/10 p-1 rounded transition-all material-symbols-outlined text-[14px]">
                            delete
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-white/10 text-center">
            <button className="text-[10px] font-label-bold uppercase text-primary-fixed hover:underline bg-transparent">View Full Ledger</button>
          </div>
        </section>
      </div>
    </>
  );
}
