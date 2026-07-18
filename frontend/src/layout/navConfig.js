import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Map, 
  Wrench, 
  Droplets, 
  BadgeDollarSign, 
  LineChart,
  Bell,
  Settings,
  UserCircle
} from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { PERMISSIONS } from '../constants/permissions';

export const SIDEBAR_GROUPS = [
  {
    title: 'Dashboard',
    items: [
      { name: 'Overview', path: ROUTES.DASHBOARD, icon: LayoutDashboard, permissions: ['*'] }
    ]
  },
  {
    title: 'Fleet',
    items: [
      { name: 'Vehicles', path: ROUTES.VEHICLES, icon: Truck, permissions: [PERMISSIONS.VIEW_VEHICLES] },
      { name: 'Drivers', path: ROUTES.DRIVERS, icon: Users, permissions: [PERMISSIONS.VIEW_DRIVERS] },
      { name: 'Trips', path: ROUTES.TRIPS, icon: Map, permissions: [PERMISSIONS.VIEW_TRIPS] },
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Maintenance', path: ROUTES.MAINTENANCE, icon: Wrench, permissions: ['*'] },
      { name: 'Fuel', path: ROUTES.FUEL, icon: Droplets, permissions: ['*'] },
      { name: 'Expenses', path: ROUTES.EXPENSES, icon: BadgeDollarSign, permissions: ['*'] },
    ]
  },
  {
    title: 'Insights',
    items: [
      { name: 'Reports', path: ROUTES.REPORTS, icon: LineChart, permissions: [PERMISSIONS.VIEW_REPORTS] },
    ]
  },
  {
    title: 'Account',
    items: [
      { name: 'Notifications', path: ROUTES.NOTIFICATIONS, icon: Bell, permissions: ['*'] },
      { name: 'Settings', path: ROUTES.SETTINGS, icon: Settings, permissions: [PERMISSIONS.MANAGE_SETTINGS] },
      { name: 'Profile', path: ROUTES.PROFILE, icon: UserCircle, permissions: ['*'] },
    ]
  }
];

