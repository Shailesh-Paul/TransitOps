import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFuelLogById } from '../../services/fuelService';
import { ROUTES } from '../../constants/routes';
import { FiCheckCircle, FiAlertCircle, FiArrowLeft, FiClock, FiTruck, FiMap, FiUser, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function FuelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFuelLogById(id);
        setLog(data);
      } catch (err) {
        toast.error('Failed to load fuel details');
        navigate(ROUTES.FUEL);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full animate-pulse pb-20">
        <div className="h-10 w-48 bg-white/5 rounded"></div>
        <div className="h-24 bg-white/5 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-white/5 rounded-2xl col-span-2"></div>
          <div className="h-64 bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!log) return null;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  const formatNum = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(val);

  return (
    <div className="flex flex-col gap-6 w-full pb-20 max-w-7xl mx-auto">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
        <div>
          <button onClick={() => navigate(ROUTES.FUEL)} className="text-primary hover:text-primary-fixed flex items-center gap-1 mb-4 text-sm font-label-bold transition-colors">
            <FiArrowLeft /> Back to Fuel Logs
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-container border border-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-primary-fixed">local_gas_station</span>
            </div>
            <div>
              <h1 className="font-display-lg text-primary text-3xl tracking-tighter uppercase font-extrabold flex items-center gap-3">
                Transaction #{log.id}
              </h1>
              <p className="text-on-surface-variant font-body-lg mt-1">Logged on {new Date(log.date).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
           <button onClick={() => navigate(ROUTES.VEHICLES_DETAILS.replace(':id', log.vehicle_id))} className="px-6 py-2 rounded-full bg-surface-container-high border border-white/10 text-on-surface font-label-bold flex items-center gap-2 hover:bg-white/10 transition-all">
             <FiTruck /> View Vehicle
           </button>
           {log.trip_id && (
             <button onClick={() => navigate(ROUTES.TRIPS_DETAILS.replace(':id', log.trip_id))} className="px-6 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-label-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-[0_0_15px_rgba(168,249,40,0.3)]">
               <FiMap /> View Trip
             </button>
           )}
        </div>
      </header>

      {/* Alerts Banner */}
      {log.alerts?.length > 0 && (
        <div className="w-full bg-error/10 border border-error/30 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-error font-label-bold uppercase">
            <FiAlertCircle className="w-5 h-5" /> Operational Warnings
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {log.alerts.map((alert, i) => (
              <div key={i} className="bg-surface-container-low/50 border border-error/20 p-4 rounded-xl flex flex-col gap-1">
                <span className="text-error font-bold text-sm">{alert.type}</span>
                <span className="text-on-surface-variant text-sm">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Details) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          
          {/* Fuel Information */}
          <section className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/5 blur-3xl rounded-full"></div>
            <h2 className="text-on-surface-variant font-label-bold uppercase tracking-wider mb-6">Fuel Information</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <DetailItem label="Quantity" value={`${formatNum(log.liters)} L`} color="text-secondary" />
              <DetailItem label="Total Amount" value={formatCurrency(log.cost)} color="text-error" />
              <DetailItem label="Price / Litre" value={formatCurrency(log.cost / log.liters)} />
              <DetailItem label="Station" value={log.station || 'Unspecified'} />
              
              <div className="col-span-2 md:col-span-4 h-[1px] bg-white/5 my-2"></div>
              
              <DetailItem label="Current Odometer" value={`${formatNum(log.odometer_reading)} km`} />
              <DetailItem label="Previous Odometer" value={log.previous_log ? `${formatNum(log.previous_log.odometer_reading)} km` : 'N/A'} />
              <DetailItem label="Distance" value={log.previous_log ? `${formatNum(log.odometer_reading - log.previous_log.odometer_reading)} km` : 'N/A'} />
              <DetailItem label="Efficiency" value={log.efficiency ? `${formatNum(log.efficiency)} km/L` : 'N/A'} color="text-primary-fixed" />
            </div>
          </section>

          {/* Validation Summary */}
          <section className="glass-card rounded-2xl p-6 border border-white/5">
            <h2 className="text-on-surface-variant font-label-bold uppercase tracking-wider mb-6">System Validations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ValidationBadge label="Odometer Check" passed={log.validations.odometerVerified} />
              <ValidationBadge label="Fuel Policy" passed={log.validations.fuelPolicyPassed} />
              <ValidationBadge label="Duplicate Check" passed={log.validations.duplicateCheckPassed} />
              <ValidationBadge label="Vehicle Eligibility" passed={log.validations.vehicleEligibilityPassed} />
            </div>
          </section>

        </div>

        {/* Right Column (Context & Timeline) */}
        <div className="flex flex-col gap-6">
          
          {/* Related Info */}
          <section className="glass-card rounded-2xl p-6 border border-white/5">
            <h2 className="text-on-surface-variant font-label-bold uppercase tracking-wider mb-6">Context</h2>
            
            <div className="flex flex-col gap-4">
              <ContextItem icon={<FiTruck />} label="Vehicle" value={log.vehicleName} subValue={`${log.make} ${log.model}`} link={ROUTES.VEHICLES_DETAILS.replace(':id', log.vehicle_id)} />
              <ContextItem icon={<FiMap />} label="Active Trip" value={log.trip_id ? `Trip #${log.trip_id}` : 'None'} subValue={log.tripStatus} link={log.trip_id ? ROUTES.TRIPS_DETAILS.replace(':id', log.trip_id) : null} />
              <ContextItem icon={<FiActivity />} label="Previous Entry" value={log.previous_log ? new Date(log.previous_log.date).toLocaleDateString() : 'None'} subValue={log.previous_log ? `${log.previous_log.odometer_reading} km` : ''} link={log.previous_log ? ROUTES.FUEL_DETAILS.replace(':id', log.previous_log.id) : null} />
              <ContextItem icon={<FiClock />} label="Next Entry" value={log.next_log ? new Date(log.next_log.date).toLocaleDateString() : 'Latest'} subValue={log.next_log ? `${log.next_log.odometer_reading} km` : ''} link={log.next_log ? ROUTES.FUEL_DETAILS.replace(':id', log.next_log.id) : null} />
            </div>
          </section>

          {/* Audit Timeline */}
          <section className="glass-card rounded-2xl p-6 border border-white/5">
            <h2 className="text-on-surface-variant font-label-bold uppercase tracking-wider mb-6">Audit Trail</h2>
            <div className="relative border-l border-white/10 ml-3 flex flex-col gap-6">
              
              <TimelineEvent 
                title="Fuel Entry Created" 
                date={log.created_at} 
                user={log.creatorName || `User #${log.created_by}`} 
                icon="add"
              />
              
              <TimelineEvent 
                title="System Validations Passed" 
                date={log.created_at} 
                user="System" 
                icon="verified"
              />

              {log.trip_id && (
                <TimelineEvent 
                  title="Automatically Linked to Trip" 
                  date={log.created_at} 
                  user="System" 
                  icon="link"
                />
              )}

              <TimelineEvent 
                title="Vehicle Odometer Updated" 
                date={log.created_at} 
                user="System" 
                icon="speed"
              />

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, color = "text-primary" }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-label-bold text-on-surface-variant uppercase tracking-wider">{label}</span>
      <span className={`text-xl font-display-md ${color}`}>{value}</span>
    </div>
  );
}

function ValidationBadge({ label, passed }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${passed ? 'border-primary-fixed/20 bg-primary-fixed/5' : 'border-error/20 bg-error/5'}`}>
      {passed ? <FiCheckCircle className="text-primary-fixed w-5 h-5" /> : <FiAlertCircle className="text-error w-5 h-5" />}
      <span className={`font-label-bold text-sm ${passed ? 'text-primary-fixed' : 'text-error'}`}>{label}</span>
    </div>
  );
}

function ContextItem({ icon, label, value, subValue, link }) {
  const navigate = useNavigate();
  return (
    <div 
      className={`flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-surface-container-low ${link ? 'hover:bg-white/5 cursor-pointer transition-colors' : ''}`}
      onClick={() => link && navigate(link)}
    >
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-on-surface-variant">{label}</span>
        <span className="text-sm font-bold text-primary">{value}</span>
        {subValue && <span className="text-xs text-on-surface-variant">{subValue}</span>}
      </div>
    </div>
  );
}

function TimelineEvent({ title, date, user, icon }) {
  return (
    <div className="relative pl-6">
      <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-surface-container border border-white/20 flex items-center justify-center z-10">
        <span className="material-symbols-outlined text-[14px] text-primary">{icon}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold text-primary">{title}</span>
        <span className="text-[11px] text-on-surface-variant font-label-bold uppercase tracking-wider">
          {new Date(date).toLocaleString()} • {user}
        </span>
      </div>
    </div>
  );
}
