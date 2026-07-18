import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCcw, FiAlertCircle, FiEye } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import SearchBar from '../../components/SearchBar';
import ConfirmModal from '../../components/ConfirmModal';
import { getVehicles, deleteVehicle, restoreVehicle } from '../../services/vehicleService';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [makeFilter, setMakeFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [restoreModal, setRestoreModal] = useState({ isOpen: false, id: null });
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Depending on apiClient implementation, getVehicles returns { data, meta } or just data
      const params = { page, limit, search: searchTerm, includeDeleted: showArchived };
      if (statusFilter) params.status = statusFilter;
      if (makeFilter) params.make = makeFilter;
      const response = await getVehicles(params);
      
      // If apiClient unwraps meta, it'll be an object with data & meta
      if (response && response.data !== undefined) {
        setVehicles(response.data);
        setMeta(response.meta || { totalPages: 1 });
      } else {
        // Fallback if apiClient only returns the array
        setVehicles(Array.isArray(response) ? response : []);
        setMeta({ totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load vehicles:', err);
      setError('Failed to fetch vehicles from the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, statusFilter, makeFilter, showArchived]);

  // Debounce search slightly and reset page when searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 on new search
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, makeFilter, showArchived, loadData]);

  const handleDelete = async () => {
    try {
      await deleteVehicle(deleteModal.id);
      toast.success('Vehicle archived successfully');
      setDeleteModal({ isOpen: false, id: null });
      loadData();
    } catch {
      toast.error('Failed to archive vehicle');
    }
  };

  const handleRestore = async () => {
    try {
      await restoreVehicle(restoreModal.id);
      toast.success('Vehicle restored successfully');
      setRestoreModal({ isOpen: false, id: null });
      loadData();
    } catch {
      toast.error('Failed to restore vehicle');
    }
  };

  const columns = [
    { header: 'Vehicle', render: (v) => (
      <div>
        <Link to={ROUTES.VEHICLES_DETAILS.replace(':id', v.id)} className="font-medium text-primary-600 hover:text-primary-700 hover:underline">{`${v.make} ${v.model}`}</Link>
        <div className="text-xs text-slate-500">{v.registration_number}</div>
      </div>
    )},
    { header: 'Type / Make', accessor: 'make' },
    { header: 'Capacity', accessor: 'capacity' },
    { header: 'Odometer', accessor: 'mileage', render: (v) => `${Number(v.mileage || v.current_odometer || 0).toLocaleString()} km` },
    { header: 'Status', render: (v) => <StatusBadge status={v.status} /> },
    { header: 'Driver', render: () => <span className="text-slate-400 italic">Unassigned</span> },
    { header: 'Created', render: (v) => format(new Date(v.created_at), 'MMM dd, yyyy') },
    { header: 'Actions', render: (v) => (
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(ROUTES.VEHICLES_DETAILS.replace(':id', v.id))} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors" title="View Details">
          <FiEye />
        </button>
        {v.deleted_at ? (
          <button onClick={() => setRestoreModal({ isOpen: true, id: v.id })} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Restore">
            <FiRefreshCcw />
          </button>
        ) : (
          <>
            <button onClick={() => navigate(ROUTES.VEHICLES_EDIT.replace(':id', v.id))} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors" title="Edit"><FiEdit2 /></button>
            <button onClick={() => setDeleteModal({ isOpen: true, id: v.id })} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Archive"><FiTrash2 /></button>
          </>
        )}
      </div>
    )}
  ];

  const paginationProps = {
    currentPage: page,
    totalPages: meta?.totalPages || 1,
    itemsPerPage: limit,
    currentData: vehicles, // Used by DataTable for displaying counts
    prevPage: () => setPage(p => Math.max(1, p - 1)),
    nextPage: () => setPage(p => p + 1)
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Vehicles" 
        description="Manage your fleet vehicles and equipment."
        action={
          <Link to={ROUTES.VEHICLES_ADD} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <FiPlus className="w-4 h-4" /> Add Vehicle
          </Link>
        }
      />
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full max-w-md">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search by name, model or registration..." />
          </div>
          <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Reserved">Reserved</option>
              <option value="Retired">Retired</option>
            </select>
            <select value={makeFilter} onChange={(e) => setMakeFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="">All Makes</option>
              <option value="Tata">Tata</option>
              <option value="Ashok Leyland">Ashok Leyland</option>
              <option value="Volvo">Volvo</option>
              <option value="BharatBenz">BharatBenz</option>
              <option value="Eicher">Eicher</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer whitespace-nowrap">
              <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
              Show Archived
            </label>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col relative">
          {loading && vehicles.length === 0 ? (
            <div className="flex-1 p-8 flex flex-col justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-slate-500">Loading vehicles...</p>
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
          ) : (
            <div className={`flex-1 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <DataTable columns={columns} data={vehicles} pagination={paginationProps} />
            </div>
          )}
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, id: null })} 
        onConfirm={handleDelete}
        title="Archive Vehicle"
        message="Are you sure you want to archive this vehicle? It will be removed from the active fleet but can be restored later."
        confirmText="Archive"
      />
      <ConfirmModal 
        isOpen={restoreModal.isOpen} 
        onClose={() => setRestoreModal({ isOpen: false, id: null })} 
        onConfirm={handleRestore}
        title="Restore Vehicle"
        message="Are you sure you want to restore this archived vehicle back to the active fleet?"
        confirmText="Restore"
      />
    </div>
  );
}
