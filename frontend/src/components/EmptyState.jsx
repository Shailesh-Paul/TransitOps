import { FiInbox } from 'react-icons/fi';
import clsx from 'clsx';

export default function EmptyState({ 
  title = 'No Data Available', 
  message = 'There is no data to show here right now.', 
  icon = FiInbox,
  action,
  className
}) {
  const Icon = icon;
  return (
    <div className={clsx("flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl shadow-sm border border-slate-100", className)}>
      <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-slate-500 mt-1 max-w-sm">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
