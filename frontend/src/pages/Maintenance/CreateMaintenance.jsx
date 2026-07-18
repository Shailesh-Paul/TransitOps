import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import MaintenanceForm from '../../forms/MaintenanceForm';
import Loader from '../../components/Loader';
import { createMaintenance } from '../../services/maintenanceService';
import { getVehicles } from '../../services/vehicleService';
import toast from 'react-hot-toast';

export default function CreateMaintenance() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        const v = await getVehicles();
        const eligibleVehicles = (Array.isArray(v) ? v : (v.data || [])).filter(
          vehicle => ['Available', 'Reserved'].includes(vehicle.status)
        );
        setVehicles(eligibleVehicles);
      } catch {
        toast.error('Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    };
    loadDependencies();
  }, []);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const categoryMap = {
        'Preventive': 'routine',
        'Corrective': 'repair',
        'Emergency': 'emergency',
        'Inspection': 'inspection'
      };

      const payload = {
        vehicle_id: data.vehicle_id,
        type: categoryMap[data.category] || 'routine',
        description: `[${data.type}] - ${data.priority} Priority - Trigger: ${data.trigger_type}\n\n${data.description}`,
        cost: Number(data.cost) || 0,
        start_date: data.scheduled_date,
        end_date: data.expected_completion_date,
        performed_by: data.technician || null
      };

      await createMaintenance(payload);
      toast.success('Maintenance scheduled successfully');
      navigate('/maintenance');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to schedule maintenance';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title="Schedule Maintenance" description="Plan maintenance for your fleet." />
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <MaintenanceForm onSubmit={handleSubmit} isSubmitting={isSubmitting} vehicles={vehicles} />
      </div>
    </div>
  );
}
