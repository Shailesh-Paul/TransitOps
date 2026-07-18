import React, { useState, useEffect } from 'react';
import { getEnterpriseAnalytics } from '../../../services/fuelService';
import { formatCurrency, formatNum } from '../../../utils/helpers';
import Loader from '../../../components/Loader';
import { FiAlertCircle } from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line
} from 'recharts';

export default function FuelCharts({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCharts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getEnterpriseAnalytics('charts', filters);
        if (isMounted) setData(res.data);
      } catch (err) {
        if (isMounted) setError('Failed to load Charts');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCharts();
    return () => { isMounted = false; };
  }, [filters]);

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader /></div>;
  if (error) return <div className="text-rose-500 flex items-center gap-2"><FiAlertCircle /> {error}</div>;
  if (!data) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl">
          <p className="text-white font-bold text-sm mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-sm font-mono" style={{ color: p.color }}>
              {p.name}: {p.name.includes('Cost') || p.name === 'cost' ? formatCurrency(p.value) : formatNum(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Trends Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Fuel Consumption (L)">
          {data.monthlyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTrend}>
                <defs>
                  <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="consumed" name="Consumed" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCons)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>

        <ChartCard title="Monthly Fuel Cost (INR)">
          {data.monthlyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="cost" name="Cost" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Fleet Efficiency Trend (km/L)">
          {data.monthlyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="avgEfficiency" name="Efficiency" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>

        <ChartCard title="Cost per KM Trend (INR)">
          {data.monthlyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="avgCostPerKm" name="Cost/KM" stroke="#d97706" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Top Vehicles by Cost">
          {data.vehicleComparison?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.vehicleComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `₹${val/1000}k`} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={80} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="cost" name="Cost" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>

        <ChartCard title="Top Drivers by Cost (Trip Linked)">
          {data.driverComparison?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.driverComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `₹${val/1000}k`} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={80} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="cost" name="Cost" fill="#0891b2" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>

        <ChartCard title="Top Stations by Spend">
          {data.stationSpend?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stationSpend} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `₹${val/1000}k`} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={80} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="cost" name="Cost" fill="#7c3aed" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>
      </div>
      
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">{title}</h3>
      <div className="h-[250px] w-full flex-1">
        {children}
      </div>
    </div>
  );
}

function NoData() {
  return <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">No data available</div>;
}
