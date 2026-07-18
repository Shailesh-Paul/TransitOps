import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiPlay, FiCheckSquare, FiXSquare, FiSend, FiRefreshCcw, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import SearchBar from '../../components/SearchBar';
import ConfirmModal from '../../components/ConfirmModal';
import DispatchConfirmationModal from '../../components/DispatchConfirmationModal';
import { ROUTES } from '../../constants/routes';
import { getTrips, deleteTrip, dispatchTrip, startTrip, completeTrip, cancelTrip } from '../../services/tripService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const hubAlphaIcon = L.divIcon({
  className: 'bg-transparent border-0',
  html: `
    <div class="relative flex flex-col items-center">
      <div class="w-4 h-4 bg-primary-fixed rounded-full shadow-[0_0_15px_#ccff00] animate-pulse"></div>
      <div class="bg-surface/80 backdrop-blur text-primary text-[10px] uppercase font-label-bold px-2 py-1 rounded border border-white/10 mt-2 whitespace-nowrap whitespace-pre">Hub Alpha</div>
    </div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const deliveryXIcon = L.divIcon({
  className: 'bg-transparent border-0',
  html: `
    <div class="relative flex flex-col items-center">
      <div class="w-4 h-4 bg-secondary rounded-full shadow-[0_0_15px_var(--color-secondary)] animate-pulse"></div>
      <div class="bg-surface/80 backdrop-blur text-primary text-[10px] uppercase font-label-bold px-2 py-1 rounded border border-white/10 mt-2 whitespace-nowrap whitespace-pre">Delivery X</div>
    </div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export default function TripList() {
  const [trips, setTrips] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const navigate = useNavigate();

  // Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit, search: searchTerm };
      if (statusFilter) params.status = statusFilter;
      
      const response = await getTrips(params);
      if (response && response.data !== undefined) {
        setTrips(response.data);
        setMeta(response.meta || { totalPages: 1 });
      } else {
        setTrips(Array.isArray(response) ? response : []);
        setMeta({ totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
      setError('Failed to fetch trips from the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, loadData]);

  const handleAction = async (actionFn, id, successMessage) => {
    try {
      await actionFn(id);
      toast.success(successMessage);
      loadData();
    } catch (err) {
      toast.error(`Action failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDispatchClick = (trip) => {
    setSelectedTrip(trip);
    setIsModalOpen(true);
  };

  const handleConfirmDispatch = async (tripId) => {
    setIsDispatching(true);
    try {
      await dispatchTrip(tripId);
      toast.success('Trip dispatched successfully! Vehicle and Driver reserved.');
      setIsModalOpen(false);
      loadData(); // Refresh UI instantly
    } catch (error) {
      const response = error.response?.data;
      if (error.response?.status === 422 || error.response?.status === 409) {
        toast.error(`Dispatch Failed: ${response?.message || 'Business rule conflict'}`);
      } else {
        toast.error(response?.message || 'Failed to dispatch due to a server error');
      }
    } finally {
      setIsDispatching(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteTrip(deleteModal.id);
      toast.success('Trip deleted successfully');
      setDeleteModal({ isOpen: false, id: null });
      loadData();
    } catch (err) {
      toast.error('Failed to delete trip');
    }
  };

  const columns = [
    { header: 'Trip #', render: (t) => <span className="font-medium text-primary-600">TRP-{t.id}</span> },
    { header: 'Source/Destination', render: (t) => (
        <div className="flex flex-col">
          <span className="text-slate-900 text-sm truncate max-w-[200px] font-medium">{t.route_name || 'Custom Route'}</span>
          <span className="text-xs text-slate-500 font-mono mt-0.5">{t.distance_km} km</span>
        </div>
    )},
    { header: 'Vehicle', render: (t) => t.registration_number ? <span className="text-sm bg-slate-100 px-2 py-0.5 rounded border">{t.registration_number}</span> : <span className="text-xs italic text-slate-400">Unassigned</span> },
    { header: 'Driver', render: (t) => t.driver_first_name ? <span className="text-sm font-medium">{t.driver_first_name} {t.driver_last_name}</span> : <span className="text-xs italic text-slate-400">Unassigned</span> },
    { header: 'Cargo Weight', render: (t) => <span className="text-xs text-slate-400">{t.cargo_weight ? `${t.cargo_weight} kg` : 'N/A'}</span> },
    { header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { header: 'Created', render: (t) => <span className="text-sm text-slate-600">{format(new Date(t.created_at || Date.now()), 'MMM dd, yyyy')}</span> },
    { header: 'Actions', render: (t) => (
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(ROUTES.TRIPS_DETAILS.replace(':id', t.id))} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors" title="View"><FiEye /></button>
        {t.status === 'Scheduled' && (
          <button onClick={() => setDeleteModal({ isOpen: true, id: t.id })} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Cancel Trip"><FiTrash2 /></button>
        )}
        
        {(t.status === 'Draft' || t.status === 'Assigned' || t.status === 'scheduled') && (
           <>
             <button onClick={() => handleDispatchClick(t)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Dispatch"><FiSend /></button>
             <button onClick={() => handleAction(cancelTrip, t.id, 'Trip Cancelled')} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Cancel"><FiXSquare /></button>
           </>
        )}
        
        {(t.status === 'Dispatched' || t.status === 'in_progress') && ( // Backend 'in_progress' implies dispatched
           <button onClick={() => handleAction(startTrip, t.id, 'Trip Started')} className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors" title="Start"><FiPlay /></button>
        )}
        
        {t.status === 'In Progress' && ( 
           <button onClick={() => handleAction(completeTrip, t.id, 'Trip Completed')} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Complete"><FiCheckSquare /></button>
        )}
      </div>
    )}
  ];

  const paginationProps = {
    currentPage: page,
    totalPages: meta?.totalPages || 1,
    itemsPerPage: limit,
    currentData: trips,
    prevPage: () => setPage(p => Math.max(1, p - 1)),
    nextPage: () => setPage(p => p + 1)
  };

  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 w-full">
        <div>
          <h1 className="font-display-lg text-primary text-4xl mb-2 tracking-tighter uppercase font-extrabold">Dispatch & Trips</h1>
          <p className="text-on-surface-variant font-body-lg">Manage fleet assignments and active routes.</p>
        </div>
        <div className="flex gap-4">
          <Link to={ROUTES.TRIPS_CREATE} className="px-6 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-label-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,249,40,0.3)] shrink-0">
            <span className="material-symbols-outlined text-[18px]">add_road</span>
            New Trip
          </Link>
        </div>
      </header>

      {/* Interactive Map Header */}
      <section className="h-[500px] rounded-xl relative overflow-hidden mb-gutter border border-white/10 group bg-[#020617] p-0 z-0">
        <MapContainer 
          key="mumbai-map"
          center={[19.0760, 72.8777]} 
          zoom={12} 
          style={{ height: '100%', width: '100%', backgroundColor: '#020617' }} 
          zoomControl={true}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          
          <Marker position={[19.0760, 72.8777]} icon={hubAlphaIcon}>
            <Popup className="premium-popup">
              <div className="bg-surface p-2 text-primary font-label-bold rounded-lg border border-primary-fixed/30 shadow-[0_0_15px_rgba(168,249,40,0.2)] text-xs">
                Mumbai Central Hub
              </div>
            </Popup>
          </Marker>

          <Marker position={[19.1136, 72.8697]} icon={deliveryXIcon}>
            <Popup className="premium-popup">
              <div className="bg-surface p-2 text-primary font-label-bold rounded-lg border border-secondary/30 shadow-[0_0_15px_rgba(188,195,255,0.2)] text-xs">
                Andheri East Dropoff
              </div>
            </Popup>
          </Marker>
        </MapContainer>
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_60%,rgba(2,6,23,0.9)_100%)] pointer-events-none z-[400]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary-fixed/10 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none z-[400]">
          <div className="w-[400px] h-full bg-gradient-to-r from-transparent to-primary-fixed/5 origin-right"></div>
        </div>
      </section>

      {/* Trip List Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full max-w-md">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search trips by ID, route, driver, or vehicle..." />
          </div>
          <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Assigned">Assigned</option>
              <option value="Dispatched">Dispatched</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button onClick={loadData} className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-transparent hover:border-primary-100" title="Refresh">
              <FiRefreshCcw />
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col relative">
          {loading && trips.length === 0 ? (
            <div className="flex-1 p-8 flex flex-col justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-slate-500">Loading trips...</p>
            </div>
          ) : error ? (
            <div className="flex-1 p-8 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                <FiAlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Data</h3>
              <p className="text-slate-500 mb-4 max-w-sm">{error}</p>
              <button onClick={loadData} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                <FiRefreshCcw className="w-4 h-4" /> Retry
              </button>
            </div>
          ) : trips.length === 0 ? (
            <div className="flex-1 p-8 flex flex-col justify-center items-center text-center text-slate-500">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px]">route</span>
              </div>
              <p>No trips found matching your criteria.</p>
            </div>
          ) : (
            <div className={`flex-1 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <DataTable columns={columns} data={trips} pagination={paginationProps} />
            </div>
          )}
        </div>
      </div>

      <DispatchConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDispatch}
        trip={selectedTrip}
        isDispatching={isDispatching}
      />
    </>
  );
}
