import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';
import { FiDownload, FiFilter } from 'react-icons/fi';

import FuelKPIs from './components/FuelKPIs';
import FuelCharts from './components/FuelCharts';
import FuelRankings from './components/FuelRankings';
import FuelStations from './components/FuelStations';
import FuelComparison from './components/FuelComparison';

export default function FuelDashboard() {
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    vehicle_id: '',
    driver_id: '',
    station: '',
    fuel_type: ''
  });

  const handleExport = (format) => {
    toast(`Export to ${format} is being prepared by the backend.`, { icon: '📊' });
  };

  return (
    <div className="flex flex-col gap-8 w-full pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
        <div>
          <button onClick={() => navigate(ROUTES.FUEL)} className="text-slate-500 hover:text-primary-600 flex items-center gap-1 mb-4 text-sm font-bold transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Fuel Logs
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-indigo-600">query_stats</span>
            Enterprise Fuel Analytics
          </h1>
          <p className="text-slate-500 mt-1">Advanced intelligence and aggregation engine for fleet fuel operations.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleExport('PDF')} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm text-sm">
            <FiDownload /> PDF
          </button>
          <button onClick={() => handleExport('Excel')} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm text-sm">
            <FiDownload /> Excel
          </button>
          <button onClick={() => handleExport('CSV')} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm text-sm">
            <FiDownload /> CSV
          </button>
        </div>
      </header>

      {/* Global Filters */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FiFilter /> Global Filters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date</label>
            <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">End Date</label>
            <input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Fuel Type</label>
            <select value={filters.fuel_type} onChange={e => setFilters({...filters, fuel_type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Types</option>
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="CNG">CNG</option>
              <option value="Electric">Electric</option>
            </select>
          </div>
          <div className="lg:col-span-2 xl:col-span-3">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Station (Contains)</label>
            <input type="text" placeholder="e.g. Shell, IOCL..." value={filters.station} onChange={e => setFilters({...filters, station: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      </section>

      {/* Analytics Sections */}
      <div className="space-y-12">
        <FuelKPIs filters={filters} />
        
        <div className="w-full h-px bg-slate-200 my-8"></div>
        <FuelCharts filters={filters} />
        
        <div className="w-full h-px bg-slate-200 my-8"></div>
        <FuelRankings filters={filters} />
        
        <div className="w-full h-px bg-slate-200 my-8"></div>
        <FuelStations filters={filters} />
        
        <div className="w-full h-px bg-slate-200 my-8"></div>
        <FuelComparison filters={filters} />
      </div>

    </div>
  );
}
