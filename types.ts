
export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE'
}

export enum OccurrenceSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
  currentKm: number;
  fuelLevel: number;
  fuelType: 'Diesel' | 'Gasolina' | 'Flex' | 'Elétrico' | 'GNV';
  status: VehicleStatus;
  lastChecklist?: Checklist;
}

export interface Driver {
  id: string;
  name: string;
  license: string;
  username: string;
  password?: string;
  passwordChanged?: boolean;
  avatar?: string;
  activeVehicleId?: string;
}

export interface Checklist {
  id: string;
  vehicleId: string;
  driverId: string;
  timestamp: string;
  km: number;
  fuelLevel: number;
  oilChecked: boolean;
  waterChecked: boolean;
  tiresChecked: boolean;
  comments: string;
}

export interface Trip {
  id: string;
  driverId: string;
  vehicleId: string;
  origin: string;
  destination: string;
  waypoints?: string[];
  city?: string;
  state?: string;
  startTime: string;
  endTime?: string;
  startKm: number;
  distance?: number;
  fuelExpense?: number;
  otherExpense?: number;
  expenseNotes?: string;
  // Fix: Adding plannedArrival to Trip interface as it is used in Dashboard and Monitoring
  plannedArrival?: string;
}

export interface ScheduledTrip extends Omit<Trip, 'startTime' | 'startKm'> {
  scheduledDate: string;
  notes?: string;
  // Fix: Adding zipCode to ScheduledTrip interface used in SchedulingPage
  zipCode?: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  date: string;
  returnDate?: string;
  serviceType: string;
  cost: number;
  km: number;
  notes: string;
}

export interface Fine {
  id: string;
  driverId: string;
  vehicleId: string;
  date: string;
  value: number;
  points: number;
  description: string;
}

export interface Occurrence {
  id: string;
  tripId: string;
  vehicleId: string;
  driverId: string;
  type: string;
  description: string;
  severity: OccurrenceSeverity;
  timestamp: string;
  resolved: boolean;
}

// Fix: Adding Notification interface for the layout and dashboard alerts
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'occurrence' | 'info' | 'system';
  isRead: boolean;
  timestamp: string;
}
