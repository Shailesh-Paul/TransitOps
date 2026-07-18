/**
 * Centralized RBAC Permission Constants
 * Organized by Domain Module
 */

export const Permissions = {
  VEHICLE: {
    CREATE: "manage_vehicles",
    VIEW: "view_vehicles",
    UPDATE: "manage_vehicles",
    DELETE: "manage_vehicles",
  },
  DRIVER: {
    CREATE: "manage_drivers",
    VIEW: "view_drivers",
    UPDATE: "manage_drivers",
    DELETE: "manage_drivers",
  },
  TRIP: {
    CREATE: "manage_trips",
    UPDATE: "manage_trips",
    DISPATCH: "manage_trips",
    COMPLETE: "manage_trips",
    CANCEL: "manage_trips",
    EMERGENCY_TERMINATE: "emergency_terminate_trips",
    VIEW: "view_trips",
  },
  MAINTENANCE: {
    CREATE: "manage_vehicles",
    VIEW: "view_vehicles",
    UPDATE: "manage_vehicles",
    DELETE: "manage_vehicles",
    CLOSE: "manage_vehicles",
  },
  FUEL: {
    CREATE: "manage_vehicles",
    VIEW: "view_vehicles",
    UPDATE: "manage_vehicles",
    DELETE: "manage_vehicles",
  },
  EXPENSE: {
    CREATE: "manage_vehicles",
    VIEW: "view_vehicles",
    UPDATE: "manage_vehicles",
    DELETE: "manage_vehicles",
  },
  DASHBOARD: {
    VIEW: "view_reports", // Using view_reports as proxy for dashboard
  },
  REPORTS: {
    VIEW: "view_reports",
    EXPORT: "view_reports",
  },
  USERS: {
    CREATE: "manage_users",
    UPDATE: "manage_users",
    DELETE: "manage_users",
    VIEW: "view_users",
  },
  FINANCE: {
    SUBMIT: "finance_submit",
    APPROVE: "finance_approve",
    REJECT: "finance_reject",
    POST: "finance_post",
    ARCHIVE: "finance_archive"
  },
  RBAC: {
    MANAGE: "manage_roles",
  },
};

export default Permissions;
