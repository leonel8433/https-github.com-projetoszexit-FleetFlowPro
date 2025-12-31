
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFleet } from '../context/FleetContext';
import { Vehicle, Checklist, Trip, VehicleStatus } from '../types';
import { checkSPRodizio, getRodizioDayLabel } from '../utils/trafficRules';

interface OperationWizardProps {
  scheduledTripId?: string;
  onComplete?: () => void;
}

const OperationWizard: React.FC<OperationWizardProps> = ({ scheduledTripId, onComplete }) => {
  const { vehicles, currentUser, startTrip, scheduledTrips } = useFleet();
  const [step, setStep] = useState(1);
  const [selectedV, setSelectedV] = useState<Vehicle | null>(null);
  const [checklist, setChecklist] = useState<Partial<Checklist>>({ km: 0, fuelLevel: 50, oilChecked: false, waterChecked: false, tiresChecked: false });
  const [route, setRoute] = useState({ 
    origin: '', 
    destination: '', 
    city: '', 
    state: '',
    date: new Date().toISOString().split('T')[0]
  });

  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedV) setChecklist(p => ({ ...p, km: selectedV.currentKm }));
  }, [selectedV]);

  useEffect(() => {
    if (scheduledTripId) {
      const trip = scheduledTrips.find(t => t.id === scheduledTripId);
      if (trip) {
        setRoute({
          origin: trip.origin || '',
          destination: trip.destination,
          city: trip.city || '',
          state: trip.state || '',
          date: trip.scheduledDate || new Date().toISOString().split('T')[0]
        });
        const vehicle = vehicles.find(v => v.id === trip.vehicleId);
        if (vehicle && vehicle.status === VehicleStatus.AVAILABLE) {
          setSelectedV(vehicle);
        }
      }
    }
  }, [scheduledTripId, scheduledTrips, vehicles]);

  const isRestrictedOnDate = useMemo(() => {
    if (!selectedV || !route.date) return false;
    const [year, month, day] = route.date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return checkSPRodizio(selectedV.plate, dateObj);
  }, [selectedV, route.date]);

  const isSPDestination = useMemo(() => {
    if (!route.city) return false;
    const cityClean = route.city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return cityClean.includes('sao paulo');
  }, [route.city]);

  const blockOperation = isRestrictedOnDate && isSPDestination;

  const handleStart = () => {
    if (!selectedV || !currentUser) return;
    if (blockOperation) {
      alert(`Operação Bloqueada: O veículo ${selectedV.plate} está no rodízio em São Paulo (${getRodizioDayLabel(selectedV.plate)}).`);
      return;
    }

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
      startKm: checklist.km || selectedV.currentKm,
      waypoints: []
    };
    const check: Checklist = { 
      id: trip.id, 
      vehicleId: selectedV.id, 
      driverId: currentUser.id, 
      timestamp: now,
      km: checklist.km || selectedV.currentKm,
      fuelLevel: checklist.fuelLevel || 100,
      oilChecked: !!checklist.oilChecked,
      waterChecked: !!checklist.waterChecked,
      tiresChecked: !!checklist.tiresChecked,
      comments: ''
    };
    
    startTrip(trip, check);
    alert('Jornada Iniciada com sucesso!');
    
    if (onComplete) onComplete();
    
    // Reset local para evitar tela em branco ou inconsistência sem precisar de reload
    setStep(1);
    setSelectedV(null);
    setChecklist({ km: 0, fuelLevel: 50, oilChecked: false, waterChecked: false, tiresChecked: false });
  };

  const handleOpenDatePicker = () => {
    if (dateInputRef.current) {
      try {
        // @ts-ignore
        dateInputRef.current.showPicker();
      } catch (e) {
        dateInputRef.current.focus();
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between px-10">
        {[1, 2, 3].map(s => (
          <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${step >= s ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-300'}`}>{s}</div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Selecione o Veículo</h3>
            <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {vehicles.filter(v => v.status === VehicleStatus.AVAILABLE).map(v => (
                <button key={v.id} onClick={() => setSelectedV(v)} className={`p-5 rounded-2xl border-2 text-left transition-all ${selectedV?.id === v.id ? 'border-blue-600 bg-blue-50' : 'border-slate-50 bg-slate-50/50'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-write text-slate-800 uppercase tracking-widest">{v.plate}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase">{v.model}</p>
                    </div>
                    {selectedV?.id === v.id && <i className="fas fa-check-circle text-blue-600 text-xl"></i>}
                  </div>
                </button>
              ))}
              {vehicles.filter(v => v.status === VehicleStatus.AVAILABLE).length === 0 && (
                <div className="text-center py-10 text-slate-300 italic text-sm">Nenhum veículo disponível no momento.</div>
              )}
            </div>
            <button disabled={!selectedV} onClick={() => setStep(2)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs disabled:opacity-50 transition-all">Continuar</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Checklist de Saída</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-write text-slate-400 uppercase mb-2 ml-1">KM Atual do Veículo</label>
                <input type="number" placeholder="KM Atual" value={checklist.km} onChange={e => setChecklist({...checklist, km: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-2xl text-center outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'oilChecked', label: 'Óleo', icon: 'fa-oil-can' },
                  { key: 'waterChecked', label: 'Água', icon: 'fa-faucet-drip' },
                  { key: 'tiresChecked', label: 'Pneus', icon: 'fa-circle-notch' }
                ].map(item => (
                  <button key={item.key} onClick={() => setChecklist({...checklist, [item.key]: !checklist[item.key as keyof Checklist]})} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${checklist[item.key as keyof Checklist] ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                    <i className={`fas ${item.icon}`}></i>
                    <span className="text-[9px] font-write uppercase">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-2xl font-bold uppercase tracking-widest text-xs">Voltar</button>
              <button onClick={() => setStep(3)} className="flex-[2] py-5 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs">Próximo: Rota</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Definir Rota</h3>
            
            {blockOperation && (
              <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-center gap-4 animate-shake">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-xl shrink-0"><i className="fas fa-ban"></i></div>
                <div className="flex-1">
                  <h4 className="text-[10px] font-write text-red-800 uppercase tracking-widest">Acesso Negado (Rodízio)</h4>
                  <p className="text-xs text-red-600 font-bold leading-tight mt-1">Este veículo ({selectedV?.plate}) está restrito em São Paulo na data {new Date(route.date + 'T00:00:00').toLocaleDateString()}.</p>
                </div>
              </div>
            )}

            {!blockOperation && isRestrictedOnDate && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-4">
                <i className="fas fa-exclamation-triangle text-amber-500"></i>
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tight leading-tight">Aviso: Rodízio Ativo no dia selecionado. Evite o centro de SP nos horários de pico.</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative" onClick={handleOpenDatePicker}>
                <label className="block text-[10px] font-write text-slate-400 uppercase mb-2 ml-1">Data da Viagem</label>
                <div className="relative">
                  <i className="fas fa-calendar-alt absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input ref={dateInputRef} type="date" value={route.date} onChange={e => setRoute({...route, date: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <input placeholder="Origem" value={route.origin} onChange={e => setRoute({...route, origin: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950 outline-none" />
              <input placeholder="Destino" value={route.destination} onChange={e => setRoute({...route, destination: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950 outline-none" />
              
              <div className="grid grid-cols-2 gap-3">
                <input 
                  placeholder="Cidade (Ex: São Paulo)" 
                  value={route.city} 
                  onChange={e => setRoute({...route, city: e.target.value})} 
                  className={`p-4 bg-slate-50 border rounded-2xl font-write text-slate-950 outline-none ${isSPDestination && isRestrictedOnDate ? 'bg-red-50 border-red-500' : 'border-slate-200'}`} 
                />
                <input placeholder="UF" maxLength={2} value={route.state} onChange={e => setRoute({...route, state: e.target.value.toUpperCase()})} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950 text-center outline-none" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-2xl font-bold uppercase tracking-widest text-xs">Voltar</button>
              <button onClick={handleStart} disabled={blockOperation || !route.destination} className={`flex-[2] py-5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all ${blockOperation ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white shadow-xl shadow-emerald-100 hover:bg-emerald-700'}`}>
                {blockOperation ? 'Bloqueado p/ Rodízio SP' : 'Iniciar Jornada'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationWizard;
