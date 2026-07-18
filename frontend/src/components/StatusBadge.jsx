import clsx from 'clsx';
import { VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS, MAINTENANCE_STATUS } from '../utils/constants';

export default function StatusBadge({ status }) {
  // Convert backend snake_case or lowercase to Title Case
  const formattedStatus = status ? status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : 'Unknown';

  let colorClass = 'bg-slate-100 text-slate-700';
  let dotClass = 'bg-slate-500';

  if ([VEHICLE_STATUS.ACTIVE, DRIVER_STATUS.ON_DUTY, TRIP_STATUS.COMPLETED, MAINTENANCE_STATUS.COMPLETED, 'Available'].includes(formattedStatus)) {
    colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotClass = 'bg-emerald-500';
  } else if ([VEHICLE_STATUS.MAINTENANCE, TRIP_STATUS.DISPATCHED, MAINTENANCE_STATUS.IN_PROGRESS, 'In Progress', 'On Trip'].includes(formattedStatus)) {
    colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
    dotClass = 'bg-blue-500';
  } else if ([TRIP_STATUS.CANCELLED, VEHICLE_STATUS.INACTIVE, DRIVER_STATUS.ON_LEAVE, 'Suspended', 'Retired'].includes(formattedStatus)) {
    colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
    dotClass = 'bg-rose-500';
  } else if ([TRIP_STATUS.DRAFT, MAINTENANCE_STATUS.PENDING, DRIVER_STATUS.OFF_DUTY, 'Scheduled', 'Reserved'].includes(formattedStatus)) {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    dotClass = 'bg-amber-500';
  }

  return (
    <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap", colorClass)}>
      <span className={clsx("w-1.5 h-1.5 rounded-full", dotClass)}></span>
      {formattedStatus}
    </span>
  );
}
