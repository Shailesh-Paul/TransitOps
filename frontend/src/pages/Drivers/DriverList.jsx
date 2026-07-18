import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCcw, FiAlertCircle, FiEye } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import SearchBar from '../../components/SearchBar';
import ConfirmModal from '../../components/ConfirmModal';
import { ROUTES } from '../../constants/routes';
import { getDrivers, deleteDriver, restoreDriver } from '../../services/driverService';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';

export default function DriverList() {
  const [drivers, setDrivers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [validityFilter, setValidityFilter] = useState('');
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
      const params = { page, limit, search: searchTerm, includeDeleted: showArchived };
      if (statusFilter) params.status = statusFilter;
      if (validityFilter) params.validity = validityFilter;
      
      const response = await getDrivers(params);
      
      if (response && response.data !== undefined) {
        setDrivers(response.data);
        setMeta(response.meta || { totalPages: 1 });
      } else {
        setDrivers(Array.isArray(response) ? response : []);
        setMeta({ totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load drivers:', err);
      setError('Failed to fetch drivers from the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, statusFilter, validityFilter, showArchived]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, validityFilter, showArchived, loadData]);

  const handleDelete = async () => {
    try {
      await deleteDriver(deleteModal.id);
      toast.success('Driver archived successfully');
      setDeleteModal({ isOpen: false, id: null });
      loadData();
    } catch {
      toast.error('Failed to archive driver');
    }
  };

  const handleRestore = async () => {
    try {
      await restoreDriver(restoreModal.id);
      toast.success('Driver restored successfully');
      setRestoreModal({ isOpen: false, id: null });
      loadData();
    } catch {
      toast.error('Failed to restore driver');
    }
  };

  const getLicenseStatus = (expiryDate) => {
    if (!expiryDate) return { color: 'bg-slate-300', text: 'Unknown' };
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days < 0) return { color: 'bg-rose-500', text: 'Expired' };
    if (days <= 30) return { color: 'bg-amber-500', text: 'Expiring Soon' };
    return { color: 'bg-emerald-500', text: 'Valid' };
  };

  const columns = [
    { header: 'Driver', render: (d) => (
      <div>
        <div className="font-medium text-slate-900">{(d.first_name || d.name || d.displayName || 'Unknown') + (d.last_name ? ` ${d.last_name}` : '')}</div>
        <div className="text-xs text-slate-500">{d.phone}</div>
      </div>
    )},
    { header: 'License Number', render: (d) => {
      const status = getLicenseStatus(d.license_expiry);
      return (
        <div className="flex flex-col">
          <span className="font-medium">{d.license_number}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{d.license_expiry ? format(new Date(d.license_expiry), 'MMM dd, yyyy') : 'N/A'}</span>
          </div>
        </div>
      );
    }},
    { header: 'Safety Score', render: () => <span className="text-slate-400 italic">N/A</span> },
    { header: 'Status', render: (d) => <StatusBadge status={d.status} /> },
    { header: 'Actions', render: (d) => (
      <div className="flex items-center gap-2">
        {d.deleted_at ? (
          <button onClick={() => setRestoreModal({ isOpen: true, id: d.id })} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Restore">
            <FiRefreshCcw />
          </button>
        ) : (
          <>
            <button onClick={() => navigate(ROUTES.DRIVERS_DETAILS.replace(':id', d.id))} className="p-1.5 text-slate-400 hover:text-secondary hover:bg-secondary/10 rounded transition-colors" title="View Details"><FiEye /></button>
            <button onClick={() => navigate(ROUTES.DRIVERS_EDIT.replace(':id', d.id))} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors" title="Edit"><FiEdit2 /></button>
            <button onClick={() => setDeleteModal({ isOpen: true, id: d.id })} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Archive"><FiTrash2 /></button>
          </>
        )}
      </div>
    )}
  ];

  const paginationProps = {
    currentPage: page,
    totalPages: meta?.totalPages || 1,
    itemsPerPage: limit,
    currentData: drivers,
    prevPage: () => setPage(p => Math.max(1, p - 1)),
    nextPage: () => setPage(p => p + 1)
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Drivers" 
        description="Manage your fleet drivers and operations."
        action={
          <Link to={ROUTES.DRIVERS_ADD} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <FiPlus className="w-4 h-4" /> Add Driver
          </Link>
        }
      />
      
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full max-w-md">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search drivers by name, license or phone..." />
          </div>
          <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Off Duty">Off Duty</option>
              <option value="Suspended">Suspended</option>
              <option value="Retired">Retired</option>
            </select>
            <select value={validityFilter} onChange={(e) => setValidityFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="">All Licenses</option>
              <option value="valid">Valid</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer whitespace-nowrap">
              <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
              Show Archived
            </label>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col relative">
          {loading && drivers.length === 0 ? (
            <div className="flex-1 p-8 flex flex-col justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-slate-500">Loading drivers...</p>
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
              <DataTable columns={columns} data={drivers} pagination={paginationProps} />
            </div>
          )}
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, id: null })} 
        onConfirm={handleDelete}
        title="Archive Driver"
        message="Are you sure you want to archive this driver? They will be removed from the active list but can be restored later."
        confirmText="Archive"
      />
      <ConfirmModal 
        isOpen={restoreModal.isOpen} 
        onClose={() => setRestoreModal({ isOpen: false, id: null })} 
        onConfirm={handleRestore}
        title="Restore Driver"
        message="Are you sure you want to restore this archived driver back to the active list?"
        confirmText="Restore"
      />
    </div>
  );
}
