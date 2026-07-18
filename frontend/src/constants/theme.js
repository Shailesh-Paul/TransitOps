/**
 * TransitOps Enterprise UI Tokens
 * Centralized Tailwind classes for reusable components.
 */

export const BUTTON_VARIANTS = {
  primary: 'bg-semantic-primary text-semantic-background hover:bg-opacity-90 font-semibold px-4 py-2 rounded-md transition-all shadow-sm',
  secondary: 'bg-semantic-surface text-semantic-text-primary border border-semantic-border hover:bg-semantic-surface-container font-medium px-4 py-2 rounded-md transition-all',
  outline: 'bg-transparent border border-semantic-primary text-semantic-primary hover:bg-semantic-primary hover:text-semantic-background font-medium px-4 py-2 rounded-md transition-all',
  ghost: 'bg-transparent text-semantic-text-secondary hover:text-semantic-text-primary hover:bg-semantic-surface font-medium px-4 py-2 rounded-md transition-all',
  danger: 'bg-semantic-danger text-white hover:bg-opacity-90 font-semibold px-4 py-2 rounded-md transition-all shadow-sm',
};

export const INPUT_STYLES = {
  base: 'w-full bg-semantic-surface border border-semantic-border rounded-md px-4 py-2 text-semantic-text-primary focus:outline-none focus:ring-2 focus:ring-semantic-primary focus:border-transparent transition-all placeholder:text-semantic-muted',
  error: 'w-full bg-semantic-surface border border-semantic-danger rounded-md px-4 py-2 text-semantic-text-primary focus:outline-none focus:ring-2 focus:ring-semantic-danger focus:border-transparent transition-all',
  disabled: 'w-full bg-semantic-surface opacity-50 cursor-not-allowed border border-semantic-border rounded-md px-4 py-2 text-semantic-text-secondary',
};

export const CARD_STYLES = {
  base: 'bg-semantic-surface border border-semantic-border rounded-lg p-6 shadow-card',
  glass: 'glass-card rounded-lg p-6', // Uses utility from global.css
  interactive: 'bg-semantic-surface border border-semantic-border rounded-lg p-6 shadow-card hover:shadow-hover hover:border-semantic-primary transition-all cursor-pointer',
};

export const BADGE_STYLES = {
  success: 'bg-semantic-success/20 text-semantic-success border border-semantic-success/30 px-2.5 py-0.5 rounded-full text-xs font-medium',
  warning: 'bg-semantic-warning/20 text-semantic-warning border border-semantic-warning/30 px-2.5 py-0.5 rounded-full text-xs font-medium',
  danger: 'bg-semantic-danger/20 text-semantic-danger border border-semantic-danger/30 px-2.5 py-0.5 rounded-full text-xs font-medium',
  info: 'bg-semantic-info/20 text-semantic-info border border-semantic-info/30 px-2.5 py-0.5 rounded-full text-xs font-medium',
  neutral: 'bg-semantic-surface-container text-semantic-text-secondary border border-semantic-border px-2.5 py-0.5 rounded-full text-xs font-medium',
};

export const STATUS_COLORS = {
  // Vehicle Statuses
  Available: BADGE_STYLES.success,
  Reserved: BADGE_STYLES.warning,
  'On Trip': BADGE_STYLES.info,
  'In Shop': BADGE_STYLES.danger,
  Retired: BADGE_STYLES.neutral,
  
  // Trip Statuses
  Draft: BADGE_STYLES.neutral,
  Assigned: BADGE_STYLES.info,
  Dispatched: BADGE_STYLES.warning,
  'In Progress': BADGE_STYLES.info,
  Completed: BADGE_STYLES.success,
  Cancelled: BADGE_STYLES.danger,
};

export const TABLE_STYLES = {
  container: 'w-full overflow-hidden rounded-lg border border-semantic-border bg-semantic-surface shadow-card',
  header: 'bg-semantic-surface-container border-b border-semantic-border px-4 py-3 text-left text-xs font-semibold text-semantic-text-secondary uppercase tracking-wider',
  row: 'border-b border-semantic-border hover:bg-semantic-surface-container/50 transition-colors',
  cell: 'px-4 py-3 text-sm text-semantic-text-primary whitespace-nowrap',
};

export const MODAL_STYLES = {
  overlay: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4',
  content: 'bg-semantic-background border border-semantic-border rounded-xl shadow-modal w-full max-w-lg overflow-hidden flex flex-col',
  header: 'px-6 py-4 border-b border-semantic-border flex justify-between items-center bg-semantic-surface/50',
  body: 'p-6 overflow-y-auto',
  footer: 'px-6 py-4 border-t border-semantic-border bg-semantic-surface/50 flex justify-end gap-3',
};
