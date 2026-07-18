import { VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS, MAINTENANCE_STATUS, EXPENSE_CATEGORIES } from '../utils/constants';

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = (arr) => arr[getRandomInt(0, arr.length - 1)];

// Generate 20 Vehicles
const vehicleModels = ['Volvo FH16', 'Kenworth T680', 'Peterbilt 579', 'Freightliner Cascadia', 'Mack Anthem', 'Scania R-Series', 'DAF XF'];
const vehicleTypes = ['Heavy Truck', 'Semi-Trailer', 'Flatbed', 'Refrigerated', 'Tanker'];

export const mockVehicles = Array.from({ length: 20 }).map((_, i) => ({
  id: `V-${1000 + i}`,
  registrationNumber: `TRK-${getRandomInt(1000, 9999)}`,
  name: `Fleet Unit ${i + 1}`,
  model: getRandomItem(vehicleModels),
  type: getRandomItem(vehicleTypes),
  capacity: `${getRandomInt(10, 40)} Tons`,
  odometer: getRandomInt(50000, 500000),
  cost: getRandomInt(80000, 150000),
  status: getRandomItem(Object.values(VEHICLE_STATUS)),
  lastMaintenance: new Date(Date.now() - getRandomInt(1, 30) * 86400000).toISOString()
}));

// Generate 30 Drivers
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'William', 'David', 'James', 'Robert', 'Mary', 'Patricia', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];

export const mockDrivers = Array.from({ length: 30 }).map((_, i) => ({
  id: `D-${1000 + i}`,
  name: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
  licenseNumber: `DL${getRandomInt(10000000, 99999999)}`,
  licenseCategory: getRandomItem(['A', 'B', 'CE']),
  expiry: new Date(Date.now() + getRandomInt(100, 1000) * 86400000).toISOString(),
  phone: `+1-555-${getRandomInt(1000, 9999)}`,
  safetyScore: getRandomInt(75, 100),
  status: getRandomItem(Object.values(DRIVER_STATUS))
}));

// Generate 50 Trips
export const mockTrips = Array.from({ length: 50 }).map((_, i) => {
  const isCompleted = Math.random() > 0.4;
  return {
    id: `TRP-${100300 + i}`,
    vehicleId: mockVehicles[getRandomInt(0, 19)].id,
    driverId: mockDrivers[getRandomInt(0, 29)].id,
    origin: getRandomItem(['New York, NY', 'Chicago, IL', 'Los Angeles, CA', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'Dallas, TX', 'Miami, FL']),
    destination: getRandomItem(['Detroit, MI', 'Seattle, WA', 'Denver, CO', 'Boston, MA', 'Atlanta, GA', 'San Francisco, CA', 'Las Vegas, NV']),
    distance: getRandomInt(100, 2500),
    status: isCompleted ? TRIP_STATUS.COMPLETED : getRandomItem([TRIP_STATUS.DRAFT, TRIP_STATUS.DISPATCHED, TRIP_STATUS.CANCELLED]),
    startDate: new Date(Date.now() - getRandomInt(1, 15) * 86400000).toISOString(),
    endDate: isCompleted ? new Date(Date.now() - getRandomInt(0, 2) * 86400000).toISOString() : null,
    cost: getRandomInt(500, 5000),
    revenue: getRandomInt(1000, 8000)
  };
});

// Generate Maintenance Logs
export const mockMaintenanceLogs = Array.from({ length: 30 }).map((_, i) => ({
  id: `MNT-${1000 + i}`,
  vehicleId: mockVehicles[getRandomInt(0, 19)].id,
  issue: getRandomItem(['Oil Change', 'Brake Replacement', 'Tire Rotation', 'Engine Diagnostic', 'Transmission Fluid', 'Battery Replacement', 'Suspension Check']),
  description: 'Routine maintenance and inspection as scheduled.',
  cost: getRandomInt(200, 2500),
  status: getRandomItem(Object.values(MAINTENANCE_STATUS)),
  date: new Date(Date.now() - getRandomInt(1, 60) * 86400000).toISOString()
}));

// Generate Fuel Logs
export const mockFuelLogs = Array.from({ length: 100 }).map((_, i) => ({
  id: `FUL-${1000 + i}`,
  vehicleId: mockVehicles[getRandomInt(0, 19)].id,
  liters: getRandomInt(100, 400),
  cost: getRandomInt(200, 800),
  date: new Date(Date.now() - getRandomInt(1, 30) * 86400000).toISOString(),
  station: getRandomItem(['Shell', 'Exxon', 'BP', 'Pilot Flying J', 'Love\'s Travel Stops', 'Chevron'])
}));

// Generate Expenses
export const mockExpenses = Array.from({ length: 150 }).map((_, i) => ({
  id: `EXP-${1000 + i}`,
  category: getRandomItem(Object.values(EXPENSE_CATEGORIES)),
  description: 'Operational expense incurred during operations.',
  amount: getRandomInt(50, 1500),
  date: new Date(Date.now() - getRandomInt(1, 30) * 86400000).toISOString()
}));
