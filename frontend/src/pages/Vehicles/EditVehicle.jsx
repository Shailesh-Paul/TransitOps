import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import VehicleForm from '../../forms/VehicleForm';
import Loader from '../../components/Loader';
import { getVehicle, updateVehicle } from '../../services/vehicleService';
import toast from 'react-hot-toast';

export default function EditVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getVehicle(id);
        if (!data) {
          toast.error('Vehicle not found');
          navigate('/vehicles');
          return;
        }

        // Map Backend Data to Frontend Form Schema
        const mappedData = {
          registrationNumber: data.registration_number || '',
          vehicleName: data.make || '',
          type: '', // Cannot map natively, leave empty
          capacity: data.capacity || '',
          currentOdometer: Number(data.mileage || data.current_odometer || 0),
          acquisitionCost: 0, // Cannot map natively
          fuelType: '', // Cannot map natively
          status: data.status || 'Available',
          insuranceExpiry: data.insurance_expiry ? new Date(data.insurance_expiry).toISOString().split('T')[0] : '',
          pucExpiry: data.puc_expiry ? new Date(data.puc_expiry).toISOString().split('T')[0] : '',
          remarks: '', // Cannot map natively
          _original: data // Preserve raw data for submission
        };
        
        setVehicle(mappedData);
      } catch (error) {
        console.error(error);
        toast.error('Error loading vehicle');
        navigate('/vehicles');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  const handleSubmit = async (formData, setError) => {
    setIsSubmitting(true);
    
    // Merge frontend form data back to backend schema
    // Fallback to _original for fields required by backend but hidden in form
    const payload = {
      registration_number: formData.registrationNumber,
      make: formData.vehicleName,
      model: formData.vehicleName, // Merging make and model
      year: vehicle._original?.year || new Date().getFullYear(),
      capacity: Number(formData.capacity),
      status: formData.status,
      insurance_expiry: formData.insuranceExpiry,
      puc_expiry: formData.pucExpiry,
      registration_expiry: vehicle._original?.registration_expiry || formData.insuranceExpiry,
      current_odometer: Number(formData.currentOdometer || 0)
    };

    try {
      await updateVehicle(id, payload);
      toast.success('Vehicle updated successfully');
      navigate('/vehicles');
    } catch (error) {
      console.error(error);
      const backendMessage = error.response?.data?.message;
      const status = error.response?.status;
      
      if (status === 409 || backendMessage?.toLowerCase().includes('registration')) {
        setError('registrationNumber', { type: 'manual', message: backendMessage || 'Registration number already exists' });
        toast.error('Validation failed: Duplicate Registration');
      } else if (backendMessage) {
        toast.error(backendMessage);
      } else {
        toast.error('Failed to update vehicle');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title="Edit Vehicle" description={`Update details for ${vehicle?.registrationNumber || 'the vehicle'}`} />
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        {/* Key added to remount form if vehicle defaults change (e.g., loaded late) */}
        <VehicleForm key={vehicle.registrationNumber} defaultValues={vehicle} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
