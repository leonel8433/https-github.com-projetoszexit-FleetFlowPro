
import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { VehicleStatus, MaintenanceRecord, Vehicle } from '../types';
import { getRodizioDayLabel } from '../utils/trafficRules';

const FleetManager: React.FC = () => {
  const { vehicles, maintenanceRecords, checklists, addMaintenanceRecord, resolveMaintenance, addVehicle, updateVehicle, deleteVehicle, resetDatabase } = useFleet();
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [newRecord, setNewRecord] = useState({
    vehicleId: '',
    date: new Date().toISOString().split('T')[0],
    serviceType: '',
    cost: '',
    km: '',
    notes: '',
    isTireChange: false,
    tireBrand: '',
    tireModel: ''
  });

  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear().toString(),
    currentKm: '',
    fuelLevel: '100',
    fuelType: 'Diesel' as Vehicle['fuelType']
  });

  const handleResetDatabase = () => {
    const confirm1 = window.confirm("ATENÇÃO: Isso apagará permanentemente todos os registros. Continuar?");
    if (confirm1) {
      const confirm2 = window.confirm("TEM CERTEZA?");
      if (confirm2) resetDatabase();
    }
  };

  const startMaintenanceForVehicle = (vehicle: Vehicle) => {
    setNewRecord({ ...newRecord, vehicleId: vehicle.id, km: vehicle.currentKm.toString(), serviceType: '', notes: '', cost: '' });
    setShowMaintenanceForm(true);
    setShowVehicleForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const costVal = newRecord.cost ? parseFloat(newRecord.cost) : 0;
    const kmVal = parseInt(newRecord.km);
    const record: MaintenanceRecord = {
      id: `maint-${Math.random().toString(36).substr(2, 9)}`,
      vehicleId: newRecord.vehicleId,
      date: newRecord.date,
      serviceType: newRecord.isTireChange ? 'Troca de Pneus' : newRecord.serviceType,
      cost: costVal,
      km: kmVal,
      notes: newRecord.notes
    };
    addMaintenanceRecord(record);
    setShowMaintenanceForm(false);
    alert('Veículo enviado para manutenção com sucesso!');
  };

  const handleSubmitVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicleId) {
      updateVehicle(editingVehicleId, { 
        ...newVehicle, 
        plate: newVehicle.plate.toUpperCase(), 
        year: parseInt(newVehicle.year), 
        currentKm: parseInt(newVehicle.currentKm),
        fuelLevel: parseInt(newVehicle.fuelLevel)
      });
    } else {
      const vehicle: Vehicle = {
        id: Math.random().toString(36).substr(2, 9),
        ...newVehicle,
        plate: newVehicle.plate.toUpperCase(),
        year: parseInt(newVehicle.year),
        currentKm: parseInt(newVehicle.currentKm) || 0,
        fuelLevel: parseInt(newVehicle.fuelLevel) || 100,
        status: VehicleStatus.AVAILABLE
      };
      addVehicle(vehicle);
    }
    setShowVehicleForm(false);
    setEditingVehicleId(null);
    setNewVehicle({ plate: '', brand: '', model: '', year: new Date().getFullYear().toString(), currentKm: '', fuelLevel: '100', fuelType: 'Diesel' });
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setNewVehicle({ plate: vehicle.plate, brand: vehicle.brand, model: vehicle.model, year: vehicle.year.toString(), currentKm: vehicle.currentKm.toString(), fuelLevel: vehicle.fuelLevel.toString(), fuelType: vehicle.fuelType });
    setEditingVehicleId(vehicle.id);
    setShowVehicleForm(true);
    setShowMaintenanceForm(false);
  };

  const filteredVehicles = vehicles.filter(v => (v.plate.includes(searchTerm.toUpperCase()) || v.model.toLowerCase().includes(searchTerm.toLowerCase())) && (statusFilter === 'ALL' || v.status === statusFilter));

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Frota</h2>
          <p className="text-xs text-slate-400 font-write uppercase tracking-widest">Controle de Ativos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowVehicleForm(!showVehicleForm); setShowMaintenanceForm(false); }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-100 uppercase text-[10px] tracking-widest">
            <i className={`fas ${showVehicleForm ? 'fa-times' : 'fa-plus'}`}></i> {showVehicleForm ? 'Cancelar' : 'Novo Veículo'}
          </button>
        </div>
      </div>

      {showVehicleForm && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-xs font-write text-slate-800 uppercase tracking-widest mb-6">{editingVehicleId ? 'Editar Veículo' : 'Ficha do Veículo'}</h3>
          <form onSubmit={handleSubmitVehicle} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-write text-slate-400 uppercase mb-2">Placa</label>
                <input required placeholder="ABC1D23" value={newVehicle.plate} onChange={e => setNewVehicle({...newVehicle, plate: e.target.value.toUpperCase()})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
                {newVehicle.plate.length >= 3 && (
                  <p className="text-[10px] font-bold text-blue-600 mt-2 uppercase tracking-tight">
                    <i className="fas fa-info-circle mr-1"></i> Rodízio SP: <span className="underline">{getRodizioDayLabel(newVehicle.plate)}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-write text-slate-400 uppercase mb-2">Marca</label>
                <input required placeholder="Ex: VW" value={newVehicle.brand} onChange={e => setNewVehicle({...newVehicle, brand: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-write text-slate-400 uppercase mb-2">Modelo</label>
                <input required placeholder="Ex: Delivery" value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-write text-slate-400 uppercase mb-2">Ano</label>
                <input required type="number" placeholder="2024" value={newVehicle.year} onChange={e => setNewVehicle({...newVehicle, year: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-write text-slate-400 uppercase mb-2">KM Inicial</label>
                <input required type="number" placeholder="0" value={newVehicle.currentKm} onChange={e => setNewVehicle({...newVehicle, currentKm: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-write uppercase text-xs tracking-widest shadow-xl shadow-blue-100">Salvar Ativo</button>
            </div>
          </form>
        </div>
      )}

      {showMaintenanceForm && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-write text-slate-800 uppercase tracking-widest">Enviar para Manutenção</h3>
            <button onClick={() => setShowMaintenanceForm(false)} className="text-slate-400 hover:text-red-500"><i className="fas fa-times"></i></button>
          </div>
          <form onSubmit={handleSubmitMaintenance} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-[10px] font-write text-slate-400 uppercase mb-2">Data Entrada</label>
                <input required type="date" value={newRecord.date} onChange={e => setNewRecord({...newRecord, date: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950" />
              </div>
              <div>
                <label className="block text-[10px] font-write text-slate-400 uppercase mb-2">KM na Entrada</label>
                <input required type="number" value={newRecord.km} onChange={e => setNewRecord({...newRecord, km: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-write text-slate-400 uppercase mb-2">Tipo de Serviço</label>
                <input required placeholder="Ex: Troca de óleo, Revisão de freios..." value={newRecord.serviceType} onChange={e => setNewRecord({...newRecord, serviceType: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-write text-slate-950" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-12 py-4 bg-red-600 text-white rounded-2xl font-write uppercase text-xs tracking-widest shadow-xl shadow-red-100">Confirmar Envio</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map(v => (
          <div key={v.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-lg transition-all">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-slate-900 text-white px-3 py-1 rounded-xl font-write tracking-widest text-xs">{v.plate}</span>
                <span className={`text-[9px] font-write px-3 py-1 rounded-full uppercase tracking-widest border ${
                  v.status === VehicleStatus.AVAILABLE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                  v.status === VehicleStatus.MAINTENANCE ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  {v.status === VehicleStatus.AVAILABLE ? 'Livre' : v.status === VehicleStatus.MAINTENANCE ? 'Manutenção' : 'Ocupado'}
                </span>
              </div>
              <h4 className="text-lg font-write text-slate-800 uppercase tracking-tight">{v.model}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">{v.brand} • {v.year}</p>
              
              <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100 mb-4">
                <p className="text-[9px] font-write text-blue-800 uppercase tracking-widest mb-1">Rodízio SP</p>
                <p className="text-xs font-bold text-blue-600">{getRodizioDayLabel(v.plate)}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleEditVehicle(v)} className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-write uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100">
                  <i className="fas fa-edit mr-1"></i> Editar
                </button>
                {v.status === VehicleStatus.AVAILABLE && (
                  <button onClick={() => startMaintenanceForVehicle(v)} className="flex-1 py-3 bg-slate-50 text-red-500 rounded-xl text-[10px] font-write uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all border border-slate-100">
                    <i className="fas fa-wrench mr-1"></i> Oficina
                  </button>
                )}
                <button onClick={() => deleteVehicle(v.id)} className="w-10 h-10 bg-red-50 text-red-300 rounded-xl flex items-center justify-center hover:text-red-600 transition-all border border-red-50">
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-10 border-t border-slate-200">
        <button onClick={handleResetDatabase} className="text-[10px] font-write text-red-300 uppercase tracking-[0.2em] hover:text-red-600 transition-all">
          <i className="fas fa-radiation-alt mr-2"></i> Limpar Dados do Sistema
        </button>
      </div>
    </div>
  );
};

export default FleetManager;
