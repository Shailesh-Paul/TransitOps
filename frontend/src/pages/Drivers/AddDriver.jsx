import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import DriverForm from '../../forms/DriverForm';
import { createDriver } from '../../services/driverService';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function AddDriver() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data, setError) => {
    setIsSubmitting(true);
    try {
      // Validate business logic: driver with expired license cannot be Available
      const today = new Date().setHours(0,0,0,0);
      const expiry = new Date(data.license_expiry).setHours(0,0,0,0);
      if (expiry < today && data.status === 'Available') {
        setError('status', { type: 'manual', message: 'Expired license cannot be Available' });
        setError('license_expiry', { type: 'manual', message: 'License is expired' });
        setIsSubmitting(false);
        return;
      }

      await createDriver(data);
      toast.success('Driver created successfully');
      navigate('/drivers');
    } catch (error) {
      const response = error.response?.data;
      if (error.response?.status === 409) {
        setError('license_number', { type: 'manual', message: 'License Number already exists' });
        toast.error('Duplicate License Number');
      } else if (error.response?.status === 422 && response?.errors) {
        response.errors.forEach(err => {
          // Attempt to map backend validation error fields to form fields
          setError(err.field || err.path[0], { type: 'manual', message: err.message });
        });
        toast.error('Validation failed');
      } else {
        toast.error(response?.message || 'Failed to create driver');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title="Onboard Driver" description="Register a new operator to the enterprise fleet." />
      <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-64 h-64 bg-primary-fixed/5 rounded-full blur-3xl pointer-events-none"></div>
        <DriverForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
