
import React, { useState, useRef } from 'react';
import { useFleet } from '../context/FleetContext';
import { Fine, Driver } from '../types';

const DriverManagement: React.FC = () => {
  const { drivers, vehicles, fines, addFine, addDriver, updateDriver, deleteDriver, deleteFine } = useFleet();
  const [showFineForm, setShowFineForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);

  const [newFine, setNewFine] = useState({
    driverId: '',
    vehicleId: '',
    date: new Date().toISOString().split('T')[0],
    value: '',
    points: '',
    description: ''
  });

  const [newDriver, setNewDriver] = useState({
    name: '',
    license: '',
    username: '',
    password: '',
    avatar: ''
  });

  const handleFineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFine.driverId || !newFine.vehicleId || !newFine.value) return;

    const fine: Fine = {
      id: Math.random().toString(36).substr(2, 9),
      driverId: newFine.driverId,
      vehicleId: newFine.vehicleId,
      date: newFine.date,
      value: parseFloat(newFine.value),
      points: parseInt(newFine.points) || 0,
      description: newFine.description
    };

    addFine(fine);
    setNewFine({
      driverId: '',
      vehicleId: '',
      date: new Date().toISOString().split('T')[0],
      value: '',
      points: '',
      description: ''
    });
    setShowFineForm(false);
    alert('Multa registrada com sucesso!');
  };

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.license || !newDriver.username) return;

    if (editingDriverId) {
      updateDriver(editingDriverId, {
        name: newDriver.name,
        license: newDriver.license,
        username: newDriver.username,
        avatar: newDriver.avatar,
        // Only update password if provided
        ...(newDriver.password ? { password: newDriver.password } : {})
      });
      alert('Cadastro do motorista atualizado com sucesso!');
    } else {
      const driver: Driver = {
        id: Math.random().toString(36).substr(2, 9),
        name: newDriver.name,
        license: newDriver.license,
        username: newDriver.username,
        password: newDriver.password || '123',
        avatar: newDriver.avatar,
        passwordChanged: false
      };
      addDriver(driver);
      alert('Motorista cadastrado com sucesso!');
    }

    setNewDriver({ name: '', license: '', username: '', password: '', avatar: '' });
    setShowDriverForm(false);
    setEditingDriverId(null);
  };

  const handleEditDriver = (driver: Driver) => {
    setNewDriver({
      name: driver.name,
      license: driver.license,
      username: driver.username,
      password: '', // Password is not populated for security
      avatar: driver.avatar || ''
    });
    setEditingDriverId(driver.id);
    setShowDriverForm(true);
    setShowFineForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDriver = (id: string, name: string) => {
    if (id === 'admin') {
      alert('O administrador mestre não pode ser removido.');
      return;
    }
    if (window.confirm(`Tem certeza que deseja remover o motorista ${name}? Todos os registros de multas permanecerão associados ao histórico.`)) {
      deleteDriver(id);
      alert('Motorista removido com sucesso.');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDriver(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Gestão de Motoristas</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => {
              setShowFineForm(!showFineForm);
              setShowDriverForm(false);
              setEditingDriverId(null);
            }}
            className="bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-slate-700 flex items-center gap-2 transition-all"
          >
            <i className={`fas ${showFineForm ? 'fa-times' : 'fa-gavel'}`}></i>
            {showFineForm ? 'Cancelar' : 'Registrar Multa'}
          </button>
          <button 
            onClick={() => {
              setShowDriverForm(!showDriverForm);
              setShowFineForm(false);
              if (!showDriverForm) {
                setNewDriver({ name: '', license: '', username: '', password: '', avatar: '' });
                setEditingDriverId(null);
              }
            }}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-100 transition-all"
          >
            <i className={`fas ${showDriverForm ? 'fa-times' : 'fa-user-plus'}`}></i>
            {showDriverForm ? 'Cancelar' : (editingDriverId ? 'Cancelar Edição' : 'Novo Motorista')}
          </button>
        </div>
      </div>

      {showDriverForm && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-write text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fas fa-id-card text-blue-400"></i>
            {editingDriverId ? 'Editar Perfil do Motorista' : 'Cadastro de Novo Motorista'}
          </h3>
          <form onSubmit={handleDriverSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center gap-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-40 h-40 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden group shadow-inner"
                >
                  {newDriver.avatar ? (
                    <img src={newDriver.avatar} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <i className="fas fa-camera text-slate-300 text-3xl group-hover:text-blue-500 transition-colors"></i>
                      <span className="text-[10px] font-write text-slate-400 mt-2 uppercase tracking-widest">Upload Foto</span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-write text-slate-400 uppercase mb-2 ml-1">Nome Completo</label>
                  <input
                    required
                    type="text"
                    placeholder="Nome do motorista"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-950 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-write text-slate-400 uppercase mb-2 ml-1">Número da CNH</label>
                  <input
                    required
                    type="text"
                    placeholder="00000000000"
                    value={newDriver.license}
                    onChange={(e) => setNewDriver({ ...newDriver, license: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-950 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-write text-slate-400 uppercase mb-2 ml-1">Username de Acesso</label>
                  <input
                    required
                    type="text"
                    placeholder="usuario.acesso"
                    value={newDriver.username}
                    onChange={(e) => setNewDriver({ ...newDriver, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-950 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-write text-slate-400 uppercase mb-2 ml-1">{editingDriverId ? 'Nova Senha (Opcional)' : 'Senha Inicial'}</label>
                  <input
                    type="password"
                    placeholder={editingDriverId ? "Deixe em branco para manter" : "••••••••"}
                    value={newDriver.password}
                    onChange={(e) => setNewDriver({ ...newDriver, password: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-950 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="w-full md:w-auto bg-blue-600 text-white px-12 py-4 rounded-2xl font-write uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                {editingDriverId ? 'Salvar Alterações do Perfil' : 'Efetivar Cadastro'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showFineForm && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-write text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fas fa-gavel text-red-400"></i>
            Registrar Auto de Infração
          </h3>
          <form onSubmit={handleFineSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-[10px] font-write text-slate-400 uppercase mb-2">Motorista</label>
              <select
                required
                value={newFine.driverId}
                onChange={(e) => setNewFine({ ...newFine, driverId: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-bold text-slate-950"
              >
                <option value="">Selecione o condutor...</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-write text-slate-400 uppercase mb-2">Veículo</label>
              <select
                required
                value={newFine.vehicleId}
                onChange={(e) => setNewFine({ ...newFine, vehicleId: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-bold text-slate-950"
              >
                <option value="">Selecione o veículo...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-write text-slate-400 uppercase mb-2">Data da Infração</label>
              <input
                required
                type="date"
                value={newFine.date}
                onChange={(e) => setNewFine({ ...newFine, date: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-bold text-slate-950"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-write text-slate-400 uppercase mb-2">Valor (R$)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newFine.value}
                  onChange={(e) => setNewFine({ ...newFine, value: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-bold text-slate-950"
                />
              </div>
              <div>
                <label className="block text-[10px] font-write text-slate-400 uppercase mb-2">Pontos</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newFine.points}
                  onChange={(e) => setNewFine({ ...newFine, points: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-bold text-slate-950"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="block text-[10px] font-write text-slate-400 uppercase mb-2">Descrição da Infração</label>
              <textarea
                placeholder="Ex: Excesso de velocidade..."
                value={newFine.description}
                onChange={(e) => setNewFine({ ...newFine, description: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-bold text-slate-950 h-20 resize-none"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-xl font-write uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-100">
                Salvar Infração
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Driver List */}
        <div className="space-y-4">
          <h3 className="text-sm font-write text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
            <i className="fas fa-users text-blue-500"></i> Condutores Ativos
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {drivers.map(driver => {
              const driverFines = fines.filter(f => f.driverId === driver.id);
              const totalPoints = driverFines.reduce((sum, f) => sum + f.points, 0);
              
              return (
                <div key={driver.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 group hover:shadow-md transition-all relative overflow-hidden">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-white shadow-sm overflow-hidden flex-shrink-0 ring-4 ring-slate-50/50">
                    {driver.avatar ? (
                      <img src={driver.avatar} alt={driver.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-300 text-2xl uppercase">
                        {driver.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-slate-800 truncate uppercase tracking-tight">{driver.name}</h4>
                    <p className="text-[10px] text-slate-400 font-write uppercase tracking-widest mt-0.5">CNH: {driver.license}</p>
                    <div className="flex items-center gap-3 mt-3">
                       <span className={`text-[10px] font-write px-3 py-1 rounded-full uppercase tracking-tighter ${totalPoints >= 20 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                        {totalPoints} Pontos Acumulados
                       </span>
                       <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">@{driver.username}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleEditDriver(driver)}
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all border border-transparent hover:border-blue-100"
                      title="Editar Perfil"
                    >
                      <i className="fas fa-user-edit text-xs"></i>
                    </button>
                    <button 
                      onClick={() => handleDeleteDriver(driver.id, driver.name)}
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all border border-transparent hover:border-red-100"
                      title="Remover Motorista"
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fines History */}
        <div className="space-y-4">
          <h3 className="text-sm font-write text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
            <i className="fas fa-clock-rotate-left text-red-500"></i> Últimas Infrações
          </h3>
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            {fines.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {[...fines].reverse().map(fine => {
                  const driver = drivers.find(d => d.id === fine.driverId);
                  const vehicle = vehicles.find(v => v.id === fine.vehicleId);
                  return (
                    <div key={fine.id} className="p-5 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex flex-col items-center justify-center font-write leading-none border border-red-100 shadow-sm">
                          <span className="text-xs">{fine.points}</span>
                          <span className="text-[7px] uppercase tracking-tighter">PTS</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">{driver?.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            <span className="text-blue-500">{vehicle?.plate}</span> • {new Date(fine.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-write text-slate-900">R$ {fine.value.toLocaleString()}</p>
                        <button onClick={() => deleteFine(fine.id)} className="text-[9px] text-red-300 hover:text-red-500 font-write uppercase tracking-widest mt-1">Remover Registro</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-16 text-center text-slate-300 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-100">
                   <i className="fas fa-shield-check text-4xl"></i>
                </div>
                <p className="text-[10px] font-write uppercase tracking-[0.2em] opacity-50">Base de Infrações Limpa</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverManagement;
