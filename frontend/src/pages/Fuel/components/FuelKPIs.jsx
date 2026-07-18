import React, { useState, useEffect } from 'react';
import { getEnterpriseAnalytics } from '../../../services/fuelService';
import { formatCurrency, formatNum } from '../../../utils/helpers';
import Loader from '../../../components/Loader';
import { FiAlertCircle } from 'react-icons/fi';

export default function FuelKPIs({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchKpis = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getEnterpriseAnalytics('kpis', filters);
        if (isMounted) setData(res.data);
      } catch (err) {
        if (isMounted) setError('Failed to load KPIs');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchKpis();
    return () => { isMounted = false; };
  }, [filters]);

  if (loading) return <div className="h-32 flex items-center justify-center"><Loader /></div>;
  if (error) return <div className="text-rose-500 flex items-center gap-2"><FiAlertCircle /> {error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <MetricCard title="Total Entries" value={data.counts?.totalEntries || 0} />
        <MetricCard title="Trip-Linked" value={data.counts?.tripLinkedEntries || 0} color="text-blue-600" bg="bg-blue-50" />
        <MetricCard title="Unassigned" value={data.counts?.unassignedEntries || 0} color="text-slate-600" bg="bg-slate-50" />
        
        <MetricCard title="Total Consumed (L)" value={formatNum(data.totalConsumed)} color="text-indigo-600" bg="bg-indigo-50" />
        <MetricCard title="Total Cost" value={formatCurrency(data.totalCost)} color="text-rose-600" bg="bg-rose-50" />
        
        <MetricCard title="Fleet Avg Eff." value={`${formatNum(data.fleetAvgEfficiency)} km/L`} color="text-emerald-600" bg="bg-emerald-50" />
        <MetricCard title="Fleet Cost/KM" value={formatCurrency(data.fleetAvgCostPerKm)} />
        <MetricCard title="Monthly Spend" value={formatCurrency(data.monthlySpend)} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HighlightCard 
          title="Best Fuel Efficiency" 
          vehicle={data.bestVehicle?.registration_number} 
          metric={`${formatNum(data.bestVehicle?.avgEff)} km/L`}
          icon="trending_up"
          colorClass="text-emerald-600 bg-emerald-50"
        />
        <HighlightCard 
          title="Worst Fuel Efficiency" 
          vehicle={data.worstVehicle?.registration_number} 
          metric={`${formatNum(data.worstVehicle?.avgEff)} km/L`}
          icon="trending_down"
          colorClass="text-rose-600 bg-rose-50"
        />
        <HighlightCard 
          title="Highest Fuel Consumer" 
          vehicle={data.highestConsumer?.registration_number} 
          metric={`${formatNum(data.highestConsumer?.totalConsumed)} Liters`}
          icon="local_gas_station"
          colorClass="text-amber-600 bg-amber-50"
        />
      </div>
    </div>
  );
}

function MetricCard({ title, value, color = "text-slate-900", bg = "bg-primary-50" }) {
  return (
    <div className={`p-4 rounded-xl border border-slate-100 bg-white relative overflow-hidden group shadow-sm`}>
      <div className={`absolute -right-4 -top-4 w-12 h-12 rounded-full blur-xl ${bg} group-hover:scale-150 transition-transform`}></div>
      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 truncate">{title}</p>
      <p className={`text-xl font-extrabold ${color} truncate`}>{value}</p>
    </div>
  );
}

function HighlightCard({ title, vehicle, metric, icon, colorClass }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
        {vehicle ? (
          <>
            <p className="text-lg font-extrabold text-slate-900">{vehicle}</p>
            <p className="text-sm font-semibold text-slate-500 mt-1">{metric}</p>
          </>
        ) : (
          <p className="text-sm text-slate-400">No data available</p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
    </div>
  );
}
