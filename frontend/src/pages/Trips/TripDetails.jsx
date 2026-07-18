import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';
import DispatchConfirmationModal from '../../components/DispatchConfirmationModal';
import CompleteTripModal from '../../components/CompleteTripModal';
import StartTripModal from '../../components/StartTripModal';
import CancelTripModal from '../../components/CancelTripModal';
import { getTrip, dispatchTrip, startTrip, completeTrip, cancelTrip, terminateTrip } from '../../services/tripService';
import { getVehicle } from '../../services/vehicleService';
import { getDriver } from '../../services/driverService';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiCircle, FiXCircle, FiPlay, FiCheckSquare, FiXSquare, FiSend, FiAlertCircle, FiAlertTriangle } from 'react-icons/fi';
import clsx from 'clsx';

const STATUS_ORDER = ['Draft', 'Assigned', 'Dispatched', 'In Progress', 'Completed'];

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Dispatch Modal State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isEmergencyTerminate, setIsEmergencyTerminate] = useState(false);
  const [liveDuration, setLiveDuration] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const tResponse = await getTrip(id);
      const t = tResponse?.data || tResponse;
      
      if (!t) {
        toast.error('Trip not found');
        navigate('/trips');
        return;
      }
      
      setTrip(t);

      // Concurrent fetch for related entities
      const promises = [];
      if (t.vehicle_id) promises.push(getVehicle(t.vehicle_id));
      else promises.push(Promise.resolve(null));
      
      if (t.driver_id) promises.push(getDriver(t.driver_id));
      else promises.push(Promise.resolve(null));

      const [vResult, dResult] = await Promise.allSettled(promises);
      
      if (vResult.status === 'fulfilled' && vResult.value) {
        setVehicle(vResult.value.data || vResult.value);
      }
      
      if (dResult.status === 'fulfilled' && dResult.value) {
        setDriver(dResult.value.data || dResult.value);
      }

    } catch (err) {
      console.error(err);
      setError('Error loading trip details from the server.');
      toast.error('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let interval;
    if (trip?.status === 'In Progress' && trip?.start_time) {
      const updateDuration = () => {
        const start = new Date(trip.start_time).getTime();
        const now = Date.now();
        const diffMs = Math.max(0, now - start);
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setLiveDuration(`${hours}h ${minutes}m`);
      };
      updateDuration();
      interval = setInterval(updateDuration, 60000);
    } else if (trip?.status === 'Completed' && trip?.start_time && trip?.end_time) {
      const start = new Date(trip.start_time).getTime();
      const end = new Date(trip.end_time).getTime();
      const diffMs = Math.max(0, end - start);
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setLiveDuration(`${hours}h ${minutes}m`);
    } else {
      setLiveDuration('-');
    }
    return () => clearInterval(interval);
  }, [trip]);

  const handleAction = async (actionFn, successMessage) => {
    try {
      setActionLoading(true);
      await actionFn(id);
      toast.success(successMessage);
      loadData();
    } catch (err) {
      toast.error(`Action failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancel = async (payload) => {
    try {
      setActionLoading(true);
      if (isEmergencyTerminate) {
        await terminateTrip(id, payload);
        toast.success('Trip Emergency Terminated');
      } else {
        await cancelTrip(id, payload);
        toast.success('Trip Cancelled');
      }
      setIsCancelModalOpen(false);
      loadData();
    } catch (err) {
      const response = err.response?.data;
      toast.error(response?.message || 'Failed to process cancellation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDispatch = async () => {
    try {
      setActionLoading(true);
      await dispatchTrip(id);
      toast.success('Trip dispatched successfully!');
      setIsDispatchModalOpen(false);
      loadData();
    } catch (err) {
      const response = err.response?.data;
      if (err.response?.status === 422 || err.response?.status === 409) {
        toast.error(`Dispatch Failed: ${response?.message || 'Business rule conflict'}`);
      } else {
        toast.error(response?.message || 'Failed to dispatch due to a server error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmStart = async () => {
    try {
      setActionLoading(true);
      await startTrip(id);
      toast.success('Journey Started (In Progress)');
      setIsStartModalOpen(false);
      loadData();
    } catch (err) {
      const response = err.response?.data;
      toast.error(response?.message || 'Failed to start journey');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmComplete = async (completionData) => {
    try {
      setActionLoading(true);
      await completeTrip(id, completionData);
      toast.success('Trip completed successfully!');
      setIsCompleteModalOpen(false);
      loadData();
    } catch (err) {
      const response = err.response?.data;
      toast.error(response?.message || 'Failed to complete trip');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (error || !trip) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
        <FiAlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to load Trip</h2>
        <p className="text-slate-500 mb-6">{error || 'Trip data could not be found.'}</p>
        <div className="flex gap-4">
          <button onClick={() => navigate('/trips')} className="px-5 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors">Go Back</button>
          <button onClick={loadData} className="px-5 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">Retry</button>
        </div>
      </div>
    );
  }

  const isCancelled = trip.status === 'Cancelled';
  
  // Calculate Timeline logic
  let activeIndex = STATUS_ORDER.indexOf(trip.status);
  if (activeIndex === -1) {
    // Fallback if status is unrecognized, maybe it's in lowercase or something
    const normalizedStatus = trip.status ? trip.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';
    activeIndex = STATUS_ORDER.indexOf(normalizedStatus);
  }

  // Ensure 'Assigned' behaves safely if the trip skipped directly to Dispatched
  if (activeIndex === -1) activeIndex = 0; 

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">TRP-{trip.id}</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            Created on {formatDate(trip.created_at || Date.now())}
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            Priority: <strong className="text-slate-700">{trip.priority || 'Normal'}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={trip.status} />
          
          {/* Action Engine Buttons */}
          <div className="flex gap-2 ml-4 border-l border-slate-200 pl-4">
            {(trip.status === 'Draft' || trip.status === 'Assigned') && (
              <>
                <button disabled={actionLoading} onClick={() => setIsDispatchModalOpen(true)} className="px-4 py-2 bg-primary-fixed text-slate-900 rounded-lg font-bold hover:opacity-90 transition-all shadow-[0_0_15px_rgba(168,249,40,0.3)] disabled:opacity-50 flex items-center gap-2">
                  <FiSend className="w-4 h-4" /> Dispatch
                </button>
                <button disabled={actionLoading} onClick={() => { setIsEmergencyTerminate(false); setIsCancelModalOpen(true); }} className="px-4 py-2 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
                  <FiXSquare className="w-4 h-4" /> Cancel
                </button>
              </>
            )}

            {trip.status === 'Dispatched' && (
              <>
                <button disabled={actionLoading} onClick={() => setIsStartModalOpen(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
                  <FiPlay className="w-4 h-4" /> Start Journey
                </button>
                <button disabled={actionLoading} onClick={() => { setIsEmergencyTerminate(false); setIsCancelModalOpen(true); }} className="px-4 py-2 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
                  <FiXSquare className="w-4 h-4" /> Cancel
                </button>
              </>
            )}

            {trip.status === 'In Progress' && (
              <>
                <button disabled={actionLoading} onClick={() => setIsCompleteModalOpen(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
                  <FiCheckSquare className="w-4 h-4" /> Complete Trip
                </button>
                <button disabled={actionLoading} onClick={() => { setIsEmergencyTerminate(true); setIsCancelModalOpen(true); }} className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
                  <FiAlertTriangle className="w-4 h-4" /> Emergency Terminate
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-8 tracking-tight">Lifecycle Status</h3>
        <div className="relative pt-2 pb-6">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full overflow-hidden">
            {!isCancelled && (
              <div 
                className="h-full bg-primary-600 transition-all duration-1000" 
                style={{ width: `${(activeIndex / (STATUS_ORDER.length - 1)) * 100}%` }}
              />
            )}
          </div>
          
          <div className="relative flex justify-between">
            {isCancelled || trip.status === 'Terminated' ? (
              <div className="w-full flex justify-center py-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center border-4 border-white z-10 shadow-sm">
                    {trip.status === 'Terminated' ? <FiAlertTriangle className="w-6 h-6" /> : <FiXCircle className="w-6 h-6" />}
                  </div>
                  <span className="mt-3 font-bold text-rose-600">
                    {trip.status === 'Terminated' ? 'Trip Terminated' : 'Trip Cancelled'}
                  </span>
                  {trip.cancellation_reason && (
                    <span className="text-xs text-rose-500 mt-1 text-center max-w-xs">{trip.cancellation_reason}</span>
                  )}
                </div>
              </div>
            ) : (
              STATUS_ORDER.map((stage, idx) => {
                const isCompleted = activeIndex >= idx;
                const isCurrent = activeIndex === idx;
                return (
                  <div key={stage} className="flex flex-col items-center">
                    <div className={clsx(
                      "w-12 h-12 rounded-full flex items-center justify-center border-4 border-white z-10 transition-colors shadow-sm",
                      isCompleted ? "bg-primary-600 text-white" : "bg-slate-200 text-slate-500",
                      isCurrent && "ring-4 ring-primary-100"
                    )}>
                      {isCompleted ? <FiCheckCircle className="w-6 h-6" /> : <FiCircle className="w-6 h-6" />}
                    </div>
                    <span className={clsx("mt-3 font-bold text-sm", isCompleted ? "text-slate-900" : "text-slate-400")}>
                      {stage}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trip Overview Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Trip Details</h3>
          </div>
          <div className="p-6 flex-1 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Route</p>
                <p className="font-medium text-slate-900">{trip.route_name || 'Custom Route'}</p>
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Distance</p>
                  <p className="font-medium text-slate-900">{trip.distance_km ? `${trip.distance_km} km` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cargo</p>
                  <p className="font-medium text-slate-900">{trip.cargo_weight ? `${trip.cargo_weight} kg` : 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Execution Metrics</p>
                <div className="space-y-1">
                  <p className="text-sm text-slate-700"><span className="text-slate-400 inline-block w-24">Started At:</span> {trip.start_time ? formatDate(trip.start_time) : 'Pending'}</p>
                  <p className="text-sm text-slate-700"><span className="text-slate-400 inline-block w-24">Duration:</span> <span className="font-semibold text-emerald-600">{liveDuration}</span> {trip.status === 'In Progress' && <span className="text-xs text-orange-500 font-bold ml-1 animate-pulse">(Live)</span>}</p>
                  {trip.end_time && (
                    <p className="text-sm text-slate-700"><span className="text-slate-400 inline-block w-24">Ended At:</span> {formatDate(trip.end_time)}</p>
                  )}
                  {trip.terminated_at && (
                    <p className="text-sm text-slate-700"><span className="text-slate-400 inline-block w-24">Terminated:</span> {formatDate(trip.terminated_at)}</p>
                  )}
                  {trip.cancelled_at && (
                    <p className="text-sm text-slate-700"><span className="text-slate-400 inline-block w-24">Cancelled:</span> {formatDate(trip.cancelled_at)}</p>
                  )}
                  <p className="text-sm text-slate-700"><span className="text-slate-400 inline-block w-24">Updated By:</span> {trip.updated_by ? `User ${trip.updated_by}` : 'Unknown'}</p>
                </div>
              </div>
              {trip.notes && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Remarks</p>
                  <p className="text-sm text-slate-700 italic">{trip.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Assigned Vehicle</h3>
            {vehicle && <StatusBadge status={vehicle.status} />}
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            {vehicle ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">
                    V
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{vehicle.registration_number}</h4>
                    <p className="text-sm text-slate-500">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Capacity</p>
                    <p className="font-semibold text-slate-900">{vehicle.capacity} kg</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Fuel Type</p>
                    <p className="font-semibold text-slate-900">{vehicle.fuel_type || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2">
                    <p className="text-xs text-slate-500 mb-1">Current Odometer</p>
                    <p className="font-semibold text-slate-900">{vehicle.current_odometer || '0'} km</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                <span className="material-symbols-outlined text-4xl mb-2">directions_car</span>
                <p>No Vehicle Assigned</p>
              </div>
            )}
          </div>
        </div>

        {/* Driver Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Assigned Driver</h3>
            {driver && <StatusBadge status={driver.status} />}
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            {driver ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-lg uppercase">
                    {driver.first_name?.[0]}{driver.last_name?.[0]}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{driver.first_name} {driver.last_name}</h4>
                    <p className="text-sm text-slate-500">{driver.phone || 'No phone recorded'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2">
                    <p className="text-xs text-slate-500 mb-1">License Number</p>
                    <p className="font-mono font-semibold text-slate-900">{driver.license_number}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Category</p>
                    <p className="font-semibold text-slate-900">{driver.license_category || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Safety Score</p>
                    <p className="font-semibold text-emerald-600">{driver.safety_score || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                <span className="material-symbols-outlined text-4xl mb-2">person</span>
                <p>No Driver Assigned</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <DispatchConfirmationModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        onConfirm={handleConfirmDispatch}
        trip={trip}
        isDispatching={actionLoading}
      />
      
      <StartTripModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        onConfirm={handleConfirmStart}
        trip={trip}
        vehicle={vehicle}
        driver={driver}
        isStarting={actionLoading}
      />
      
      <CompleteTripModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onConfirm={handleConfirmComplete}
        trip={trip}
        vehicle={vehicle}
        isCompleting={actionLoading}
      />
      
      <CancelTripModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        trip={trip}
        isTerminating={isEmergencyTerminate}
        isLoading={actionLoading}
      />
    </div>
  );
}
