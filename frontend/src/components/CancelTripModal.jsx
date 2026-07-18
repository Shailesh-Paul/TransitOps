import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiX, FiAlertTriangle, FiAlertCircle } from "react-icons/fi";
import clsx from "clsx";

const CATEGORIES = [
  "Driver Unavailable",
  "Driver Sick",
  "Vehicle Breakdown",
  "Vehicle Sent To Maintenance",
  "Customer Cancelled",
  "Cargo Unavailable",
  "Weather Conditions",
  "Road Closure",
  "Scheduling Conflict",
  "Emergency",
  "Other"
];

export default function CancelTripModal({ isOpen, onClose, onConfirm, trip, isTerminating = false, isLoading = false }) {
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");
  const [managerConfirmed, setManagerConfirmed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCategory("");
      setReason("");
      setManagerConfirmed(false);
    }
  }, [isOpen]);

  const requiresReason = category === "Other" || category === "Emergency" || isTerminating;

  const isFormValid = () => {
    if (!category) return false;
    if (requiresReason && !reason.trim()) return false;
    if (isTerminating && !managerConfirmed) return false;
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    onConfirm({ category, reason });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => !isLoading && onClose()}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all border border-slate-100">
                <div className={clsx(
                  "px-6 py-5 border-b",
                  isTerminating ? "bg-rose-50 border-rose-100" : "bg-slate-50 border-slate-100"
                )}>
                  <div className="flex items-center justify-between">
                    <Dialog.Title as="h3" className={clsx(
                      "text-lg font-bold flex items-center gap-2",
                      isTerminating ? "text-rose-700" : "text-slate-900"
                    )}>
                      {isTerminating ? <FiAlertTriangle className="w-5 h-5" /> : <FiAlertCircle className="w-5 h-5" />}
                      {isTerminating ? "Emergency Terminate Trip" : "Cancel Trip"}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      disabled={isLoading}
                      className="text-slate-400 hover:text-slate-500 disabled:opacity-50"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  {isTerminating && (
                    <p className="text-sm text-rose-600 mt-2 font-medium">
                      This trip is currently active. Emergency termination should only be used for exceptional operational events.
                    </p>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      {isTerminating ? "Termination Category" : "Cancellation Category"}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={isLoading}
                      className="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500 shadow-sm disabled:bg-slate-50"
                      required
                    >
                      <option value="">Select a category...</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {requiresReason && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Detailed Justification
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={isLoading}
                        className="w-full rounded-lg border-slate-300 focus:border-primary-500 focus:ring-primary-500 shadow-sm disabled:bg-slate-50 min-h-[100px] resize-none"
                        placeholder="Provide details about why this trip is being cancelled/terminated..."
                        required
                      />
                    </div>
                  )}

                  {isTerminating && (
                    <div className="flex items-start gap-3 mt-4 bg-rose-50 p-4 rounded-lg border border-rose-100">
                      <div className="flex items-center h-5">
                        <input
                          id="managerConfirm"
                          type="checkbox"
                          checked={managerConfirmed}
                          onChange={(e) => setManagerConfirmed(e.target.checked)}
                          disabled={isLoading}
                          className="w-4 h-4 text-rose-600 border-rose-300 rounded focus:ring-rose-500"
                        />
                      </div>
                      <div className="text-sm">
                        <label htmlFor="managerConfirm" className="font-medium text-rose-900">
                          Manager Confirmation
                        </label>
                        <p className="text-rose-700">I confirm that I have the authorization to emergency terminate this active trip.</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!isFormValid() || isLoading}
                      className={clsx(
                        "flex-1 px-4 py-2 text-white rounded-lg font-bold transition-all disabled:opacity-50",
                        isTerminating ? "bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.3)]" : "bg-primary-600 hover:bg-primary-700 shadow-sm"
                      )}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        isTerminating ? 'Confirm Termination' : 'Confirm Cancellation'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
