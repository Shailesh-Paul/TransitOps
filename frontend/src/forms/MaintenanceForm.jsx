import { useForm } from 'react-hook-form';

const CATEGORIES = ['Preventive', 'Corrective', 'Emergency', 'Inspection'];
const TYPES = ['Oil Change', 'Brake Service', 'Tyre Replacement', 'Battery Replacement', 'Engine Repair', 'General Service', 'Fitness Certificate', 'Insurance Renewal', 'Pollution Check', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const TRIGGERS = ['Manual', 'Scheduled Date', 'Mileage Based', 'Breakdown', 'Accident', 'Inspection Due'];

export default function MaintenanceForm({ defaultValues, onSubmit, isSubmitting, vehicles = [] }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: defaultValues || {
      vehicle_id: '',
      category: '',
      type: '',
      priority: 'Medium',
      trigger_type: 'Manual',
      description: '',
      scheduled_date: '',
      expected_completion_date: '',
      cost: '',
      technician: ''
    }
  });

  const scheduledDate = watch('scheduled_date');
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Vehicle *</label>
          <select {...register('vehicle_id', { required: 'Vehicle is required' })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white">
            <option value="">Select Vehicle</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number}</option>)}
          </select>
          {errors.vehicle_id && <p className="mt-1 text-sm text-rose-500">{errors.vehicle_id.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700">Work Order Number</label>
          <input type="text" disabled placeholder="Auto-generated (e.g. MNT-2026-000001)" className="mt-1 block w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Maintenance Category *</label>
          <select {...register('category', { required: 'Category is required' })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white">
            <option value="">Select Category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="mt-1 text-sm text-rose-500">{errors.category.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Maintenance Type *</label>
          <select {...register('type', { required: 'Type is required' })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white">
            <option value="">Select Type</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.type && <p className="mt-1 text-sm text-rose-500">{errors.type.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Priority *</label>
          <select {...register('priority', { required: 'Priority is required' })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white">
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Maintenance Trigger *</label>
          <select {...register('trigger_type', { required: 'Trigger is required' })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white">
            {TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea {...register('description')} rows={3} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Scheduled Date *</label>
          <input type="date" min={today} {...register('scheduled_date', { required: 'Scheduled Date is required' })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          {errors.scheduled_date && <p className="mt-1 text-sm text-rose-500">{errors.scheduled_date.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Expected Completion Date *</label>
          <input type="date" min={scheduledDate || today} {...register('expected_completion_date', { required: 'Expected Completion Date is required' })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          {errors.expected_completion_date && <p className="mt-1 text-sm text-rose-500">{errors.expected_completion_date.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Estimated Cost (₹)</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-slate-500 sm:text-sm">₹</span>
            </div>
            <input type="number" min="0" step="0.01" {...register('cost', { min: { value: 0, message: 'Cost cannot be negative' } })} className="pl-7 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="0.00" />
          </div>
          {errors.cost && <p className="mt-1 text-sm text-rose-500">{errors.cost.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Assigned Technician (Optional)</label>
          <input type="text" {...register('technician')} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={() => window.history.back()} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50">
          {isSubmitting ? 'Scheduling...' : 'Schedule Maintenance'}
        </button>
      </div>
    </form>
  );
}
