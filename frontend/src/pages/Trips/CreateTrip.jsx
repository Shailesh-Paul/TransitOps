import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import TripForm from '../../forms/TripForm';
import Loader from '../../components/Loader';
import { createTrip } from '../../services/tripService';
import { getVehicles } from '../../services/vehicleService';
import { getDrivers } from '../../services/driverService';
import { getRoutes } from '../../services/routeService';
import toast from 'react-hot-toast';

export default function CreateTrip() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        const [vResponse, dResponse, rResponse] = await Promise.all([
          getVehicles(),
          getDrivers(),
          getRoutes()
        ]);

        const vData = vResponse?.data || vResponse || [];
        const dData = dResponse?.data || dResponse || [];
        const rData = rResponse?.data || rResponse || [];

        // Vehicles: Must be active/available
        const availableVehicles = vData.filter(v => {
          const status = v.status?.toLowerCase();
          return status === 'active' || status === 'available';
        });

        // Drivers: Must be available and license must not be expired
        const today = new Date().setHours(0,0,0,0);
        const availableDrivers = dData.filter(d => {
          const status = d.status?.toLowerCase();
          const expiry = d.license_expiry ? new Date(d.license_expiry).setHours(0,0,0,0) : 0;
          return (status === 'available' || status === 'on_duty') && expiry >= today;
        });

        setVehicles(availableVehicles);
        setDrivers(availableDrivers);
        setRoutes(rData);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load form dependencies from backend');
      } finally {
        setLoading(false);
      }
    };
    loadDependencies();
  }, []);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createTrip(data);
      toast.success('Trip created successfully as Draft');
      navigate('/trips');
    } catch (error) {
      const response = error.response?.data;
      if (error.response?.status === 422 && response?.errors) {
        toast.error(`Validation failed: ${response.errors[0]?.message || 'Invalid data'}`);
      } else if (error.response?.status === 409) {
        toast.error('Trip already exists or conflict detected');
      } else {
        toast.error(response?.message || 'Failed to create trip due to a server error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Create Trip" description="Dispatch a new trip adhering to active fleet constraints." />
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <TripForm onSubmit={handleSubmit} isSubmitting={isSubmitting} vehicles={vehicles} drivers={drivers} routes={routes} />
      </div>
    </div>
  );
}
