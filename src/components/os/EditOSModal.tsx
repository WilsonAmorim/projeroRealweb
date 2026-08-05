import React from 'react';
import { X, Save, Loader2, Wrench } from 'lucide-react';

interface EditOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOS: any;
  andamentosOptions: any[];
  causasOptions: any[];
  editAndamento: string;
  setEditAndamento: (val: string) => void;
  editCausaQueima: string;
  setEditCausaQueima: (val: string) => void;
  editObservacoes: string;
  setEditObservacoes: (val: string) => void;
  isUpdatingOS: boolean;
  onSave: (e: React.FormEvent) => void;
}

export const EditOSModal: React.FC<EditOSModalProps> = ({
  isOpen,
  onClose,
  selectedOS,
  andamentosOptions,
  causasOptions,
  editAndamento,
  setEditAndamento,
  editCausaQueima,
  setEditCausaQueima,
  editObservacoes,
  setEditObservacoes,
  isUpdatingOS,
  onSave,
}) => {
  if (!isOpen || !selectedOS) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Ordem de Serviço #{selectedOS.id_os}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Cliente: <span className="font-semibold text-slate-700">{selectedOS.cliente?.nome_razao_social || 'N/A'}</span>
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

        {/* Form Body */}
        <form onSubmit={onSave} className="py-6 space-y-5 overflow-y-auto flex-1 px-1">
          {/* Informações Técnicas Fixas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Motor</span>
              <span className="font-semibold text-slate-800">{selectedOS.motor?.especificacao || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Nº de Série</span>
              <span className="font-semibold text-slate-800">{selectedOS.motor?.num_serie || 'N/A'}</span>
            </div>
          </div>

          {/* Andamento */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Andamento / Status da OS
            </label>
            <select
              value={editAndamento}
              onChange={(e) => setEditAndamento(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white font-medium text-slate-800"
            >
              <option value="">Selecione um andamento</option>
              {andamentosOptions.map((opt) => (
                <option key={opt.id_andamento} value={opt.id_andamento}>
                  {opt.descricao}
                </option>
              ))}
            </select>
          </div>

          {/* Causa de Queima */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Causa Provável da Queima
            </label>
            <select
              value={editCausaQueima}
              onChange={(e) => setEditCausaQueima(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white font-medium text-slate-800"
            >
              <option value="">Nenhuma ou Não informada</option>
              {causasOptions.map((opt) => (
                <option key={opt.id_causa_queima} value={opt.id_causa_queima}>
                  {opt.descricao}
                </option>
              ))}
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Observações Gerais
            </label>
            <textarea
              rows={3}
              value={editObservacoes}
              onChange={(e) => setEditObservacoes(e.target.value)}
              placeholder="Digite detalhes adicionais sobre o estado do motor ou andamento..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white font-normal text-slate-800"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUpdatingOS}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isUpdatingOS ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Salvar...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
