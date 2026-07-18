import { useForm } from 'react-hook-form';

export default function FuelForm({ defaultValues, onSubmit, isSubmitting, vehicles = [] }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: defaultValues || {
      vehicleId: '', liters: '', cost: '', station: '', date: ''
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Vehicle</label>
          <select {...register('vehicleId', { required: 'Vehicle is required' })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white">
            <option value="">Select Vehicle</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          {errors.vehicleId && <p className="mt-1 text-sm text-rose-500">{errors.vehicleId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Date</label>
          <input type="date" {...register('date', { required: 'Date is required' })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          {errors.date && <p className="mt-1 text-sm text-rose-500">{errors.date.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Liters</label>
          <input type="number" {...register('liters', { required: 'Liters required' })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          {errors.liters && <p className="mt-1 text-sm text-rose-500">{errors.liters.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Cost</label>
          <input type="number" {...register('cost', { required: 'Cost required' })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          {errors.cost && <p className="mt-1 text-sm text-rose-500">{errors.cost.message}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Station Name</label>
          <input {...register('station', { required: 'Station Required' })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          {errors.station && <p className="mt-1 text-sm text-rose-500">{errors.station.message}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={() => window.history.back()} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Save Log'}
        </button>
      </div>
    </form>
  );
}
