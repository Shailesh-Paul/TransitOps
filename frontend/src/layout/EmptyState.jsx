import React from 'react';
import { FolderOpen } from 'lucide-react';
import { BUTTON_VARIANTS } from '../constants/theme';

export default function EmptyState({ 
  title = "No data found", 
  description = "Get started by creating a new record.", 
  actionLabel, 
  onAction, 
  icon: Icon = FolderOpen 
}) {
  return (
    <div className="text-center py-16 px-4 sm:px-6 lg:px-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      <div className="mx-auto w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm mb-4">
        <Icon className="mx-auto h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-semantic-text-primary">{title}</h3>
      <p className="mt-1 text-sm text-semantic-text-secondary max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onAction}
            className={BUTTON_VARIANTS.primary}
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}
