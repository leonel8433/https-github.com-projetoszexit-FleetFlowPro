
import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';

const SettingsPage: React.FC = () => {
  const { currentUser, changePassword } = useFleet();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 4) {
      setError('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    changePassword(newPassword);
    setSuccess('Senha alterada com sucesso!');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-sm">
          <i className="fas fa-cog"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gerenciamento de Conta e Segurança</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Profile Info */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-slate-100 shadow-inner overflow-hidden flex items-center justify-center">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-300 text-4xl font-write">{currentUser?.name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{currentUser?.name}</h3>
            <p className="text-sm font-bold text-slate-400 mt-1">ID de Acesso: <span className="text-blue-600">@{currentUser?.username}</span></p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-write uppercase tracking-widest border border-slate-200">
                CNH: {currentUser?.license}
              </span>
              {currentUser?.username === 'admin' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[10px] font-write uppercase tracking-widest border border-blue-200">
                  Acesso Administrativo
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <i className="fas fa-shield-alt text-blue-500"></i>
            <h3 className="text-sm font-write text-slate-800 uppercase tracking-widest">Segurança da Conta</h3>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nova Senha</label>
                <div className="relative">
                  <i className="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 4 caracteres"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-slate-950 transition-all"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirmar Senha</label>
                <div className="relative">
                  <i className="fas fa-check-circle absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input
                    type="password"
                    required
                    placeholder="Repita a nova senha"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-slate-950 transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-shake">
                <i className="fas fa-exclamation-triangle text-lg"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in zoom-in-95">
                <i className="fas fa-check-circle text-lg"></i>
                {success}
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-900 shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <i className="fas fa-save"></i>
                Salvar Nova Senha
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl">
          <div className="flex gap-4">
            <i className="fas fa-info-circle text-blue-500 text-xl mt-1"></i>
            <div>
              <h4 className="text-sm font-bold text-blue-900 uppercase tracking-tight mb-1">Dica de Segurança</h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                Ao alterar sua senha, lembre-se de que a sessão será atualizada. Escolha senhas complexas misturando letras, números e símbolos para proteger os dados sensíveis da frota.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
