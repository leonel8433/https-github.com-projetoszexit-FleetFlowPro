
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Vehicle, Driver, Trip, Checklist, VehicleStatus, MaintenanceRecord, Fine, Occurrence, ScheduledTrip, Notification } from '../types';

interface FleetContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  activeTrips: Trip[];
  completedTrips: Trip[];
  scheduledTrips: ScheduledTrip[];
  maintenanceRecords: MaintenanceRecord[];
  fines: Fine[];
  occurrences: Occurrence[];
  // Fix: Added checklists and notifications missing from original context type
  checklists: Checklist[];
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  addVehicle: (v: Vehicle) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addDriver: (d: Driver) => void;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  startTrip: (trip: Trip, checklist: Checklist) => void;
  endTrip: (tripId: string, currentKm: number, endTime: string, expenses?: any) => void;
  cancelTrip: (tripId: string) => void;
  addMaintenanceRecord: (record: MaintenanceRecord) => void;
  resolveMaintenance: (vId: string, rId: string | null, km: number, date: string, cost?: number) => void;
  addFine: (fine: Fine) => void;
  deleteFine: (id: string) => void;
  addOccurrence: (occ: Occurrence) => void;
  currentUser: Driver | null;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  changePassword: (newPass: string) => void;
  resetDatabase: () => void;
  addScheduledTrip: (trip: ScheduledTrip) => void;
  updateScheduledTrip: (id: string, updates: Partial<ScheduledTrip>) => void;
  deleteScheduledTrip: (id: string) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => JSON.parse(localStorage.getItem('f_vehicles') || '[]'));
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('f_drivers');
    return saved ? JSON.parse(saved) : [{ id: 'admin', name: 'Gestor Master', license: '000', username: 'admin', password: 'admin', passwordChanged: true }];
  });
  const [activeTrips, setActiveTrips] = useState<Trip[]>(() => JSON.parse(localStorage.getItem('f_active_trips') || '[]'));
  const [completedTrips, setCompletedTrips] = useState<Trip[]>(() => JSON.parse(localStorage.getItem('f_completed_trips') || '[]'));
  const [scheduledTrips, setScheduledTrips] = useState<ScheduledTrip[]>(() => JSON.parse(localStorage.getItem('f_scheduled') || '[]'));
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => JSON.parse(localStorage.getItem('f_maint') || '[]'));
  const [fines, setFines] = useState<Fine[]>(() => JSON.parse(localStorage.getItem('f_fines') || '[]'));
  const [occurrences, setOccurrences] = useState<Occurrence[]>(() => JSON.parse(localStorage.getItem('f_occ') || '[]'));
  const [currentUser, setCurrentUser] = useState<Driver | null>(() => JSON.parse(sessionStorage.getItem('f_user') || 'null'));
  
  // Fix: Adding state for checklists and notifications to fulfill requirement
  const [checklists, setChecklists] = useState<Checklist[]>(() => JSON.parse(localStorage.getItem('f_checklists') || '[]'));
  const [notifications, setNotifications] = useState<Notification[]>(() => JSON.parse(localStorage.getItem('f_notifications') || '[]'));

  useEffect(() => {
    localStorage.setItem('f_vehicles', JSON.stringify(vehicles));
    localStorage.setItem('f_drivers', JSON.stringify(drivers));
    localStorage.setItem('f_active_trips', JSON.stringify(activeTrips));
    localStorage.setItem('f_completed_trips', JSON.stringify(completedTrips));
    localStorage.setItem('f_scheduled', JSON.stringify(scheduledTrips));
    localStorage.setItem('f_maint', JSON.stringify(maintenanceRecords));
    localStorage.setItem('f_fines', JSON.stringify(fines));
    localStorage.setItem('f_occ', JSON.stringify(occurrences));
    // Fix: Persisting newly added states
    localStorage.setItem('f_checklists', JSON.stringify(checklists));
    localStorage.setItem('f_notifications', JSON.stringify(notifications));
  }, [vehicles, drivers, activeTrips, completedTrips, scheduledTrips, maintenanceRecords, fines, occurrences, checklists, notifications]);

  const login = (user: string, pass: string) => {
    const d = drivers.find(x => x.username === user && x.password === pass);
    if (d) {
      setCurrentUser(d);
      sessionStorage.setItem('f_user', JSON.stringify(d));
      return true;
    }
    return false;
  };

  const logout = () => { setCurrentUser(null); sessionStorage.removeItem('f_user'); };

  const changePassword = (newPass: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, password: newPass, passwordChanged: true };
    setDrivers(prev => prev.map(d => d.id === currentUser.id ? updated : d));
    setCurrentUser(updated);
    sessionStorage.setItem('f_user', JSON.stringify(updated));
  };

  // Fix: Implementation of markNotificationAsRead
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const addVehicle = (v: Vehicle) => setVehicles(p => [...p, v]);
  const updateVehicle = (id: string, up: Partial<Vehicle>) => setVehicles(p => p.map(v => v.id === id ? { ...v, ...up } : v));
  const deleteVehicle = (id: string) => setVehicles(p => p.filter(v => v.id !== id));

  const addDriver = (d: Driver) => setDrivers(p => [...p, d]);
  const updateDriver = (id: string, up: Partial<Driver>) => setDrivers(p => p.map(d => d.id === id ? { ...d, ...up } : d));
  const deleteDriver = (id: string) => setDrivers(p => p.filter(d => d.id !== id));

  const startTrip = (trip: Trip, checklist: Checklist) => {
    setActiveTrips(p => [...p, trip]);
    // Fix: Save checklist to global state
    setChecklists(p => [checklist, ...p]);
    updateVehicle(trip.vehicleId, { status: VehicleStatus.IN_USE, currentKm: checklist.km, lastChecklist: checklist });
  };

  const endTrip = (id: string, km: number, end: string, exp: any) => {
    const trip = activeTrips.find(t => t.id === id);
    if (!trip) return;
    const finished = { ...trip, endTime: end, distance: km - trip.startKm, ...exp };
    setActiveTrips(p => p.filter(t => t.id !== id));
    setCompletedTrips(p => [finished, ...p]);
    updateVehicle(trip.vehicleId, { status: VehicleStatus.AVAILABLE, currentKm: km });
  };

  const cancelTrip = (id: string) => {
    const trip = activeTrips.find(t => t.id === id);
    if (trip) updateVehicle(trip.vehicleId, { status: VehicleStatus.AVAILABLE });
    setActiveTrips(p => p.filter(t => t.id !== id));
  };

  const addMaintenanceRecord = (r: MaintenanceRecord) => {
    setMaintenanceRecords(p => [r, ...p]);
    updateVehicle(r.vehicleId, { status: VehicleStatus.MAINTENANCE });
  };

  const resolveMaintenance = (vId: string, rId: string | null, km: number, date: string, cost?: number) => {
    updateVehicle(vId, { status: VehicleStatus.AVAILABLE, currentKm: km });
    setMaintenanceRecords(prev => prev.map(m => (m.vehicleId === vId && !m.returnDate) ? { ...m, returnDate: date, cost: cost ?? m.cost } : m));
  };

  const addFine = (f: Fine) => setFines(p => [f, ...p]);
  const deleteFine = (id: string) => setFines(p => p.filter(f => f.id !== id));
  
  const addOccurrence = (o: Occurrence) => {
    setOccurrences(p => [o, ...p]);
    // Fix: Automatically create a notification when a new occurrence is reported
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Nova Ocorrência',
      message: `${o.type}: ${o.description}`,
      type: 'occurrence',
      isRead: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(p => [newNotif, ...p]);
  };

  const addScheduledTrip = (t: ScheduledTrip) => setScheduledTrips(p => [t, ...p]);
  const updateScheduledTrip = (id: string, up: Partial<ScheduledTrip>) => setScheduledTrips(p => p.map(t => t.id === id ? { ...t, ...up } : t));
  const deleteScheduledTrip = (id: string) => setScheduledTrips(p => p.filter(t => t.id !== id));
  const updateTrip = (id: string, up: Partial<Trip>) => setActiveTrips(p => p.map(t => t.id === id ? { ...t, ...up } : t));

  const resetDatabase = () => { localStorage.clear(); sessionStorage.clear(); window.location.reload(); };

  return (
    <FleetContext.Provider value={{
      vehicles, drivers, activeTrips, completedTrips, scheduledTrips, maintenanceRecords, fines, occurrences,
      // Fix: Exposing checklists, notifications and marking fn
      checklists, notifications, markNotificationAsRead,
      addVehicle, updateVehicle, deleteVehicle, addDriver, updateDriver, deleteDriver, startTrip, endTrip, cancelTrip, addMaintenanceRecord, resolveMaintenance, addFine, deleteFine, addOccurrence,
      currentUser, login, logout, changePassword, resetDatabase, addScheduledTrip, updateScheduledTrip, deleteScheduledTrip, updateTrip
    }}>
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const c = useContext(FleetContext);
  if (!c) throw new Error('useFleet error');
  return c;
};
