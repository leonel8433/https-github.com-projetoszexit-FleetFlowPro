
import React, { useState, useEffect } from 'react';
import { useFleet } from '../context/FleetContext';
import { Vehicle, Checklist, Trip, VehicleStatus } from '../types';

// Fix: Defining OperationWizardProps to accept scheduledTripId and onComplete callback
interface OperationWizardProps {
  scheduledTripId?: string;
  onComplete?: () => void;
}

const OperationWizard: React.FC<OperationWizardProps> = ({ scheduledTripId, onComplete }) => {
  const { vehicles, currentUser, startTrip, scheduledTrips } = useFleet();
  const [step, setStep] = useState(1);
  const [selectedV, setSelectedV] = useState<Vehicle | null>(null);
  const [checklist, setChecklist] = useState<Partial<Checklist>>({ km: 0, fuelLevel: 50, oilChecked: false, waterChecked: false, tiresChecked: false });
  const [route, setRoute] = useState({ origin: '', destination: '', city: '', state: '' });

  useEffect(() => {
    if (selectedV) setChecklist(p => ({ ...p, km: selectedV.currentKm }));
  }, [selectedV]);

  // Fix: Pre-fill data if a scheduledTripId is provided (e.g. from Dashboard or Scheduling)
  useEffect(() => {
    if (scheduledTripId) {
      const trip = scheduledTrips.find(t => t.id === scheduledTripId);
      if (trip) {
        setRoute({
          origin: trip.origin || '',
          destination: trip.destination,
          city: trip.city || '',
          state: trip.state || ''
        });
        const vehicle = vehicles.find(v => v.id === trip.vehicleId);
        if (vehicle && vehicle.status === VehicleStatus.AVAILABLE) {
          setSelectedV(vehicle);
        }
      }
    }
  }, [scheduledTripId, scheduledTrips, vehicles]);

  const handleStart = () => {
    if (!selectedV || !currentUser) return;
    const now = new Date().toISOString();
    const trip: Trip = {
      id: Math.random().toString(36).substr(2, 9),
      driverId: currentUser.id,
      vehicleId: selectedV.id,
      origin: route.origin,
      destination: route.destination,
      city: route.city,
      state: route.state,
      startTime: now,
      startKm: checklist.km || selectedV.currentKm
    };
    const check: Checklist = { ...checklist as Checklist, id: trip.id, vehicleId: selectedV.id, driverId: currentUser.id, timestamp: now };
    startTrip(trip, check);
    
    // Fix: Invoke completion callback if exists
    if (onComplete) onComplete();
    
    alert('Jornada Iniciada!');
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex justify-between px-10">
        {[1, 2, 3].map(s => (
          <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>{s}</div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Qual veículo você está assumindo?</h3>
            <div className="grid grid-cols-1 gap-3">
              {vehicles.filter(v => v.status === VehicleStatus.AVAILABLE).map(v => (
                <button key={v.id} onClick={() => setSelectedV(v)} className={`p-4 rounded-xl border-2 text-left transition-all ${selectedV?.id === v.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                  <p className="font-bold">{v.plate} - {v.model}</p>
                </button>
              ))}
            </div>
            <button disabled={!selectedV} onClick={() => setStep(2)} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold">Próximo</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Checklist de Saída</h3>
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase">Quilometragem Atual</label>
              <input type="number" value={checklist.km} onChange={e => setChecklist({...checklist, km: parseInt(e.target.value)})} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-write" />
              <div className="grid grid-cols-3 gap-3">
                {['oilChecked', 'waterChecked', 'tiresChecked'].map(k => (
                  <button key={k} onClick={() => setChecklist({...checklist, [k]: !checklist[k as keyof Checklist]})} className={`p-4 rounded-xl border-2 font-bold text-xs uppercase ${checklist[k as keyof Checklist] ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                    {k.replace('Checked', '')}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(3)} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold">Próximo</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Definir Rota</h3>
            <div className="space-y-4">
              <input placeholder="Origem" value={route.origin} onChange={e => setRoute({...route, origin: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-write" />
              <input placeholder="Destino" value={route.destination} onChange={e => setRoute({...route, destination: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-write" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Cidade" value={route.city} onChange={e => setRoute({...route, city: e.target.value})} className="p-4 bg-white border border-slate-200 rounded-xl font-write" />
                <input placeholder="UF" maxLength={2} value={route.state} onChange={e => setRoute({...route, state: e.target.value.toUpperCase()})} className="p-4 bg-white border border-slate-200 rounded-xl font-write" />
              </div>
            </div>
            <button onClick={handleStart} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold">Confirmar e Iniciar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationWizard;
