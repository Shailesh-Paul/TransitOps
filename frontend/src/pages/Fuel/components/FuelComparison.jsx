import React, { useState, useEffect } from 'react';
import { getEnterpriseAnalytics } from '../../../services/fuelService';
import { getVehicles } from '../../../services/vehicleService';
import { formatCurrency, formatNum } from '../../../utils/helpers';
import Loader from '../../../components/Loader';
import { FiAlertCircle, FiGitCommit } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export default function FuelComparison({ filters }) {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleA, setVehicleA] = useState('');
  const [vehicleB, setVehicleB] = useState('');
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchVehicles = async () => {
      try {
        const res = await getVehicles({ limit: 1000 });
        if (isMounted) setVehicles(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load vehicles for comparison");
      }
    };
    fetchVehicles();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!vehicleA || !vehicleB) return;
    
    let isMounted = true;
    const fetchComparison = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getEnterpriseAnalytics('compare', { ...filters, vehicleA, vehicleB });
        if (isMounted) setData(res.data);
      } catch (err) {
        if (isMounted) setError('Failed to load Comparison');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchComparison();
    return () => { isMounted = false; };
  }, [filters, vehicleA, vehicleB]);

  const getVehicleName = (id) => {
    const v = vehicles.find(v => v.id == id);
    return v ? v.registration_number : `Vehicle ${id}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-6">
          <FiGitCommit className="text-blue-500" />
          Vehicle Comparison Mode
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vehicle A</label>
            <select 
              value={vehicleA} 
              onChange={e => setVehicleA(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Vehicle A</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id} disabled={v.id == vehicleB}>{v.registration_number}</option>
              ))}
            </select>
          </div>
          
          <div className="w-12 h-12 shrink-0 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-extrabold italic text-lg">
            VS
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vehicle B</label>
            <select 
              value={vehicleB} 
              onChange={e => setVehicleB(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Vehicle B</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id} disabled={v.id == vehicleA}>{v.registration_number}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && <div className="h-64 flex items-center justify-center"><Loader /></div>}
      {error && <div className="text-rose-500 flex items-center gap-2"><FiAlertCircle /> {error}</div>}
      
      {!loading && !error && data && data.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComparisonChart data={data} dataKey="efficiency" name="Efficiency (km/L)" color="#059669" formatter={(v) => formatNum(v)} getVehicleName={getVehicleName} />
          <ComparisonChart data={data} dataKey="costPerKm" name="Cost per KM (₹)" color="#e11d48" formatter={(v) => formatCurrency(v)} getVehicleName={getVehicleName} />
          <ComparisonChart data={data} dataKey="cost" name="Total Cost (₹)" color="#2563eb" formatter={(v) => formatCurrency(v)} getVehicleName={getVehicleName} />
          <ComparisonChart data={data} dataKey="liters" name="Total Fuel (L)" color="#4f46e5" formatter={(v) => formatNum(v)} getVehicleName={getVehicleName} />
        </div>
      )}
      
      {!loading && !error && data && data.length === 0 && vehicleA && vehicleB && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <p className="text-slate-500 font-medium">No comparison data available for the selected vehicles and timeframe.</p>
        </div>
      )}
    </div>
  );
}

function ComparisonChart({ data, dataKey, name, color, formatter, getVehicleName }) {
  const chartData = data.map(d => ({
    name: getVehicleName(d.vehicle_id),
    [dataKey]: parseFloat(d[dataKey] || 0)
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl">
          <p className="text-white font-bold text-sm mb-1">{label}</p>
          <p className="text-sm font-mono" style={{ color: payload[0].color }}>
            {payload[0].name}: {formatter(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">{name}</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => {
              if(dataKey === 'cost') return `₹${val/1000}k`;
              return val;
            }} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey={dataKey} name={name} fill={color} radius={[4, 4, 0, 0]} barSize={60} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
