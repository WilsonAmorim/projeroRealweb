import React from 'react';
import { X, RotateCw, Plus, Edit, Trash2, Loader2, Save } from 'lucide-react';

interface RebobinamentosModalProps {
  isOpen: boolean;
  onClose: () => void;
  rebobinamentosList: any[];
  isLoading: boolean;
  descricao: string;
  setDescricao: (val: string) => void;
  cv: string;
  setCv: (val: string) => void;
  polos: string;
  setPolos: (val: string) => void;
  preco: string;
  setPreco: (val: string) => void;
  editingItem: any | null;
  isSaving: boolean;
  onSave: (e: React.FormEvent) => void;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  onClearForm: () => void;
}

export const RebobinamentosModal: React.FC<RebobinamentosModalProps> = ({
  isOpen,
  onClose,
  rebobinamentosList,
  isLoading,
  descricao,
  setDescricao,
  cv,
  setCv,
  polos,
  setPolos,
  preco,
  setPreco,
  editingItem,
  isSaving,
  onSave,
  onEdit,
  onDelete,
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
              <RotateCw className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Tabela de Rebobinamento</h2>
              <p className="text-xs text-slate-500 font-medium">
                Gerencie valores de referência de rebobinamento por CV e polos
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
          {/* Formulário de Cadastro / Edição */}
          <form onSubmit={onSave} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                {editingItem ? 'Editar Rebobinamento' : 'Novo Rebobinamento'}
              </h3>
              {editingItem && (
                <button
                  type="button"
                  onClick={onClearForm}
                  className="text-xs text-emerald-600 font-semibold hover:underline"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Rebobinamento W22"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Potência (CV)</label>
                <input
                  type="text"
                  required
                  value={cv}
                  onChange={(e) => setCv(e.target.value)}
                  placeholder="Ex: 5"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Polos</label>
                <input
                  type="text"
                  required
                  value={polos}
                  onChange={(e) => setPolos(e.target.value)}
                  placeholder="Ex: 4"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="Ex: 450.00"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
                />
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
                ) : editingItem ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>{editingItem ? 'Atualizar Item' : 'Adicionar Item'}</span>
              </button>
            </div>
          </form>

          {/* Tabela de Itens Cadastrados */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3">Descrição</th>
                  <th className="p-3 text-center">CV</th>
                  <th className="p-3 text-center">Polos</th>
                  <th className="p-3 text-right">Preço</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-500" />
                      Carregando rebobinamentos...
                    </td>
                  </tr>
                ) : rebobinamentosList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 text-sm">
                      Nenhum rebobinamento cadastrado.
                    </td>
                  </tr>
                ) : (
                  rebobinamentosList.map((item) => (
                    <tr key={item.id_rebobinamento} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold">{item.descricao_rebobinamento || item.descricao || '-'}</td>
                      <td className="p-3 text-center">{item.cv} CV</td>
                      <td className="p-3 text-center">{item.polos}P</td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        {Number(item.preco).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete(item.id_rebobinamento)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
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
