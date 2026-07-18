import React, { useState, useEffect } from 'react';
import { getEnterpriseAnalytics } from '../../../services/fuelService';
import { formatCurrency, formatNum } from '../../../utils/helpers';
import Loader from '../../../components/Loader';
import { FiAlertCircle } from 'react-icons/fi';

export default function FuelRankings({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRankings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getEnterpriseAnalytics('rankings', filters);
        if (isMounted) setData(res.data);
      } catch (err) {
        if (isMounted) setError('Failed to load Rankings');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRankings();
    return () => { isMounted = false; };
  }, [filters]);

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader /></div>;
  if (error) return <div className="text-rose-500 flex items-center gap-2"><FiAlertCircle /> {error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-500">directions_car</span>
          Vehicle Analytics Rankings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RankingList title="Best Efficiency" data={data.vehicles?.bestEfficiency} metricKey="efficiency" metricFormatter={(v) => `${formatNum(v)} km/L`} nameKey="registration_number" />
          <RankingList title="Lowest Efficiency" data={data.vehicles?.worstEfficiency} metricKey="efficiency" metricFormatter={(v) => `${formatNum(v)} km/L`} nameKey="registration_number" isNegative />
          <RankingList title="Highest Cost" data={data.vehicles?.highestCost} metricKey="cost" metricFormatter={formatCurrency} nameKey="registration_number" isNegative />
          <RankingList title="Highest Consumers" data={data.vehicles?.highestConsumers} metricKey="liters" metricFormatter={(v) => `${formatNum(v)} L`} nameKey="registration_number" />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-teal-500">person</span>
          Driver Analytics Rankings (Trip-Linked)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RankingList title="Most Efficient Drivers" data={data.drivers?.mostEfficient} metricKey="efficiency" metricFormatter={(v) => `${formatNum(v)} km/L`} nameKey="name" />
          <RankingList title="Lowest Average Efficiency" data={data.drivers?.lowestEfficiency} metricKey="efficiency" metricFormatter={(v) => `${formatNum(v)} km/L`} nameKey="name" isNegative />
          <RankingList title="Highest Fuel Consumers" data={data.drivers?.highestConsumers} metricKey="liters" metricFormatter={(v) => `${formatNum(v)} L`} nameKey="name" />
        </div>
      </div>

    </div>
  );
}

function RankingList({ title, data, metricKey, metricFormatter, nameKey, isNegative = false }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="flex-1 p-2">
        {data && data.length > 0 ? (
          <ul className="divide-y divide-slate-50">
            {data.map((item, idx) => (
              <li key={item[nameKey] + idx} className="py-2 px-2 flex justify-between items-center hover:bg-slate-50 rounded transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${idx < 3 ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-sm text-slate-900">{item[nameKey] || 'Unknown'}</span>
                </div>
                <span className={`text-sm font-bold ${isNegative ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {item[metricKey] ? metricFormatter(item[metricKey]) : '-'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-8 text-center text-slate-400 text-sm italic">No data</div>
        )}
      </div>
    </div>
  );
}
