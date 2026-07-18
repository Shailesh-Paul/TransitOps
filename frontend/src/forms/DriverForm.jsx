import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { DRIVER_STATUS } from '../utils/constants';

export default function DriverForm({ defaultValues, onSubmit, isSubmitting }) {
  const { register, handleSubmit, setError, formState: { errors, isDirty } } = useForm({
    defaultValues: defaultValues || {
      employee_id: '',
      name: '',
      license_number: '',
      licenseCategory: '',
      license_expiry: '',
      phone: '',
      emergency_contact: '',
      address: '',
      joiningDate: '',
      safety_score: 100,
      status: DRIVER_STATUS.AVAILABLE || 'Available',
      remarks: ''
    }
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm("You have unsaved changes. Leave without saving?")) {
        window.history.back();
      }
    } else {
      window.history.back();
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data, setError);
    } catch (err) {
      console.error("Submission failed", err);
    }
  };

  const inputClasses = "mt-1 block w-full rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div>
          <label className="block text-sm font-medium text-slate-700">Driver Name</label>
          <input {...register('name', { required: 'Name is required' })} className={inputClasses} placeholder="e.g. John Doe" />
          {errors.name && <p className="mt-1 text-sm text-rose-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Employee ID</label>
          <input {...register('employee_id', { required: 'Employee ID is required' })} className={inputClasses} placeholder="e.g. EMP123" />
          {errors.employee_id && <p className="mt-1 text-sm text-rose-500">{errors.employee_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">License Number</label>
          <input {...register('license_number', { required: 'License is required' })} className={inputClasses} placeholder="e.g. AB12345678" />
          {errors.license_number && <p className="mt-1 text-sm text-rose-500">{errors.license_number.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">License Category</label>
          <input {...register('licenseCategory', { required: 'Category is required' })} className={inputClasses} placeholder="e.g. Heavy Commercial" />
          {errors.licenseCategory && <p className="mt-1 text-sm text-rose-500">{errors.licenseCategory.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">License Expiry Date</label>
          <input type="date" {...register('license_expiry', { required: 'Expiry is required' })} className={inputClasses} />
          {errors.license_expiry && <p className="mt-1 text-sm text-rose-500">{errors.license_expiry.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Contact Number</label>
          <input type="tel" {...register('phone', { 
            required: 'Phone is required',
            pattern: { value: /^[0-9+\-\s()]+$/, message: 'Valid mobile format required' }
          })} className={inputClasses} placeholder="e.g. +1 234 567 8900" />
          {errors.phone && <p className="mt-1 text-sm text-rose-500">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Emergency Contact</label>
          <input type="tel" {...register('emergency_contact', {
            pattern: { value: /^[0-9+\-\s()]+$/, message: 'Valid mobile format required' }
          })} className={inputClasses} placeholder="e.g. +1 098 765 4321" />
          {errors.emergency_contact && <p className="mt-1 text-sm text-rose-500">{errors.emergency_contact.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Joining Date</label>
          <input type="date" {...register('joiningDate')} className={inputClasses} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Safety Score</label>
          <input type="number" step="0.01" {...register('safety_score', { 
            min: { value: 0, message: 'Minimum 0' }, 
            max: { value: 100, message: 'Maximum 100' } 
          })} className={inputClasses} />
          {errors.safety_score && <p className="mt-1 text-sm text-rose-500">{errors.safety_score.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Driver Status</label>
          <select {...register('status')} className={inputClasses}>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="On Trip">On Trip</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Address</label>
          <textarea {...register('address')} rows={2} className={inputClasses} placeholder="Full address..."></textarea>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Remarks</label>
          <textarea {...register('remarks')} rows={2} className={inputClasses} placeholder="Any additional notes..."></textarea>
        </div>

      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={handleCancel} className="px-4 py-2 border border-slate-300 bg-white rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
        <button type="submit" disabled={isSubmitting || !isDirty} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Save Driver'}
        </button>
      </div>
    </form>
  );
}
