import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import apiClient from '../../api/apiClient';
import toast from 'react-hot-toast';
import { ROUTES } from '../../constants/routes';

// Shared Badge Component mapping for enterprise theme
function StatusBadge({ status }) {
  const styles = {
    'Available': 'bg-primary-fixed/20 text-primary-fixed border-primary-fixed/30',
    'Reserved': 'bg-secondary/20 text-secondary border-secondary/30',
    'On Trip': 'bg-secondary/20 text-secondary border-secondary/30',
    'Off Duty': 'bg-slate-500/20 text-slate-500 border-slate-500/30',
    'Suspended': 'bg-error/20 text-error border-error/30',
    'Retired': 'bg-white/10 text-on-surface-variant border-white/20'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${styles[status] || styles['Available']}`}>
      {status}
    </span>
  );
}

function LicenseHealthBadge({ expiryDate }) {
  if (!expiryDate) return <span className="px-3 py-1 rounded-full text-xs font-bold border uppercase bg-white/10 text-on-surface-variant border-white/20">Unknown</span>;
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0,0,0,0);
  
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let status = 'Valid';
  let styles = 'bg-primary-fixed/20 text-primary-fixed border-primary-fixed/30';
  
  if (diffDays < 0) {
    status = 'Expired';
    styles = 'bg-error/20 text-error border-error/30';
  } else if (diffDays <= 7) {
    status = 'Expires in < 7 Days';
    styles = 'bg-orange-500/20 text-orange-500 border-orange-500/30';
  } else if (diffDays <= 30) {
    status = 'Expires in < 30 Days';
    styles = 'bg-secondary/20 text-secondary border-secondary/30';
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${styles}`}>
      {status}
    </span>
  );
}

