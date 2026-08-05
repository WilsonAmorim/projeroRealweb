import React from 'react';
import { X, Settings, Plus, Edit, Loader2, Save, UserCheck, UserX } from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuariosList: any[];
  perfisList: any[];
  isLoading: boolean;
  usuarioNome: string;
  setUsuarioNome: (val: string) => void;
  usuarioEmail: string;
  setUsuarioEmail: (val: string) => void;
  usuarioPassword: string;
  setUsuarioPassword: (val: string) => void;
  usuarioPerfil: string;
  setUsuarioPerfil: (val: string) => void;
  usuarioAtivo: boolean;
  setUsuarioAtivo: (val: boolean) => void;
  editingUsuario: any | null;
  isSaving: boolean;
  onSave: (e: React.FormEvent) => void;
  onEdit: (user: any) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onClearForm: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  usuariosList,
  perfisList,
  isLoading,
  usuarioNome,
  setUsuarioNome,
  usuarioEmail,
  setUsuarioEmail,
  usuarioPassword,
  setUsuarioPassword,
  usuarioPerfil,
  setUsuarioPerfil,
  usuarioAtivo,
  setUsuarioAtivo,
  editingUsuario,
  isSaving,
  onSave,
  onEdit,
  onToggleStatus,
  onClearForm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Gerenciamento de Usuários</h2>
              <p className="text-xs text-slate-500 font-medium">
                Controle acessos, perfis e permissões dos membros da equipe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-6 overflow-y-auto flex-1 px-1">
          {/* Formulário */}
          <form onSubmit={onSave} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              {editingUsuario && (
                <button
                  type="button"
                  onClick={onClearForm}
                  className="text-xs text-emerald-600 font-semibold hover:underline"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={usuarioNome}
                  onChange={(e) => setUsuarioNome(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail de Acesso</label>
                <input
                  type="email"
                  required
                  value={usuarioEmail}
                  onChange={(e) => setUsuarioEmail(e.target.value)}
                  placeholder="Ex: joao@realservicos.com"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {editingUsuario ? 'Senha (Deixe em branco p/ manter)' : 'Senha'}
                </label>
                <input
                  type="password"
                  required={!editingUsuario}
                  value={usuarioPassword}
                  onChange={(e) => setUsuarioPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Perfil de Acesso</label>
                <select
                  required
                  value={usuarioPerfil}
                  onChange={(e) => setUsuarioPerfil(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
                >
                  <option value="">Selecione um Perfil</option>
                  {perfisList.map((p) => (
                    <option key={p.id_perfil} value={p.id_perfil}>
                      {p.nome_perfil}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="usuarioAtivoCheck"
                  checked={usuarioAtivo}
                  onChange={(e) => setUsuarioAtivo(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <label htmlFor="usuarioAtivoCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Usuário Ativo no Sistema
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingUsuario ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>{editingUsuario ? 'Atualizar Usuário' : 'Criar Usuário'}</span>
              </button>
            </div>
          </form>

          {/* Tabela de Usuários */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3">Nome</th>
                  <th className="p-3">E-mail</th>
                  <th className="p-3 text-center">Perfil</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-500" />
                      Carregando usuários...
                    </td>
                  </tr>
                ) : usuariosList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 text-sm">
                      Nenhum usuário cadastrado.
                    </td>
                  </tr>
                ) : (
                  usuariosList.map((usr) => (
                    <tr key={usr.id_usuario} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold">{usr.nome_completo || usr.nome || '-'}</td>
                      <td className="p-3 text-slate-600">{usr.email}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                          {usr.perfil?.nome_perfil || usr.perfis_acesso?.nome_perfil || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            usr.ativo
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {usr.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => onEdit(usr)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onToggleStatus(usr.id_usuario, usr.ativo)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              usr.ativo
                                ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={usr.ativo ? 'Desativar Usuário' : 'Ativar Usuário'}
                          >
                            {usr.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
