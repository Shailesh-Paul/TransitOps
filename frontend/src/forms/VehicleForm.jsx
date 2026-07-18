import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { VEHICLE_STATUS } from '../utils/constants';

export default function VehicleForm({ defaultValues, onSubmit, isSubmitting }) {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    defaultValues: defaultValues || {
      registrationNumber: '',
      vehicleName: '',
      type: '',
      capacity: '',
      currentOdometer: 0,
      acquisitionCost: 0,
      fuelType: '',
      status: VEHICLE_STATUS.AVAILABLE || 'Available',
      insuranceExpiry: '',
      pucExpiry: '',
      remarks: ''
    }
  });

  // Utility to get today's date in YYYY-MM-DD for min date validation
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
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
          <label className="block text-sm font-medium text-slate-700">Registration Number</label>
          <input {...register('registrationNumber', { required: 'Registration is required' })} className={inputClasses} placeholder="e.g. MH-01-TR-1234" />
          {errors.registrationNumber && <p className="mt-1 text-sm text-rose-500">{errors.registrationNumber.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Vehicle Name / Model</label>
          <input {...register('vehicleName', { required: 'Vehicle Name / Model is required' })} className={inputClasses} placeholder="e.g. Tata Marcopolo" />
          {errors.vehicleName && <p className="mt-1 text-sm text-rose-500">{errors.vehicleName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Vehicle Type</label>
          <select {...register('type', { required: 'Vehicle Type is required' })} className={inputClasses}>
            <option value="">Select Type</option>
            <option value="Bus">Bus</option>
            <option value="Heavy Truck">Heavy Truck</option>
            <option value="Semi-Trailer">Semi-Trailer</option>
            <option value="Flatbed">Flatbed</option>
            <option value="Refrigerated">Refrigerated</option>
            <option value="Tanker">Tanker</option>
            <option value="Van">Van</option>
          </select>
          {errors.type && <p className="mt-1 text-sm text-rose-500">{errors.type.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Maximum Load Capacity (kg)</label>
          <input type="number" step="0.01" {...register('capacity', { required: 'Capacity is required', min: { value: 0.01, message: 'Must be greater than zero' } })} className={inputClasses} placeholder="e.g. 5000" />
          {errors.capacity && <p className="mt-1 text-sm text-rose-500">{errors.capacity.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700">Current Odometer (km)</label>
          <input type="number" step="0.01" {...register('currentOdometer', { min: { value: defaultValues?.currentOdometer || 0, message: `Cannot be lower than ${defaultValues?.currentOdometer || 0}` } })} className={inputClasses} />
          {errors.currentOdometer && <p className="mt-1 text-sm text-rose-500">{errors.currentOdometer.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Acquisition Cost</label>
          <input type="number" step="0.01" {...register('acquisitionCost', { min: { value: 0, message: 'Cannot be negative' } })} className={inputClasses} />
          {errors.acquisitionCost && <p className="mt-1 text-sm text-rose-500">{errors.acquisitionCost.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700">Fuel Type</label>
          <select {...register('fuelType', { required: 'Fuel Type is required' })} className={inputClasses}>
            <option value="">Select Fuel Type</option>
            <option value="Diesel">Diesel</option>
            <option value="Petrol">Petrol</option>
            <option value="CNG">CNG</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
          {errors.fuelType && <p className="mt-1 text-sm text-rose-500">{errors.fuelType.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Vehicle Status</label>
          <select {...register('status')} className={inputClasses}>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Insurance Expiry Date</label>
          <input type="date" {...register('insuranceExpiry', { required: 'Insurance Expiry is required', min: { value: today, message: 'Cannot be in the past' } })} className={inputClasses} />
          {errors.insuranceExpiry && <p className="mt-1 text-sm text-rose-500">{errors.insuranceExpiry.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">PUC Expiry Date</label>
          <input type="date" {...register('pucExpiry', { required: 'PUC Expiry is required', min: { value: today, message: 'Cannot be in the past' } })} className={inputClasses} />
          {errors.pucExpiry && <p className="mt-1 text-sm text-rose-500">{errors.pucExpiry.message}</p>}
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Remarks (Optional)</label>
          <textarea {...register('remarks')} rows={3} className={inputClasses} placeholder="Any additional details..."></textarea>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={handleCancel} className="px-4 py-2 border border-slate-300 bg-white rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
        <button type="submit" disabled={isSubmitting || !isDirty} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Save Vehicle'}
        </button>
      </div>
    </form>
  );
}
