/**
 * Enterprise RBAC Permission Constants
 * Matches the backend database seeding structure.
 */
export const PERMISSIONS = {
  // Users & Roles
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  MANAGE_ROLES: 'manage_roles',
  
  // Vehicles
  MANAGE_VEHICLES: 'manage_vehicles',
  VIEW_VEHICLES: 'view_vehicles',
  
  // Trips & Routes
  MANAGE_TRIPS: 'manage_trips',
  VIEW_TRIPS: 'view_trips',
  MANAGE_ROUTES: 'manage_routes',
  
  // HR & Employees
  MANAGE_DEPARTMENTS: 'manage_departments',
  MANAGE_ATTENDANCE: 'manage_attendance',
  VIEW_ATTENDANCE: 'view_attendance',
  MANAGE_LEAVES: 'manage_leaves',
  
  // Drivers
  MANAGE_DRIVERS: 'manage_drivers',
  VIEW_DRIVERS: 'view_drivers',
  
  // System & Reports
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_NOTIFICATIONS: 'manage_notifications',
  VIEW_REPORTS: 'view_reports',
  
  // Finance
  VIEW_FINANCE: 'view_finance',
  SUBMIT_FINANCE: 'finance_submit',
  APPROVE_FINANCE: 'finance_approve',
  REJECT_FINANCE: 'finance_reject',
  POST_FINANCE: 'finance_post',
  ARCHIVE_FINANCE: 'finance_archive',
};
