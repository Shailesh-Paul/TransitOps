import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiPlay, FiX } from 'react-icons/fi';
import clsx from 'clsx';

export default function StartTripModal({ isOpen, onClose, onConfirm, trip, vehicle, driver, isStarting }) {
  if (!trip) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => !isStarting && onClose()}>
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
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <FiPlay className="w-5 h-5 ml-1" />
                    </div>
                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900">
                      Start Journey?
                    </Dialog.Title>
                  </div>
                  <button 
                    onClick={onClose}
                    disabled={isStarting}
                    className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="mt-2 space-y-4">
                  <p className="text-sm text-slate-500 mb-4">
                    You are about to start this journey. The driver and vehicle will be marked as "On Trip".
                  </p>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Trip:</span>
                      <span className="text-slate-900 font-bold">TRP-{String(trip.id).padStart(5, '0')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Vehicle:</span>
                      <span className="text-slate-900 font-bold">{vehicle ? vehicle.registration_number : 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Driver:</span>
                      <span className="text-slate-900 font-bold">{driver ? `${driver.first_name} ${driver.last_name}` : 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Route:</span>
                      <span className="text-slate-900 font-bold text-right ml-4">
                        {trip.route_name || 'Custom Route'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg transition-colors disabled:opacity-50"
                    onClick={onClose}
                    disabled={isStarting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isStarting}
                    className={clsx(
                      "flex-1 px-4 py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
                      "bg-orange-500 text-white hover:bg-orange-600 shadow-sm",
                      isStarting && "opacity-75 cursor-not-allowed"
                    )}
                  >
                    {isStarting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Starting...
                      </>
                    ) : (
                      'Start Journey'
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
