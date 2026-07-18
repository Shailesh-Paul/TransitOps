import React, { useState, useEffect } from 'react';
import { getEnterpriseAnalytics } from '../../../services/fuelService';
import { formatCurrency, formatNum } from '../../../utils/helpers';
import Loader from '../../../components/Loader';
import { FiAlertCircle, FiMapPin } from 'react-icons/fi';

export default function FuelStations({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getEnterpriseAnalytics('stations', filters);
        if (isMounted) setData(res.data);
      } catch (err) {
        if (isMounted) setError('Failed to load Station Analytics');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStations();
    return () => { isMounted = false; };
  }, [filters]);

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader /></div>;
  if (error) return <div className="text-rose-500 flex items-center gap-2"><FiAlertCircle /> {error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
        <FiMapPin className="text-fuchsia-600" />
        Fuel Station Intelligence
      </h2>
      
      {data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.map((station, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl bg-fuchsia-50 group-hover:scale-150 transition-transform"></div>
              
              <div className="relative z-10">
                <h3 className="text-sm font-extrabold text-slate-900 mb-4 truncate" title={station.station}>{station.station}</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Visits</span>
                    <span className="text-sm font-bold text-slate-900">{station.visits}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Total Spend</span>
                    <span className="text-sm font-bold text-rose-600">{formatCurrency(station.totalCost)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Fuel Volume</span>
                    <span className="text-sm font-bold text-indigo-600">{formatNum(station.totalLiters)} L</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Avg Price/Litre</span>
                    <span className="text-sm font-extrabold text-emerald-600">{formatCurrency(station.avgPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <FiMapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No station data available for the selected filters.</p>
        </div>
      )}
    </div>
  );
}
