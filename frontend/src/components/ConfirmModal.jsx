import { FiAlertTriangle, FiX } from 'react-icons/fi';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger' }) {
  if (!isOpen) return null;

  const btnClass = variant === 'danger' 
    ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 text-white' 
    : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            {variant === 'danger' && <FiAlertTriangle className="text-rose-500" />}
            {title}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-slate-600 text-sm whitespace-pre-wrap">{message}</p>
        </div>
        <div className="p-4 bg-slate-50 flex justify-end gap-3 rounded-b-2xl border-t border-slate-100">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors shadow-sm ${btnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