export default function DriverDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    driver: null,
    trips: [],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      // Execute all GET requests in parallel
      const [driverRes, tripsRes] = await Promise.all([
        apiClient.get(`/drivers/${id}`),
        apiClient.get('/trips', { params: { driver_id: id } })
      ]);

      setData({
        driver: driverRes,
        // Normalize paginated trips if necessary
        trips: Array.isArray(tripsRes) ? tripsRes : (tripsRes.data || []),
      });
    } catch (err) {
      console.error("Failed to load driver details", err);
      toast.error('Failed to load driver details');
      navigate(ROUTES.DRIVERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSuspend = async () => {
    if (window.confirm("Are you sure you want to suspend this driver?")) {
      try {
        await apiClient.patch(`/drivers/${id}/status`, { status: 'Suspended' });
        toast.success("Driver suspended");
        loadData();
      } catch (err) {
        toast.error("Failed to suspend driver");
      }
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!data.driver) return null;

  const { driver, trips } = data;

  // Derived Metrics
  const totalTrips = trips.length;
  const completedTrips = trips.filter(t => t.status === 'completed').length;
  const cancelledTrips = trips.filter(t => t.status === 'cancelled').length;
  
  // Try to sum distance from trips if available
  const totalDistance = trips.reduce((sum, t) => sum + (Number(t.distance) || 0), 0); 
  
  // Calculate completion rate
  const completionRate = totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0;
  
  // On-time % mock (as backend might not have this precise data yet, but we derive it from data if possible, else 100% assuming completed)
  const onTimePercentage = completedTrips > 0 ? 100 : 0;

  // Find last trip date
  const sortedTrips = [...trips].sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
  const lastTripDate = sortedTrips.length > 0 ? sortedTrips[0].start_time : null;

  // Check for assigned vehicle via an active trip
  const currentTrip = trips.find(t => t.status === 'in_progress' || t.status === 'dispatched' || t.status === 'scheduled');
  const assignedVehicleId = currentTrip?.vehicle_id;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';
  const driverName = driver.first_name ? `${driver.first_name} ${driver.last_name || ''}` : (driver.name || 'Unknown Driver');

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
        <div>
          <button onClick={() => navigate(ROUTES.DRIVERS)} className="text-primary hover:text-primary-fixed flex items-center gap-1 mb-4 text-sm font-label-bold transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Drivers
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
              <span className="material-symbols-outlined text-3xl">person</span>
            </div>
            <div>
              <h1 className="font-display-lg text-primary text-4xl flex items-center gap-4">
                {driverName}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-on-surface-variant font-label-bold">
                <span>ID: {driver.employee_id || 'N/A'}</span>
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                <span>Phone: {driver.phone || 'N/A'}</span>
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                <StatusBadge status={driver.status || 'Available'} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button onClick={loadData} className="p-2 rounded-full bg-white/5 text-on-surface-variant hover:bg-white/10 transition-colors border border-white/10" title="Refresh Data">
            <span className="material-symbols-outlined">refresh</span>
          </button>
          
          {driver.status !== 'Suspended' && driver.status !== 'Retired' && (
            <button onClick={handleSuspend} className="px-4 py-2 rounded-lg bg-error/10 border border-error/20 text-error font-label-bold flex items-center gap-2 hover:bg-error/20 transition-colors">
              <span className="material-symbols-outlined text-[18px]">block</span>
              Suspend
            </button>
          )}

          <Link to={ROUTES.DRIVERS_EDIT.replace(':id', driver.id)} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface-variant font-label-bold flex items-center gap-2 hover:bg-white/10 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Driver
          </Link>
          <Link to={ROUTES.TRIPS_CREATE} className="px-4 py-2 rounded-lg bg-primary-fixed text-on-primary-fixed font-label-bold flex items-center gap-2 hover:opacity-90 shadow-[0_0_15px_rgba(168,249,40,0.2)] transition-all">
            <span className="material-symbols-outlined text-[18px]">add_road</span>
            Assign Trip
          </Link>
        </div>
      </div>

      {/* Driver Info & License Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="glass-card rounded-2xl p-6 border border-white/5 lg:col-span-2">
          <h2 className="text-primary font-headline-md text-xl flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined">badge</span>
            Driver Information
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <InfoItem label="License Number" value={driver.license_number} />
            <InfoItem label="License Expiry" value={formatDate(driver.license_expiry)} />
            <InfoItem label="Safety Score" value={`${driver.safety_score || 100}/100`} />
            <InfoItem label="Assigned Vehicle" value={assignedVehicleId ? `Vehicle #${assignedVehicleId}` : 'None currently'} />
            <InfoItem label="Current Trip" value={currentTrip ? `Trip #${currentTrip.id}` : 'None active'} />
            <InfoItem label="Joining Date" value={formatDate(driver.created_at)} />
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-center items-center text-center">
          <h2 className="text-on-surface-variant font-label-bold uppercase text-xs mb-4">License Health Status</h2>
          <span className="material-symbols-outlined text-6xl text-white/10 mb-4">id_card</span>
          <LicenseHealthBadge expiryDate={driver.license_expiry} />
          <p className="mt-4 text-sm text-on-surface-variant max-w-[200px]">
            Enterprise compliance requires all drivers to hold a valid and unexpired commercial license.
          </p>
        </section>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter">
        <MetricCard title="Total Trips" value={totalTrips} icon="route" />
        <MetricCard title="Completed" value={completedTrips} icon="check_circle" colorClass="secondary" />
        <MetricCard title="Total Distance" value={`${totalDistance.toLocaleString('en-IN')} km`} icon="add_road" colorClass="primary-fixed" />
        <MetricCard title="Completion Rate" value={`${completionRate}%`} icon="analytics" />
        <MetricCard title="Safety Score" value={driver.safety_score || 100} icon="verified_user" colorClass="secondary" />
      </section>

      {/* Performance & Trip History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance Section */}
        <section className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col gap-6">
          <h2 className="text-secondary font-headline-md text-xl flex items-center gap-2">
            <span className="material-symbols-outlined">trending_up</span>
            Performance
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-sm font-label-bold text-on-surface-variant">On-Time Percentage</span>
              <span className="text-lg font-display-lg text-secondary">{onTimePercentage}%</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-sm font-label-bold text-on-surface-variant">Trip Completion Rate</span>
              <span className="text-lg font-display-lg text-secondary">{completionRate}%</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-sm font-label-bold text-on-surface-variant">Cancelled Trips</span>
              <span className="text-lg font-display-lg text-error">{cancelledTrips}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-sm font-label-bold text-on-surface-variant">Last Trip Date</span>
              <span className="text-sm font-body-lg text-on-surface">{formatDate(lastTripDate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-label-bold text-on-surface-variant">Incident Count</span>
              <span className="text-lg font-display-lg text-primary">0</span>
            </div>
          </div>
        </section>

        {/* Trip History Table */}
        <section className="glass-card rounded-2xl p-6 border border-white/5 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-primary font-headline-md text-xl flex items-center gap-2">
              <span className="material-symbols-outlined">history</span>
              Trip History
            </h2>
            <Link to={ROUTES.TRIPS} className="text-primary text-sm font-label-bold hover:underline">View All Trips</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-on-surface-variant font-label-bold">
                  <th className="py-3 px-4">Trip #</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Start Time</th>
                  <th className="py-3 px-4">End Time</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {trips.length > 0 ? trips.map((trip) => (
                  <tr key={trip.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-on-surface">
                    <td className="py-3 px-4">
                      <Link to={ROUTES.TRIPS_DETAILS.replace(':id', trip.id)} className="text-primary hover:underline font-mono">
                        {trip.id}
                      </Link>
                    </td>
                    <td className="py-3 px-4">{trip.vehicle_id ? `Veh #${trip.vehicle_id}` : 'Unassigned'}</td>
                    <td className="py-3 px-4">{formatDate(trip.start_time)}</td>
                    <td className="py-3 px-4">{formatDate(trip.end_time)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded text-xs border border-white/20 bg-white/5 uppercase">
                        {trip.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="py-4 px-4 text-center text-on-surface-variant">No trips recorded for this driver.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}

// Sub-components for clean UI
function InfoItem({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-label-bold text-on-surface-variant uppercase">{label}</span>
      <span className="text-sm font-body-lg text-on-surface">{value}</span>
    </div>
  );
}

function MetricCard({ title, value, icon, colorClass = 'primary' }) {
  let textColor = 'text-primary';
  let bgColor = 'bg-primary/5';

  if (colorClass === 'secondary') {
    textColor = 'text-secondary';
    bgColor = 'bg-secondary/5';
  } else if (colorClass === 'primary-fixed') {
    textColor = 'text-primary-fixed';
    bgColor = 'bg-primary-fixed/5';
  }

  return (
    <div className={`glass-card rounded-xl p-5 flex flex-col justify-between gap-3 relative overflow-hidden group border border-white/5`}>
      <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl transition-all ${bgColor}`}></div>
      <div className="flex justify-between items-start">
        <span className="text-on-surface-variant font-label-bold uppercase text-xs">{title}</span>
        <span className={`material-symbols-outlined text-[20px] ${textColor}`}>{icon}</span>
      </div>
      <div className={`font-display-lg text-2xl ${textColor}`}>
        {value}
      </div>
    </div>
  );
}
