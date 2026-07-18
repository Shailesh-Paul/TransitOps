import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import { getExpenses } from '../../services/expenseService';
import { getTrips } from '../../services/tripService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const [expenses] = await Promise.all([getExpenses(), getTrips()]);
        
        // Transform data generically for mock
        const expenseByCategory = expenses.reduce((acc, curr) => {
          acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
          return acc;
        }, {});
        const expensePieData = Object.keys(expenseByCategory).map(key => ({ name: key, value: expenseByCategory[key] }));

        const timelineData = [
          { month: 'Jan', cost: 12000, revenue: 19000, efficiency: 8.4 },
          { month: 'Feb', cost: 11000, revenue: 21000, efficiency: 8.6 },
          { month: 'Mar', cost: 15000, revenue: 25000, efficiency: 8.2 },
          { month: 'Apr', cost: 10000, revenue: 22000, efficiency: 8.9 },
          { month: 'May', cost: 9000, revenue: 26000, efficiency: 9.1 },
          { month: 'Jun', cost: 14000, revenue: 28000, efficiency: 8.5 },
        ];

        setData({ expensePieData, timelineData });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadReportData();
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <PageHeader title="Financial & Operational Reports" description="Analyze your fleet's performance and expenditure." />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operating Costs */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Operating Costs Breakdown</h3>
          <div className="h-80 w-full text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.expensePieData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                  {data.expensePieData.map((e, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue vs Cost */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Revenue vs Cost</h3>
          <div className="h-80 w-full text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.timelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} tick={{fill:'#64748b'}} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="cost" fill="#ef4444" radius={[4, 4, 0, 0]} name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fuel Efficiency */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Fuel Efficiency Trend (km/L)</h3>
          <div className="h-72 w-full text-sm">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timelineData}>
                <defs>
                  <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#64748b'}} />
                <YAxis axisLine={false} tickLine={false} domain={[5, 12]} tick={{fill:'#64748b'}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEff)" name="Efficiency (km/L)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
