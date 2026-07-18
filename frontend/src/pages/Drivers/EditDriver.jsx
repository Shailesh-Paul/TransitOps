import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import DriverForm from '../../forms/DriverForm';
import Loader from '../../components/Loader';
import { getDriver, updateDriver } from '../../services/driverService';
import toast from 'react-hot-toast';

export default function EditDriver() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getDriver(id);
        if (!data) {
          toast.error('Driver not found');
          navigate('/drivers');
          return;
        }
        setDriver(data);
      } catch {
        toast.error('Error loading driver');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

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

      await updateDriver(id, data);
      toast.success('Driver updated successfully');
      navigate('/drivers');
    } catch (error) {
      const response = error.response?.data;
      if (error.response?.status === 409) {
        setError('license_number', { type: 'manual', message: 'License Number already exists' });
        toast.error('Duplicate License Number');
      } else if (error.response?.status === 422 && response?.errors) {
        response.errors.forEach(err => {
          setError(err.field || err.path[0], { type: 'manual', message: err.message });
        });
        toast.error('Validation failed');
      } else {
        toast.error(response?.message || 'Failed to update driver');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  const displayName = driver?.first_name ? `${driver.first_name} ${driver.last_name || ''}` : driver?.name || 'Driver';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title="Update Operator Profile" description={`Update details for ${displayName}`} />
      <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
        <DriverForm defaultValues={driver} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
