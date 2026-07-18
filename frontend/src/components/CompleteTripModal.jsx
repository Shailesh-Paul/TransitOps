import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiCheckSquare, FiX, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';
import clsx from 'clsx';

export default function CompleteTripModal({ isOpen, onClose, onConfirm, trip, vehicle, isCompleting }) {
  const [odometer, setOdometer] = useState('');
  const [fuel, setFuel] = useState('');
  const [remarks, setRemarks] = useState('');
  const [completedDate, setCompletedDate] = useState('');

  // Enterprise Distance Validation State
  const [validationState, setValidationState] = useState('idle'); // 'idle', 'warning', 'justification', 'critical'
  const [deviationReason, setDeviationReason] = useState('');
  const [deviationInfo, setDeviationInfo] = useState(null);

  // Set default values when modal opens
  useEffect(() => {
    if (isOpen) {
      setOdometer(vehicle?.current_odometer ? String(vehicle.current_odometer) : '');
      setFuel('');
      setRemarks('');
      setValidationState('idle');
      setDeviationReason('');
      setDeviationInfo(null);
      
      // Set to current local time in YYYY-MM-DDThh:mm format for datetime-local input
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setCompletedDate(now.toISOString().slice(0, 16));
    }
  }, [isOpen, vehicle]);

  const handleValidation = (e) => {
    if (e) e.preventDefault();
    
    const startOdometer = vehicle?.current_odometer || 0;
    const endOdometer = Number(odometer);
    const actualDistance = endOdometer - startOdometer;
    const plannedDistance = Number(trip?.distance_km || 0);
    
    // Only run validation if we haven't already advanced past 'idle' and plannedDistance > 0
    if (plannedDistance > 0 && validationState === 'idle') {
      const percentage = ((actualDistance - plannedDistance) / plannedDistance) * 100;
      
      if (percentage > 20) {
        setDeviationInfo({
          planned: plannedDistance,
          actual: actualDistance,
          diff: actualDistance - plannedDistance,
          percentage: percentage.toFixed(1)
        });
        
        if (percentage > 300) {
          setValidationState('critical');
          return;
        } else if (percentage > 50) {
          setValidationState('justification');
          return;
        } else {
          setValidationState('warning');
          return;
        }
      }
    }
    
    executeCompletion();
  };

  const executeCompletion = () => {
    onConfirm({
      final_odometer: Number(odometer),
      fuel_consumed: Number(fuel),
      remarks: remarks.trim() || undefined,
      end_time: new Date(completedDate).toISOString(),
      deviation_reason: deviationReason.trim() || undefined
    });
  };

  const handleGoBack = () => {
    setValidationState('idle');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => !isCompleting && onClose()}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                
                {/* IDLE STATE: NORMAL FORM */}
                {validationState === 'idle' && (
                  <>
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <FiCheckSquare className="w-5 h-5" />
                        </div>
                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900">
                          Complete Trip
                        </Dialog.Title>
                      </div>
                      <button onClick={onClose} disabled={isCompleting} className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50">
                        <FiX className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm text-slate-500 mb-6">
                        Please provide the final metrics to complete trip <strong>TRP-{trip?.id}</strong>.
                        <br />
                        Vehicle: {vehicle ? vehicle.registration_number : 'Unknown'}
                      </p>

                      <form onSubmit={handleValidation} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Final Odometer Reading <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              required
                              min={(vehicle?.current_odometer || 0) + 1}
                              value={odometer}
                              onChange={(e) => setOdometer(e.target.value)}
                              className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow outline-none"
                              placeholder="e.g. 45200"
                            />
                            <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 text-sm pointer-events-none">km</span>
                          </div>
                          {vehicle?.current_odometer !== undefined && (
                            <p className="mt-1 text-xs text-slate-500">
                              Current reading: {vehicle.current_odometer} km
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Fuel Consumed <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              required
                              min="0.1"
                              step="0.1"
                              value={fuel}
                              onChange={(e) => setFuel(e.target.value)}
                              className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow outline-none"
                              placeholder="e.g. 45.5"
                            />
                            <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 text-sm pointer-events-none">L</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Completed Date <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="datetime-local"
                            required
                            value={completedDate}
                            onChange={(e) => setCompletedDate(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Completion Remarks
                          </label>
                          <textarea
                            rows="3"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow outline-none resize-none"
                            placeholder="Any incidents, delays, or general notes?"
                          />
                        </div>

                        <div className="mt-8 flex gap-3">
                          <button type="button" onClick={onClose} disabled={isCompleting} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg transition-colors">
                            Cancel
                          </button>
                          <button type="submit" disabled={isCompleting} className="flex-1 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                            {isCompleting ? 'Saving...' : 'Complete Trip'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                )}

                {/* WARNING & JUSTIFICATION & CRITICAL STATES */}
                {validationState !== 'idle' && deviationInfo && (
                  <>
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          validationState === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                        )}>
                          {validationState === 'critical' ? <FiAlertCircle className="w-5 h-5" /> : <FiAlertTriangle className="w-5 h-5" />}
                        </div>
                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900">
                          {validationState === 'critical' ? 'Critical Deviation Detected' : 'Distance Deviation Detected'}
                        </Dialog.Title>
                      </div>
                      <button onClick={onClose} disabled={isCompleting} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <FiX className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="mt-2 space-y-4">
                      {validationState === 'warning' && (
                        <p className="text-sm text-slate-600">
                          Actual distance is significantly higher than the planned route. Do you want to continue?
                        </p>
                      )}
                      
                      {validationState === 'justification' && (
                        <p className="text-sm text-slate-600">
                          The travelled distance exceeds the planned route by more than 50%. Please provide a reason.
                        </p>
                      )}
                      
                      {validationState === 'critical' && (
                        <p className="text-sm text-slate-600">
                          Unusually high trip distance detected. Please verify the odometer reading. Completion requires Manager confirmation and will be strictly audited.
                        </p>
                      )}

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-2">
                        <div className="flex justify-between"><span className="text-slate-500">Planned Distance:</span><span className="font-bold text-slate-900">{deviationInfo.planned} km</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Actual Distance:</span><span className="font-bold text-slate-900">{deviationInfo.actual} km</span></div>
                        <div className="flex justify-between border-t border-slate-200 pt-2"><span className="text-slate-500">Difference:</span><span className="font-bold text-amber-600">+{deviationInfo.diff} km ({deviationInfo.percentage}%)</span></div>
                      </div>

                      {(validationState === 'justification' || validationState === 'critical') && (
                        <div className="pt-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Deviation Reason <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            required
                            rows="3"
                            value={deviationReason}
                            onChange={(e) => setDeviationReason(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow outline-none resize-none"
                            placeholder="e.g. Road Diversion, Customer Route Change..."
                          />
                        </div>
                      )}

                      <div className="mt-8 flex gap-3">
                        <button type="button" onClick={handleGoBack} disabled={isCompleting} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg transition-colors">
                          Back to Edit
                        </button>
                        <button 
                          type="button" 
                          onClick={executeCompletion} 
                          disabled={isCompleting || ((validationState === 'justification' || validationState === 'critical') && !deviationReason.trim())} 
                          className={clsx(
                            "flex-1 px-4 py-2 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
                            validationState === 'critical' ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-500 hover:bg-amber-600",
                            isCompleting && "opacity-75 cursor-not-allowed"
                          )}
                        >
                          {isCompleting ? 'Saving...' : 'Confirm Completion'}
                        </button>
                      </div>
                    </div>
                  </>
                )}

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
