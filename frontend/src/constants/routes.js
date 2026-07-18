/**
 * Application Routes Constants
 */

export const PUBLIC_ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
};

export const PRIVATE_ROUTES = {
  DASHBOARD: '/',
  
  VEHICLES: '/vehicles',
  VEHICLES_ADD: '/vehicles/create',
  VEHICLES_EDIT: '/vehicles/edit/:id',
  VEHICLES_DETAILS: '/vehicles/:id/details',
  VEHICLE_FUEL_HISTORY: '/vehicles/:id/fuel-history',
  
  DRIVERS: '/drivers',
  DRIVERS_ADD: '/drivers/create',
  DRIVERS_EDIT: '/drivers/edit/:id',
  DRIVERS_DETAILS: '/drivers/:id/details',
  
  TRIPS: '/trips',
  TRIPS_CREATE: '/trips/create',
  TRIPS_DETAILS: '/trips/:id',
  
  MAINTENANCE: '/maintenance',
  MAINTENANCE_CREATE: '/maintenance/create',
  MAINTENANCE_HISTORY: '/maintenance/history',
  MAINTENANCE_ANALYTICS: '/maintenance/analytics',
  MAINTENANCE_DETAILS: '/maintenance/:id',
  
  FUEL: '/fuel',
  FUEL_DASHBOARD: '/fuel/dashboard',
  FUEL_DETAILS: '/fuel/:id',
  EXPENSES: '/expenses',
  EXPENSES_LIST: '/expenses/list',
  EXPENSES_DETAILS: '/expenses/:id',
  APPROVAL_WORKSPACE: '/finance/approvals/:id',
  REPORTS: '/reports',
  
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  PROFILE: '/profile',
};

export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...PRIVATE_ROUTES,
};
