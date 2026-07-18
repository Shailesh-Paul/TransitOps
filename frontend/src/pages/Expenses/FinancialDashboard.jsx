import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getDashboardKpis } from '../../services/expenseService';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#A8F928', '#FF4B4B', '#FFD166', '#06D6A0', '#118AB2'];

export default function FinancialDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ dateRange: 'Last 30 Days' });

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getDashboardKpis(filters);
      setData(result.data); // ApiResponse wraps in .data
    } catch (err) {
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const kpis = data?.kpis || {};
  const approvals = data?.approvals || { pending: 0, cleared: 0, rejected: 0 };
  const charts = data?.charts || { monthlyTrend: [], categoryBreakdown: [] };
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="w-full">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 w-full">
        <div>
          <h1 className="font-display-lg text-primary text-4xl mb-2 tracking-tighter uppercase font-extrabold">Financial Command Center</h1>
          <p className="text-on-surface-variant font-body-lg">Enterprise unified dashboard for operational costs and fleet expenditure.</p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <button onClick={() => navigate('/expenses/list')} className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-primary font-label-bold flex items-center gap-2 hover:bg-white/10 transition-all">
            <span className="material-symbols-outlined text-[18px]">list_alt</span>
            Expense Center
          </button>
          <button className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-primary font-label-bold flex items-center gap-2 hover:bg-white/10 transition-all opacity-50 cursor-not-allowed" title="Future Phase">
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
            Budgets
          </button>
          <button className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-primary font-label-bold flex items-center gap-2 hover:bg-white/10 transition-all opacity-50 cursor-not-allowed" title="Future Phase">
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            Analytics
          </button>
          <button className="px-6 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-label-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,249,40,0.3)] opacity-50 cursor-not-allowed" title="Future Phase">
            <span className="material-symbols-outlined text-[18px]">trending_up</span>
            Forecast
          </button>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
        {/* Total Operational Cost */}
        <div className="glass-card rounded-xl p-6 relative overflow-hidden group col-span-1 md:col-span-2 bg-gradient-to-br from-surface-container to-surface-container-high border-primary/20">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-on-surface-variant font-label-bold uppercase tracking-wider">Total Operational Cost</span>
            <span className="material-symbols-outlined text-primary text-[24px]">account_balance_wallet</span>
          </div>
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="h-10 w-48 bg-white/5 animate-pulse rounded"></div>
            ) : (
              <span className="text-primary font-display-lg text-5xl">₹{(kpis.totalOperationalCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            )}
          </div>
          <div className="mt-4 text-[11px] text-primary-fixed font-label-bold uppercase inline-block bg-primary-fixed/10 px-3 py-1.5 rounded-full border border-primary-fixed/20">
            Enterprise Aggregate
          </div>
        </div>

        {/* Cost Per Kilometer */}
        <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-all"></div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-on-surface-variant font-label-bold uppercase">Cost Per KM</span>
            <span className="material-symbols-outlined text-secondary text-[24px]">speed</span>
          </div>
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-24 bg-white/5 animate-pulse rounded"></div>
            ) : (
              <span className="text-primary font-display-lg text-3xl">₹{(kpis.costPerKm || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            )}
          </div>
          <div className="mt-4 text-[10px] text-on-surface-variant font-label-bold uppercase">Fleet Average Efficiency</div>
        </div>

        {/* Approvals */}
        <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-tertiary/5 rounded-full blur-3xl group-hover:bg-tertiary/10 transition-all"></div>
          <div className="flex justify-between items-start mb-6">
            <span className="text-on-surface-variant font-label-bold uppercase">Pending Approvals</span>
            <span className="material-symbols-outlined text-tertiary text-[24px]">pending_actions</span>
          </div>
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-16 bg-white/5 animate-pulse rounded"></div>
            ) : (
              <span className="text-primary font-display-lg text-3xl">{approvals.pending}</span>
            )}
          </div>
          <div className="mt-4 flex gap-3 text-[10px] font-label-bold uppercase">
             <span className="text-secondary">{approvals.cleared} Approved</span>
             <span className="text-error">{approvals.rejected} Rejected</span>
          </div>
        </div>
      </section>

      {/* Financial Breakdown Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-gutter">
        {[
          { label: 'Fuel Cost', value: kpis.fuelCost, icon: 'local_gas_station', color: 'text-primary' },
          { label: 'Maintenance Cost', value: kpis.maintenanceCost, icon: 'build', color: 'text-error' },
          { label: 'Trip Expenses', value: kpis.tripExpenses, icon: 'toll', color: 'text-secondary' },
          { label: 'Other Expenses', value: kpis.otherExpenses, icon: 'receipt', color: 'text-tertiary' }
        ].map((item, i) => (
          <div key={i} className="glass-card rounded-xl p-5 hover:bg-white/5 transition-colors border-l-4" style={{ borderLeftColor: i === 0 ? '#A8F928' : i === 1 ? '#FF4B4B' : i === 2 ? '#06D6A0' : '#118AB2'}}>
            <div className="flex items-center gap-3 mb-3">
              <span className={`material-symbols-outlined ${item.color} text-[20px]`}>{item.icon}</span>
              <span className="text-on-surface-variant text-[11px] font-label-bold uppercase">{item.label}</span>
            </div>
            {loading ? (
              <div className="h-6 w-full bg-white/5 animate-pulse rounded"></div>
            ) : (
              <div className="text-primary font-headline-md text-xl">₹{(item.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            )}
          </div>
        ))}
      </section>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-gutter">
        {/* Monthly Trend Area Chart */}
        <section className="lg:col-span-2 glass-card rounded-xl p-8 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-primary font-headline-md text-xl">Monthly Operational Trend</h2>
          </div>
          <div className="flex-1 w-full relative">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-on-surface-variant animate-pulse">Loading Chart...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.monthlyTrend}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A8F928" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#A8F928" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(value) => `₹${value > 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(20,20,20,0.9)', border: '1px solid rgba(168,249,40,0.2)', borderRadius: '8px' }}
                    itemStyle={{ color: '#A8F928', fontWeight: 'bold' }}
                    formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#A8F928" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Category Breakdown Pie Chart */}
        <section className="glass-card rounded-xl p-8 flex flex-col h-[400px]">
          <div className="mb-2">
            <h2 className="text-primary font-headline-md text-xl">Category Breakdown</h2>
          </div>
          <div className="flex-1 w-full relative flex items-center justify-center">
            {loading ? (
              <span className="text-on-surface-variant animate-pulse">Loading Chart...</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.categoryBreakdown.filter(d => d.value > 0)}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {charts.categoryBreakdown.filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-on-surface-variant text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {!loading && charts.categoryBreakdown.every(d => !d.value) && (
               <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant text-sm">No data available</div>
            )}
          </div>
        </section>
      </div>

      {/* Recent Activity Table */}
      <section className="glass-card rounded-xl flex flex-col min-h-[400px]">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-surface-container-low/50 rounded-t-xl">
          <h2 className="text-primary font-headline-md text-lg flex items-center gap-2">
             <span className="material-symbols-outlined text-[20px]">history</span>
             Recent Financial Activity
          </h2>
          <div className="flex gap-2">
             <button className="text-on-surface-variant hover:text-primary transition-colors material-symbols-outlined text-[20px]" title="Filter">filter_list</button>
             <button className="text-on-surface-variant hover:text-primary transition-colors material-symbols-outlined text-[20px]" title="Export">download</button>
          </div>
        </div>
        
        <div className="flex-1 overflow-x-auto p-0">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead className="bg-white/5">
              <tr>
                <th className="py-4 px-6 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Transaction ID</th>
                <th className="py-4 px-6 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Expense Type</th>
                <th className="py-4 px-6 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Source Module</th>
                <th className="py-4 px-6 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Vehicle</th>
                <th className="py-4 px-6 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider text-right">Amount (₹)</th>
                <th className="py-4 px-6 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-[10px] text-on-surface-variant font-label-bold uppercase tracking-wider">Created At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-10 text-on-surface-variant animate-pulse">Loading Ledger...</td></tr>
              ) : recentActivity.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10 text-on-surface-variant">No recent transactions found</td></tr>
              ) : (
                <AnimatePresence>
                  {recentActivity.map((txn, i) => (
                    <motion.tr 
                      key={`${txn.source_module}-${txn.id}-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-default"
                    >
                      <td className="py-4 px-6">
                        <span className="text-sm font-mono text-primary/80 group-hover:text-primary transition-colors">
                          {txn.source_module.substring(0,3).toUpperCase()}-{txn.id.toString().padStart(5, '0')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-on-surface capitalize">{txn.expense_type}</td>
                      <td className="py-4 px-6">
                         <span className="text-[10px] uppercase font-bold text-on-surface-variant bg-white/5 px-2 py-1 rounded">
                           {txn.source_module}
                         </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-on-surface">{txn.vehicleName || '—'}</td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-error">
                         ₹{parseFloat(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${txn.status === 'cleared' || txn.status === 'completed' ? 'bg-secondary' : txn.status === 'pending' || txn.status === 'scheduled' ? 'bg-tertiary' : 'bg-error'}`}></div>
                           <span className="text-xs capitalize text-on-surface-variant">{txn.status}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-on-surface-variant">
                         {new Date(txn.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
