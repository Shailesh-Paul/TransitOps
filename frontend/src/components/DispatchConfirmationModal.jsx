import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiSend } from 'react-icons/fi';

export default function DispatchConfirmationModal({ isOpen, onClose, onConfirm, trip, isDispatching }) {
  if (!isOpen || !trip) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100"
        >
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <FiSend className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Dispatch Trip?</h3>
              <p className="text-sm text-slate-500">Review details before dispatching</p>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="text-slate-500 mb-1">Vehicle</span>
                <span className="font-semibold text-slate-900">{trip.registration_number || 'Unassigned'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 mb-1">Driver</span>
                <span className="font-semibold text-slate-900">{trip.driver_first_name ? `${trip.driver_first_name} ${trip.driver_last_name}` : 'Unassigned'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 mb-1">Cargo</span>
                <span className="font-semibold text-slate-900">{trip.cargo_weight ? `${trip.cargo_weight} kg` : 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 mb-1">Route</span>
                <span className="font-semibold text-slate-900 truncate" title={trip.route_name}>{trip.route_name || 'Custom Route'}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <FiAlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Dispatching will lock this trip and immediately set the driver and vehicle statuses to <strong className="font-semibold">Reserved</strong>.
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
            <button
              onClick={onClose}
              disabled={isDispatching}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(trip.id)}
              disabled={isDispatching}
              className="px-5 py-2.5 rounded-lg bg-primary-fixed text-slate-900 font-semibold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,249,40,0.3)] disabled:opacity-50 flex items-center gap-2"
            >
              {isDispatching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Dispatching...
                </>
              ) : (
                'Dispatch Trip'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
