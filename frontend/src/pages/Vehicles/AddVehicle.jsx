import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import VehicleForm from '../../forms/VehicleForm';
import { createVehicle } from '../../services/vehicleService';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function AddVehicle() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data, setError) => {
    setIsSubmitting(true);
    
    // Map the form data to strictly match the backend validation schema
    // The backend validation strictly strips unknown fields natively (e.g. fuelType, acquisitionCost)
    const payload = {
      registration_number: data.registrationNumber,
      make: data.vehicleName, 
      model: data.vehicleName, // Merging make and model to the same input string per requirement
      year: new Date().getFullYear(), // Backend requires year; auto-injecting current year
      capacity: Number(data.capacity),
      status: data.status,
      insurance_expiry: data.insuranceExpiry,
      puc_expiry: data.pucExpiry,
      registration_expiry: data.insuranceExpiry, // Backend requires this; fallback to insurance_expiry
      current_odometer: Number(data.currentOdometer || 0)
    };
    
    try {
      await createVehicle(payload);
      toast.success('Vehicle created successfully');
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
        toast.error('Failed to create vehicle');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title="Add New Vehicle" description="Register a new vehicle to your fleet." />
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <VehicleForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
