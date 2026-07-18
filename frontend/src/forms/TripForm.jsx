import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

export default function TripForm({ defaultValues, onSubmit, isSubmitting, vehicles = [], drivers = [], routes = [] }) {
  const { register, handleSubmit, control, setError, clearErrors, formState: { errors } } = useForm({
    defaultValues: defaultValues || {
      route_id: '', vehicle_id: '', driver_id: '', cargo_weight: '', start_time: '', notes: '', priority: 'Normal'
    }
  });

  const selectedRouteId = useWatch({ control, name: 'route_id' });
  const selectedVehicleId = useWatch({ control, name: 'vehicle_id' });
  const cargoWeight = useWatch({ control, name: 'cargo_weight' });

  const selectedRoute = routes.find(r => r.id?.toString() === selectedRouteId?.toString());
  const selectedVehicle = vehicles.find(v => v.id?.toString() === selectedVehicleId?.toString());

  useEffect(() => {
    if (selectedVehicle && cargoWeight) {
      if (Number(cargoWeight) > Number(selectedVehicle.capacity)) {
        setError('cargo_weight', { type: 'manual', message: `Exceeds max capacity of ${selectedVehicle.capacity} kg` });
      } else {
        clearErrors('cargo_weight');
      }
    } else {
      clearErrors('cargo_weight');
    }
  }, [selectedVehicle, cargoWeight, setError, clearErrors]);

  const handleFormSubmit = (data) => {
    if (selectedVehicle && data.cargo_weight && Number(data.cargo_weight) > Number(selectedVehicle.capacity)) {
      setError('cargo_weight', { type: 'manual', message: 'Cargo exceeds vehicle capacity.' });
      return;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      
      {/* Route Selection & Derived Data */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">Routing Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Route <span className="text-rose-500">*</span></label>
            <select {...register('route_id', { required: 'Route is required' })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-sm">
              <option value="">Select Route</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            {errors.route_id && <p className="mt-1 text-sm text-rose-500">{errors.route_id.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-500">Source</label>
            <div className="mt-1 block w-full rounded-md border border-slate-200 bg-slate-100/50 px-3 py-2 text-sm text-slate-600">
              {selectedRoute ? selectedRoute.start_location : 'Auto-populated'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500">Destination</label>
            <div className="mt-1 block w-full rounded-md border border-slate-200 bg-slate-100/50 px-3 py-2 text-sm text-slate-600">
              {selectedRoute ? selectedRoute.end_location : 'Auto-populated'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500">Planned Distance</label>
            <div className="mt-1 block w-full rounded-md border border-slate-200 bg-slate-100/50 px-3 py-2 text-sm text-slate-600">
              {selectedRoute ? `${selectedRoute.distance_km} km` : 'Auto-populated'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Vehicle Assignment */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-slate-700">Vehicle Assignment <span className="text-rose-500">*</span></label>
          <select {...register('vehicle_id', { required: 'Vehicle is required' })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-sm">
            <option value="">Select Available Vehicle</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.registration_number})</option>)}
          </select>
          {errors.vehicle_id && <p className="mt-1 text-sm text-rose-500">{errors.vehicle_id.message}</p>}
          
          {selectedVehicle && (
            <div className="mt-2 p-2 bg-blue-50/50 border border-blue-100 rounded-md text-xs text-blue-800 flex flex-col gap-1">
              <span className="font-semibold uppercase tracking-wide">Vehicle Specs:</span>
              <span>Max Capacity: <strong className="text-blue-900">{selectedVehicle.capacity} kg</strong></span>
              <span>Current Odo: <strong className="text-blue-900">{selectedVehicle.current_odometer || 0} km</strong></span>
            </div>
          )}
        </div>

        {/* Driver Assignment */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Driver Assignment <span className="text-rose-500">*</span></label>
          <select {...register('driver_id', { required: 'Driver is required' })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-sm">
            <option value="">Select Available Driver</option>
            {drivers.map(d => <option key={d.id} value={d.id}>{d.first_name} {d.last_name} ({d.license_number})</option>)}
          </select>
          {errors.driver_id && <p className="mt-1 text-sm text-rose-500">{errors.driver_id.message}</p>}
        </div>

        {/* Cargo Details */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Cargo Weight (kg)</label>
          <input type="number" step="0.01" {...register('cargo_weight')} className={`mt-1 block w-full rounded-md border ${errors.cargo_weight ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-300 focus:ring-primary-500 focus:border-primary-500'} px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-1 shadow-sm`} />
          {errors.cargo_weight && <p className="mt-1 text-sm text-rose-500 font-medium">{errors.cargo_weight.message}</p>}
        </div>

        {/* Scheduling & Metadata */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Scheduled Date <span className="text-rose-500">*</span></label>
          <input type="datetime-local" {...register('start_time', { required: 'Scheduled Date is required' })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-sm" />
          {errors.start_time && <p className="mt-1 text-sm text-rose-500">{errors.start_time.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700">Priority</label>
          <select {...register('priority')} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-sm">
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Remarks / Notes</label>
          <textarea rows="3" {...register('notes')} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-sm" placeholder="Any special instructions for this trip..."></textarea>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
        <button type="button" onClick={() => window.history.back()} className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">Cancel</button>
        <button type="submit" disabled={isSubmitting || !!errors.cargo_weight} className="px-5 py-2.5 border border-transparent rounded-lg shadow-[0_0_20px_rgba(168,249,40,0.3)] text-sm font-bold text-slate-900 bg-primary-fixed hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? 'Creating Trip...' : 'Create Trip'}
        </button>
      </div>
    </form>
  );
}
