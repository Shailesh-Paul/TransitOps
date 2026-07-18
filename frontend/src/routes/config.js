import { lazy } from 'react';
import { ROUTES } from '../constants/routes';
import { PERMISSIONS } from '../constants/permissions';

// Public Feature Pages
const Login = lazy(() => import('../pages/Login/Login'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/Auth/ResetPassword'));

// Private Feature Pages
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const Unauthorized = lazy(() => import('../pages/Unauthorized'));

const VehicleList = lazy(() => import('../pages/Vehicles/VehicleList'));
const AddVehicle = lazy(() => import('../pages/Vehicles/AddVehicle'));
const EditVehicle = lazy(() => import('../pages/Vehicles/EditVehicle'));
const VehicleDetails = lazy(() => import('../pages/Vehicles/VehicleDetails'));
const VehicleFuelHistory = lazy(() => import('../pages/Vehicles/VehicleFuelHistory'));

const DriverList = lazy(() => import('../pages/Drivers/DriverList'));
const AddDriver = lazy(() => import('../pages/Drivers/AddDriver'));
const EditDriver = lazy(() => import('../pages/Drivers/EditDriver'));
const DriverDetails = lazy(() => import('../pages/Drivers/DriverDetails'));

const TripList = lazy(() => import('../pages/Trips/TripList'));
const CreateTrip = lazy(() => import('../pages/Trips/CreateTrip'));
const TripDetails = lazy(() => import('../pages/Trips/TripDetails'));

const MaintenanceList = lazy(() => import('../pages/Maintenance/MaintenanceList'));
const CreateMaintenance = lazy(() => import('../pages/Maintenance/CreateMaintenance'));
const MaintenanceHistory = lazy(() => import('../pages/Maintenance/MaintenanceHistory'));
const MaintenanceAnalytics = lazy(() => import('../pages/Maintenance/MaintenanceAnalytics'));
const MaintenanceDetails = lazy(() => import('../pages/Maintenance/MaintenanceDetails'));

const FuelLogs = lazy(() => import('../pages/Fuel/FuelLogs'));
const FuelDashboard = lazy(() => import('../pages/Fuel/FuelDashboard'));
const FuelDetails = lazy(() => import('../pages/Fuel/FuelDetails'));
const FinancialDashboard = lazy(() => import('../pages/Expenses/FinancialDashboard'));
const ExpenseList = lazy(() => import('../pages/Expenses/ExpenseList'));
const ExpenseDetails = lazy(() => import('../pages/Expenses/ExpenseDetails'));
const ApprovalWorkspace = lazy(() => import('../pages/Approvals/ApprovalWorkspace'));
const Reports = lazy(() => import('../pages/Reports/Reports'));

const Notifications = lazy(() => import('../pages/Notifications/Notifications'));
const Settings = lazy(() => import('../pages/Settings/Settings'));
const Profile = lazy(() => import('../pages/Profile/Profile'));

/**
 * Public Routes Config
 */
export const publicRoutes = [
  { path: ROUTES.LOGIN, element: Login },
  { path: ROUTES.FORGOT_PASSWORD, element: ForgotPassword },
  { path: ROUTES.RESET_PASSWORD, element: ResetPassword },
];

/**
 * Private Routes Config
 * Provides permission metadata for RBAC and descriptive breadcrumbs.
 */
export const privateRoutes = [
  { path: ROUTES.DASHBOARD, element: Dashboard, permissions: ['*'], breadcrumb: 'Dashboard' },
  { path: '/unauthorized', element: Unauthorized, permissions: ['*'], breadcrumb: 'Unauthorized' },
  
  { path: ROUTES.VEHICLES, element: VehicleList, permissions: [PERMISSIONS.VIEW_VEHICLES], breadcrumb: 'Vehicles' },
  { path: ROUTES.VEHICLES_ADD, element: AddVehicle, permissions: [PERMISSIONS.MANAGE_VEHICLES], breadcrumb: 'Add Vehicle' },
  { path: ROUTES.VEHICLES_EDIT, element: EditVehicle, permissions: [PERMISSIONS.MANAGE_VEHICLES], breadcrumb: 'Edit Vehicle' },
  { path: ROUTES.VEHICLES_DETAILS, element: VehicleDetails, permissions: [PERMISSIONS.VIEW_VEHICLES], breadcrumb: 'Vehicle Details' },
  { path: ROUTES.VEHICLE_FUEL_HISTORY, element: VehicleFuelHistory, permissions: [PERMISSIONS.VIEW_VEHICLES], breadcrumb: 'Vehicle Fuel History' },
  
  { path: ROUTES.DRIVERS, element: DriverList, permissions: [PERMISSIONS.VIEW_DRIVERS], breadcrumb: 'Drivers' },
  { path: ROUTES.DRIVERS_ADD, element: AddDriver, permissions: [PERMISSIONS.MANAGE_DRIVERS], breadcrumb: 'Add Driver' },
  { path: ROUTES.DRIVERS_EDIT, element: EditDriver, permissions: [PERMISSIONS.MANAGE_DRIVERS], breadcrumb: 'Edit Driver' },
  { path: ROUTES.DRIVERS_DETAILS, element: DriverDetails, permissions: [PERMISSIONS.VIEW_DRIVERS], breadcrumb: 'Driver Details' },
  
  { path: ROUTES.TRIPS, element: TripList, permissions: [PERMISSIONS.VIEW_TRIPS], breadcrumb: 'Trips' },
  { path: ROUTES.TRIPS_CREATE, element: CreateTrip, permissions: [PERMISSIONS.MANAGE_TRIPS], breadcrumb: 'Create Trip' },
  { path: ROUTES.TRIPS_DETAILS, element: TripDetails, permissions: [PERMISSIONS.VIEW_TRIPS], breadcrumb: 'Trip Details' },
  
  { path: ROUTES.MAINTENANCE, element: MaintenanceList, permissions: ['*'], breadcrumb: 'Maintenance' },
  { path: ROUTES.MAINTENANCE_CREATE, element: CreateMaintenance, permissions: ['*'], breadcrumb: 'Schedule Maintenance' },
  { path: ROUTES.MAINTENANCE_HISTORY, element: MaintenanceHistory, permissions: ['*'], breadcrumb: 'Service History' },
  { path: ROUTES.MAINTENANCE_ANALYTICS, element: MaintenanceAnalytics, permissions: ['*'], breadcrumb: 'Maintenance Analytics' },
  { path: ROUTES.MAINTENANCE_DETAILS, element: MaintenanceDetails, permissions: ['*'], breadcrumb: 'Maintenance Details' },
  
  { path: ROUTES.FUEL, element: FuelLogs, permissions: ['*'], breadcrumb: 'Fuel Logs' },
  { path: ROUTES.FUEL_DASHBOARD, element: FuelDashboard, permissions: ['*'], breadcrumb: 'Fuel Dashboard' },
  { path: ROUTES.FUEL_DETAILS, element: FuelDetails, permissions: ['*'], breadcrumb: 'Fuel Details' },
  { path: ROUTES.EXPENSES, element: FinancialDashboard, permissions: ['*'], breadcrumb: 'Financial Command Center' },
  { path: ROUTES.EXPENSES_LIST, element: ExpenseList, permissions: ['*'], breadcrumb: 'Expense List' },
  { path: ROUTES.EXPENSES_DETAILS, element: ExpenseDetails, permissions: [PERMISSIONS.VIEW_FINANCE], breadcrumb: 'Expense Details' },
  { path: ROUTES.APPROVAL_WORKSPACE, element: ApprovalWorkspace, permissions: [PERMISSIONS.VIEW_FINANCE], breadcrumb: 'Approval Workspace' },
  { path: ROUTES.REPORTS, element: Reports, permissions: [PERMISSIONS.VIEW_REPORTS], breadcrumb: 'Reports' },
  
  { path: ROUTES.NOTIFICATIONS, element: Notifications, permissions: ['*'], breadcrumb: 'Notifications' },
  { path: ROUTES.SETTINGS, element: Settings, permissions: [PERMISSIONS.MANAGE_SETTINGS], breadcrumb: 'Settings' },
  { path: ROUTES.PROFILE, element: Profile, permissions: ['*'], breadcrumb: 'Profile' },
];
