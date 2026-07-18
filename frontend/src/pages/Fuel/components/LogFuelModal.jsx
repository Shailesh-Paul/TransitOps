import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateFuelLog, createFuelLog } from '../../../services/fuelService';
import { getVehicles } from '../../../services/vehicleService';
import toast from 'react-hot-toast';
import { FiX, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

export default function LogFuelModal({ isOpen, onClose, onLogged }) {
  const [step, setStep] = useState(1); // 1 = Form, 2 = Confirm Warnings
  const [loading, setLoading] = useState(false);
  
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    odometer_reading: '',
    liters: '',
    cost: '',
    station: '',
    date: new Date().toISOString().slice(0, 16)
  });

  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        vehicle_id: '',
        odometer_reading: '',
        liters: '',
        cost: '',
        station: '',
        date: new Date().toISOString().slice(0, 16)
      });
      setValidationErrors([]);
      setValidationWarnings([]);
      loadVehicles();
    }
  }, [isOpen]);

  const loadVehicles = async () => {
    try {
      const res = await getVehicles({ limit: 100 });
      setVehicles(res.data.data);
    } catch (err) {
      toast.error("Failed to load vehicles");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleValidate = async (e) => {
    e.preventDefault();
    setValidationErrors([]);
    setValidationWarnings([]);
    setLoading(true);

    try {
      // Step 1: Pre-flight validation against Engine
      const res = await validateFuelLog(formData);
      
      if (!res.valid && res.errors.length > 0) {
        setValidationErrors(res.errors);
      } else if (res.warnings.length > 0) {
        setValidationWarnings(res.warnings);
        setStep(2); // Transition to Confirmation Screen
      } else {
        // Valid & No Warnings -> Submit directly
        await submitFuelLog();
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Validation request failed.";
      setValidationErrors([msg]);
    } finally {
      setLoading(false);
    }
  };

  const submitFuelLog = async () => {
    setLoading(true);
    try {
      await createFuelLog(formData);
      toast.success("Fuel log created successfully.");
      onLogged();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to log fuel.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-surface-container-high border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surface-container-highest">
            <h2 className="text-xl font-headline-md text-primary">Log Fuel Entry</h2>
            <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors">
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto no-scrollbar">
            {step === 1 ? (
              <form id="logFuelForm" onSubmit={handleValidate} className="flex flex-col gap-4">
                
                {validationErrors.length > 0 && (
                  <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex flex-col gap-2">
                    <span className="text-error font-label-bold flex items-center gap-2">
                      <FiAlertTriangle /> Error
                    </span>
                    <ul className="list-disc list-inside text-sm text-on-surface-variant">
                      {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-label-bold text-on-surface-variant uppercase tracking-wider">Vehicle *</label>
                  <select 
                    name="vehicle_id" 
                    value={formData.vehicle_id} 
                    onChange={handleChange} 
                    required
                    className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-primary focus:border-primary-fixed focus:outline-none transition-colors"
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.registration_number} - {v.make} {v.model}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-label-bold text-on-surface-variant uppercase tracking-wider">Odometer *</label>
                    <input 
                      type="number" 
                      name="odometer_reading" 
                      value={formData.odometer_reading} 
                      onChange={handleChange} 
                      required
                      placeholder="e.g. 45000"
                      className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-primary focus:border-primary-fixed focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-label-bold text-on-surface-variant uppercase tracking-wider">Liters *</label>
                    <input 
                      type="number" 
                      name="liters" 
                      step="0.01"
                      value={formData.liters} 
                      onChange={handleChange} 
                      required
                      placeholder="e.g. 50.5"
                      className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-primary focus:border-primary-fixed focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-label-bold text-on-surface-variant uppercase tracking-wider">Total Cost (₹) *</label>
                    <input 
                      type="number" 
                      name="cost" 
                      step="0.01"
                      value={formData.cost} 
                      onChange={handleChange} 
                      required
                      placeholder="e.g. 5000"
                      className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-primary focus:border-primary-fixed focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-label-bold text-on-surface-variant uppercase tracking-wider">Date *</label>
                    <input 
                      type="datetime-local" 
                      name="date" 
                      value={formData.date} 
                      onChange={handleChange} 
                      required
                      className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-primary focus:border-primary-fixed focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-label-bold text-on-surface-variant uppercase tracking-wider">Station / Vendor</label>
                  <input 
                    type="text" 
                    name="station" 
                    value={formData.station} 
                    onChange={handleChange} 
                    placeholder="e.g. Indian Oil, Route 66"
                    className="w-full bg-surface-container border border-white/10 rounded-lg p-3 text-primary focus:border-primary-fixed focus:outline-none transition-colors"
                  />
                </div>
              </form>
            ) : (
              // Step 2: Warning Confirmation
              <div className="flex flex-col gap-6 py-4">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-error/10 border border-error/20 flex items-center justify-center text-error">
                    <FiAlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-headline-md text-primary mb-2">Manual Review Required</h3>
                    <p className="text-on-surface-variant text-sm">The validation engine detected operational anomalies. Please review before proceeding.</p>
                  </div>
                </div>

                <div className="bg-surface-container border border-error/20 rounded-xl p-4 flex flex-col gap-3">
                  {validationWarnings.map((warn, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <FiAlertTriangle className="text-error w-5 h-5 shrink-0 mt-0.5" />
                      <span className="text-sm text-primary">{warn}</span>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-on-surface-variant italic text-center">
                  Proceeding will generate an Audit Log flagging these bypassed warnings.
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/5 bg-surface-container-highest flex justify-end gap-4">
            {step === 1 ? (
              <>
                <button type="button" onClick={onClose} className="px-6 py-2 rounded-full font-label-bold text-on-surface hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button 
                  form="logFuelForm" 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-label-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Validating...' : 'Log Fuel'}
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setStep(1)} className="px-6 py-2 rounded-full font-label-bold text-on-surface hover:bg-white/5 transition-colors">
                  Go Back
                </button>
                <button 
                  onClick={submitFuelLog} 
                  disabled={loading}
                  className="px-6 py-2 rounded-full bg-error/20 text-error font-label-bold hover:bg-error/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Processing...' : 'Acknowledge & Proceed'}
                </button>
              </>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
