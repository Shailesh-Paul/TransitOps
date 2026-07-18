import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getAnalytics } from '../../services/maintenanceService';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiAlertCircle, FiFilter, FiDownload, FiCalendar, FiList, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const COLORS = ['#A8F928', '#2dd4bf', '#818cf8', '#f43f5e', '#fbbf24', '#e879f9'];

export default function MaintenanceAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    year: '',
    month: '',
    category: '',
    priority: '',
    search: ''
  });

  const [calendarMode, setCalendarMode] = useState('list'); // 'list' or 'grid'

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnalytics(filters);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load maintenance analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters.year, filters.month, filters.category, filters.priority]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : 'N/A';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container-high border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-on-surface font-label-bold mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-sm font-mono" style={{ color: p.color }}>
              {p.name}: {p.name.includes('Cost') || p.name === 'value' ? formatCurrency(p.value) : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Derived filter options (in a real app, these would come from an API endpoint, but we can hardcode common ones)
  const years = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];
  const months = [
    { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
  ];

  // Calendar logic
  const calendarEvents = useMemo(() => {
    if (!data?.calendar) return [];
    let events = data.calendar;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      events = events.filter(e => 
        e.work_order_number?.toLowerCase().includes(s) || 
        e.type?.toLowerCase().includes(s) || 
        e.status?.toLowerCase().includes(s)
      );
    }
    return events;
  }, [data?.calendar, filters.search]);

  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4 w-full">
        <div>
          <button onClick={() => navigate(ROUTES.MAINTENANCE)} className="text-primary hover:text-primary-fixed flex items-center gap-1 mb-4 text-sm font-label-bold transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Active Maintenance
          </button>
          <h1 className="font-display-lg text-primary text-4xl mb-2 tracking-tighter uppercase font-extrabold flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary-fixed">analytics</span>
            Enterprise Analytics
          </h1>
          <p className="text-on-surface-variant font-body-lg">Operational insights, costs, and fleet health.</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex bg-surface-container-low border border-white/10 rounded-full px-4 py-2 gap-4">
            <select value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})} className="bg-transparent border-none text-xs font-label-bold text-primary focus:outline-none">
              <option value="">ALL YEARS</option>
              {years.map(y => <option key={y} value={y} className="bg-background text-on-surface">{y}</option>)}
            </select>
            <div className="w-[1px] bg-white/10"></div>
            <select value={filters.month} onChange={e => setFilters({...filters, month: e.target.value})} className="bg-transparent border-none text-xs font-label-bold text-primary focus:outline-none">
              <option value="">ALL MONTHS</option>
              {months.map(m => <option key={m.value} value={m.value} className="bg-background text-on-surface">{m.label}</option>)}
            </select>
            <div className="w-[1px] bg-white/10"></div>
            <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} className="bg-transparent border-none text-xs font-label-bold text-primary focus:outline-none">
              <option value="">ALL CATEGORIES</option>
              <option value="routine" className="bg-background text-on-surface">ROUTINE</option>
              <option value="repair" className="bg-background text-on-surface">REPAIR</option>
              <option value="emergency" className="bg-background text-on-surface">EMERGENCY</option>
            </select>
          </div>
          
          <button 
            onClick={fetchAnalytics}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-primary hover:bg-white/10 transition-all shrink-0"
            title="Refresh Data"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => toast('Export PDF is coming soon!', { icon: '🚧' })} className="px-6 py-2 rounded-full bg-surface-container-highest border border-white/20 text-on-surface font-label-bold flex items-center gap-2 hover:bg-white/10 transition-all shrink-0">
            <FiDownload />
            Export Report
          </button>
        </div>
      </header>

      {error ? (
        <div className="flex flex-col items-center justify-center h-64 text-center glass-card rounded-2xl border border-error/20">
          <FiAlertCircle className="w-12 h-12 text-error mb-4 opacity-80" />
          <p className="text-error font-label-bold mb-4">{error}</p>
          <button onClick={fetchAnalytics} className="px-4 py-2 border border-white/20 rounded font-label-bold text-xs uppercase hover:bg-white/5 transition-all text-primary">Retry Connection</button>
        </div>
      ) : loading && !data ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl"></div>)}
        </div>
      ) : data ? (
        <>
          {/* KPI Row */}
          <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <MetricCard title="Scheduled" value={data.kpis.totalScheduled} />
            <MetricCard title="In Progress" value={data.kpis.inProgress} color="text-secondary" bg="bg-secondary/10" />
            <MetricCard title="Completed (M)" value={data.kpis.completedThisMonth} color="text-primary-fixed" bg="bg-primary-fixed/10" />
            <MetricCard title="Overdue" value={data.kpis.overdue} color="text-error" bg="bg-error/10" />
            <MetricCard title="Total Cost" value={formatCurrency(data.kpis.totalCost)} />
            <MetricCard title="Avg Cost" value={formatCurrency(data.kpis.averageCost)} />
            <MetricCard title="Avg Downtime" value={`${Math.round(data.kpis.averageDowntime / 60)}h`} />
            <MetricCard title="Availability" value={`${data.kpis.vehicleAvailability}%`} color="text-primary-fixed" bg="bg-primary-fixed/10" />
          </section>

          {/* Health Score & Notification Summary */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary-fixed/10 rounded-full blur-3xl group-hover:bg-primary-fixed/20 transition-all"></div>
              <h2 className="text-on-surface-variant font-label-bold uppercase text-xs mb-4">Fleet Health Score</h2>
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" r="45" fill="none" 
                      stroke={data.kpis.avgHealthScore >= 95 ? '#A8F928' : data.kpis.avgHealthScore >= 80 ? '#2dd4bf' : data.kpis.avgHealthScore >= 60 ? '#fbbf24' : '#f43f5e'} 
                      strokeWidth="8" strokeDasharray={`${data.kpis.avgHealthScore * 2.83} 283`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-display-lg text-primary-fixed">{Math.round(data.kpis.avgHealthScore)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex justify-between items-center bg-white/5 p-2 rounded text-xs">
                    <span className="text-on-surface-variant">95-100</span><span className="text-primary-fixed font-bold">Excellent</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-2 rounded text-xs">
                    <span className="text-on-surface-variant">80-94</span><span className="text-secondary font-bold">Good</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-2 rounded text-xs">
                    <span className="text-on-surface-variant">60-79</span><span className="text-warning font-bold text-yellow-400">Needs Attention</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-2 rounded text-xs">
                    <span className="text-on-surface-variant">&lt;60</span><span className="text-error font-bold">Critical</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/5 col-span-2">
              <h2 className="text-on-surface-variant font-label-bold uppercase text-xs mb-4">Notification Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[128px]">
                <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between border border-white/5 hover:border-white/20 transition-all">
                  <span className="text-xs text-on-surface-variant uppercase font-bold">Upcoming</span>
                  <span className="text-2xl text-primary font-display-md">{data.notifications.upcoming}</span>
                </div>
                <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between border border-white/5 hover:border-white/20 transition-all">
                  <span className="text-xs text-on-surface-variant uppercase font-bold">Due Today</span>
                  <span className="text-2xl text-warning text-yellow-400 font-display-md">{data.notifications.dueToday}</span>
                </div>
                <div className="bg-error/10 rounded-xl p-4 flex flex-col justify-between border border-error/20">
                  <span className="text-xs text-error uppercase font-bold">Overdue</span>
                  <span className="text-2xl text-error font-display-md">{data.notifications.overdue}</span>
                </div>
                <div className="bg-primary-fixed/10 rounded-xl p-4 flex flex-col justify-between border border-primary-fixed/20">
                  <span className="text-xs text-primary-fixed uppercase font-bold">Completed Today</span>
                  <span className="text-2xl text-primary-fixed font-display-md">{data.notifications.completedToday}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Charts Row */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 border border-white/5 lg:col-span-2">
              <h2 className="text-on-surface-variant font-label-bold uppercase text-xs mb-6">Monthly Maintenance Cost</h2>
              <div className="h-[300px] w-full">
                {data.costAnalytics.monthly.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.costAnalytics.monthly}>
                      <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#A8F928" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#A8F928" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="month_name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="cost" name="Cost" stroke="#A8F928" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-on-surface-variant text-sm">No data available</div>
                )}
              </div>
            </div>
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h2 className="text-on-surface-variant font-label-bold uppercase text-xs mb-6">Cost by Category</h2>
              <div className="h-[300px] w-full">
                {data.costAnalytics.category.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.costAnalytics.category} cx="50%" cy="45%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                        {data.costAnalytics.category.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-on-surface-variant text-sm">No data available</div>
                )}
              </div>
            </div>
          </section>

          {/* Top Vehicles & Overdue Analytics */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h2 className="text-on-surface-variant font-label-bold uppercase text-xs mb-4">Top Vehicles Spotlight</h2>
              <div className="flex flex-col gap-3">
                <SpotlightRow 
                  label="Most Expensive" 
                  vehicle={data.topVehicles.mostExpensive?.registration_number} 
                  value={formatCurrency(data.topVehicles.mostExpensive?.total_cost || 0)} 
                  icon="attach_money" color="text-error" 
                />
                <SpotlightRow 
                  label="Most Frequently Serviced" 
                  vehicle={data.topVehicles.mostFrequent?.registration_number} 
                  value={`${data.topVehicles.mostFrequent?.total_services || 0} visits`} 
                  icon="build_circle" color="text-warning text-yellow-400" 
                />
                <SpotlightRow 
                  label="Highest Downtime" 
                  vehicle={data.topVehicles.highestDowntime?.registration_number} 
                  value={`${Math.round((data.topVehicles.highestDowntime?.total_downtime || 0)/60)} hrs`} 
                  icon="hourglass_empty" color="text-error" 
                />
                <SpotlightRow 
                  label="Most Reliable (Highest Health)" 
                  vehicle={data.topVehicles.mostReliable?.registration_number} 
                  value={`Score: ${data.topVehicles.mostReliable?.health_score || 100}`} 
                  icon="verified" color="text-primary-fixed" 
                />
              </div>
            </div>
            
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h2 className="text-on-surface-variant font-label-bold uppercase text-xs mb-4">Critical Health Vehicles (Bottom 5)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-2 text-[10px] text-on-surface-variant uppercase">Vehicle</th>
                      <th className="py-2 text-[10px] text-on-surface-variant uppercase text-right">Health Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topVehicles.lowestHealth.map(v => (
                      <tr key={v.registration_number} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                        <td className="py-3 font-bold text-sm text-primary">{v.registration_number}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${v.health_score < 60 ? 'bg-error/20 text-error' : 'bg-warning/20 text-yellow-400'}`}>
                            {v.health_score}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data.topVehicles.lowestHealth.length === 0 && (
                      <tr><td colSpan="2" className="py-4 text-center text-sm text-on-surface-variant">No vehicles found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Custom Calendar View */}
          <section className="glass-card rounded-2xl p-6 border border-white/5 min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-primary-fixed font-headline-md text-xl flex items-center gap-2">
                <span className="material-symbols-outlined">event_note</span>
                Maintenance Calendar
              </h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm"><FiSearch/></span>
                  <input 
                    type="text" placeholder="Search WO or Type..." 
                    value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})}
                    className="bg-surface-container-low border border-white/10 rounded-full py-1.5 pl-8 pr-4 text-xs focus:outline-none focus:border-primary/50 text-on-surface w-48 transition-all"
                  />
                </div>
                <div className="flex bg-surface-container-low border border-white/10 rounded-lg overflow-hidden p-0.5">
                  <button 
                    onClick={() => setCalendarMode('list')} 
                    className={`p-1.5 rounded transition-all ${calendarMode === 'list' ? 'bg-white/10 text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                    title="List View"
                  >
                    <FiList />
                  </button>
                  <button 
                    onClick={() => setCalendarMode('grid')} 
                    className={`p-1.5 rounded transition-all ${calendarMode === 'grid' ? 'bg-white/10 text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                    title="Calendar View"
                  >
                    <FiCalendar />
                  </button>
                </div>
              </div>
            </div>

            {calendarMode === 'list' ? (
              <div className="space-y-3">
                {calendarEvents.length > 0 ? calendarEvents.sort((a,b) => new Date(a.date) - new Date(b.date)).map(event => (
                  <div key={event.id} onClick={() => navigate(ROUTES.MAINTENANCE_DETAILS.replace(':id', event.id))} className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-white/5 hover:border-primary/30 hover:bg-white/5 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs ${event.status === 'Overdue' ? 'bg-error/20 text-error' : event.status === 'Completed' ? 'bg-primary-fixed/20 text-primary-fixed' : 'bg-secondary/20 text-secondary'}`}>
                        {new Date(event.date).getDate()} {new Date(event.date).toLocaleString('default', { month: 'short' })}
                      </div>
                      <div>
                        <p className="font-label-bold text-primary group-hover:text-primary-fixed transition-colors text-sm">{event.work_order_number || `WO-${event.id}`}</p>
                        <p className="text-xs text-on-surface-variant uppercase">{event.type}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold border ${event.status === 'Overdue' ? 'border-error text-error' : event.status === 'Completed' ? 'border-primary-fixed text-primary-fixed' : 'border-white/20 text-on-surface-variant'}`}>{event.status}</span>
                      <span className={`text-[9px] uppercase font-bold ${event.priority === 'Critical' ? 'text-error' : 'text-on-surface-variant'}`}>{event.priority}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-on-surface-variant">No events match your criteria.</div>
                )}
              </div>
            ) : (
              // Simple CSS Grid Calendar for Current Month (approximated for demo without large libraries)
              <div className="bg-surface-container-low rounded-xl border border-white/5 p-4 overflow-hidden">
                <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] font-label-bold text-on-surface-variant uppercase">
                  <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-2 auto-rows-[100px]">
                  {/* Creating a dummy grid for the current month */}
                  {Array.from({length: 35}).map((_, i) => {
                    const today = new Date();
                    const day = new Date(today.getFullYear(), today.getMonth(), i - today.getDay() + 1);
                    const isCurrentMonth = day.getMonth() === today.getMonth();
                    const dayEvents = calendarEvents.filter(e => new Date(e.date).toDateString() === day.toDateString());
                    
                    return (
                      <div key={i} className={`p-1 rounded-lg border flex flex-col ${isCurrentMonth ? 'bg-background border-white/10' : 'bg-transparent border-transparent opacity-30'} ${day.toDateString() === today.toDateString() ? 'border-primary/50 bg-primary/5' : ''}`}>
                        <span className={`text-xs p-1 ${day.toDateString() === today.toDateString() ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{day.getDate()}</span>
                        <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar">
                          {dayEvents.map(e => (
                            <div key={e.id} onClick={() => navigate(ROUTES.MAINTENANCE_DETAILS.replace(':id', e.id))} className={`text-[9px] p-1 rounded truncate cursor-pointer transition-colors ${e.status === 'Overdue' ? 'bg-error/20 text-error hover:bg-error/30' : e.status === 'Completed' ? 'bg-primary-fixed/20 text-primary-fixed hover:bg-primary-fixed/30' : 'bg-secondary/20 text-secondary hover:bg-secondary/30'}`} title={e.work_order_number}>
                              {e.work_order_number}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

function MetricCard({ title, value, color = "text-primary", bg = "bg-primary/10" }) {
  return (
    <div className={`p-4 rounded-xl border border-white/5 bg-surface-container-low relative overflow-hidden group`}>
      <div className={`absolute -right-4 -top-4 w-12 h-12 rounded-full blur-xl ${bg} group-hover:scale-150 transition-transform`}></div>
      <p className="text-[10px] font-label-bold text-on-surface-variant uppercase mb-1 truncate">{title}</p>
      <p className={`text-2xl font-display-md ${color} truncate`}>{value}</p>
    </div>
  );
}

function SpotlightRow({ label, vehicle, value, icon, color }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-white/5">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 ${color}`}>
          <span className="material-symbols-outlined text-[16px]">{icon}</span>
        </div>
        <div>
          <p className="text-[10px] text-on-surface-variant uppercase font-bold">{label}</p>
          <p className="text-sm font-bold text-on-surface">{vehicle || 'N/A'}</p>
        </div>
      </div>
      <div className={`text-sm font-mono font-bold ${color}`}>{value}</div>
    </div>
  );
}
