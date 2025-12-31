
import React, { useState, useMemo } from 'react';
import { useFleet } from '../context/FleetContext';
import { ScheduledTrip, Vehicle } from '../types';
import { checkSPRodizio, getRodizioDayLabel } from '../utils/trafficRules';

const SchedulingPage: React.FC = () => {
  const { drivers, vehicles, scheduledTrips, addScheduledTrip, updateScheduledTrip, deleteScheduledTrip, currentUser } = useFleet();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newSchedule, setNewSchedule] = useState({
    driverId: '',
    vehicleId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    origin: '',
    destination: '',
    waypoints: [] as string[],
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  });

  const isAdmin = currentUser?.username === 'admin';
  const selectedVehicle = vehicles.find(v => v.id === newSchedule.vehicleId);
  
  const isRestricted = useMemo(() => {
    if (!selectedVehicle || !newSchedule.scheduledDate) return false;
    const [year, month, day] = newSchedule.scheduledDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return checkSPRodizio(selectedVehicle.plate, dateObj);
  }, [selectedVehicle, newSchedule.scheduledDate]);

  const isSPDestination = useMemo(() => {
    if (!newSchedule.city) return false;
    const cityClean = newSchedule.city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return cityClean.includes('sao paulo');
  }, [newSchedule.city]);

  const blockSubmission = isRestricted && isSPDestination;

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (blockSubmission) {
      alert('Operação Bloqueada: Veículo em rodízio em São Paulo na data selecionada!');
      return;
    }

    if (editingId) {
      updateScheduledTrip(editingId, newSchedule);
      setEditingId(null);
    } else {
      addScheduledTrip({
        id: Math.random().toString(36).substr(2, 9),
        ...newSchedule
      });
    }
    setShowForm(false);
    setNewSchedule({ driverId: '', vehicleId: '', scheduledDate: new Date().toISOString().split('T')[0], origin: '', destination: '', waypoints: [], city: '', state: '', zipCode: '', notes: '' });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Agenda</h2>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-100 uppercase text-[10px] tracking-widest">
            <i className={`fas ${showForm ? 'fa-times' : 'fa-calendar-plus'}`}></i> {showForm ? 'Cancelar' : 'Nova Viagem'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <form onSubmit={handleAddSchedule} className="space-y-6">
            {blockSubmission && (
              <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-center gap-4 animate-shake">
                <i className="fas fa-ban text-red-600 text-2xl"></i>
                <div>
                  <h4 className="text-[10px] font-write text-red-800 uppercase tracking-widest">Acesso Negado à Capital</h4>
                  <p className="text-xs text-red-600 font-bold leading-tight mt-1">Este veículo ({selectedVehicle?.plate}) não pode circular em São Paulo nesta data ({getRodizioDayLabel(selectedVehicle?.plate || '')}).</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-write text-slate-400 uppercase mb-2">Motorista</label>
                <select required value={newSchedule.driverId} onChange={e => setNewSchedule({...newSchedule, driverId: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950 outline-none">
                  <option value="">Selecione...</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-write text-slate-400 uppercase mb-2">Veículo</label>
                <select required value={newSchedule.vehicleId} onChange={e => setNewSchedule({...newSchedule, vehicleId: e.target.value})} className={`w-full p-4 bg-slate-50 border rounded-2xl font-write text-slate-950 outline-none ${isRestricted ? 'border-amber-400 ring-2 ring-amber-50' : 'border-slate-200'}`}>
                  <option value="">Selecione...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-write text-slate-400 uppercase mb-2">Data</label>
                <input type="date" required value={newSchedule.scheduledDate} onChange={e => setNewSchedule({...newSchedule, scheduledDate: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input placeholder="Origem" value={newSchedule.origin} onChange={e => setNewSchedule({...newSchedule, origin: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950 outline-none" />
              <input placeholder="Destino" required value={newSchedule.destination} onChange={e => setNewSchedule({...newSchedule, destination: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950 outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input 
                placeholder="Cidade (Ex: São Paulo)" 
                required 
                value={newSchedule.city} 
                onChange={e => setNewSchedule({...newSchedule, city: e.target.value})} 
                className={`w-full p-4 bg-slate-50 border rounded-2xl font-write text-slate-950 outline-none ${isSPDestination && isRestricted ? 'border-red-500 bg-red-50' : 'border-slate-200'}`} 
              />
              <input placeholder="UF" maxLength={2} value={newSchedule.state} onChange={e => setNewSchedule({...newSchedule, state: e.target.value.toUpperCase()})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950 text-center outline-none" />
              <input placeholder="CEP" value={newSchedule.zipCode} onChange={e => setNewSchedule({...newSchedule, zipCode: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950 outline-none" />
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={blockSubmission}
                className={`px-12 py-4 rounded-2xl font-write uppercase text-xs tracking-widest shadow-xl transition-all ${blockSubmission ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'}`}
              >
                {blockSubmission ? 'Bloqueado p/ São Paulo' : 'Confirmar Agendamento'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {scheduledTrips.map(trip => {
          const v = vehicles.find(x => x.id === trip.vehicleId);
          const d = drivers.find(x => x.id === trip.driverId);
          const tripDate = new Date(trip.scheduledDate + 'T00:00:00');
          const isRestrictedToday = v && checkSPRodizio(v.plate, tripDate);
          
          return (
            <div key={trip.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center font-write ${isRestrictedToday ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>
                  <span className="text-lg">{tripDate.getDate()}</span>
                  <span className="text-[8px] uppercase">{tripDate.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{trip.destination}</h4>
                  <p className="text-[10px] text-slate-400 font-write uppercase">{d?.name} • <span className={isRestrictedToday ? 'text-amber-600' : ''}>{v?.plate}</span></p>
                </div>
              </div>
              <div className="flex gap-2">
                {isRestrictedToday && <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-[9px] font-write uppercase flex items-center gap-2"><i className="fas fa-exclamation-triangle"></i> Rodízio</div>}
                <button onClick={() => deleteScheduledTrip(trip.id)} className="w-10 h-10 bg-red-50 text-red-300 rounded-xl hover:text-red-600 flex items-center justify-center transition-all"><i className="fas fa-trash-alt"></i></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SchedulingPage;
