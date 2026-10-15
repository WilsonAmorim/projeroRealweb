import React, { useEffect, useRef, useState } from 'react';
import { X, Save, Loader2, Wrench, ImagePlus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const BUCKET = 'fotos_queima';

interface PhotoUploadFieldProps {
  idOS: number;
  column: 'fotos_queima' | 'fotos_pecas_danificadas';
  folder: string;
  label: string;
  initial: string[];
}

const PhotoUploadField: React.FC<PhotoUploadFieldProps> = ({ idOS, column, folder, label, initial }) => {
  const [urls, setUrls] = useState<string[]>(initial || []);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setUrls(initial || []), [initial]);

  const persist = async (next: string[]) => {
    const { error } = await supabase.from('ordens_servico').update({ [column]: next }).eq('id_os', idOS);
    if (error) {
      if (error.message?.includes('column') || error.code === '42703' || error.message?.includes('schema cache')) {
        throw new Error(`A coluna "${column}" ainda não existe na tabela ordens_servico. Execute o script SQL no Supabase.`);
      }
      throw error;
    }
    setUrls(next);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setError(null);
    try {
      const novas: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop();
        const path = `${folder}/os_${idOS}_${Date.now()}_${i}.${ext}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        if (data?.publicUrl) novas.push(data.publicUrl);
      }
      await persist([...urls, ...novas]);
    } catch (err: any) {
      console.error(`Erro no upload (${column}):`, err);
      setError(err?.message || 'Falha no upload.');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = async (url: string) => {
    if (!confirm('Remover esta imagem?')) return;
    try {
      const marker = `/${BUCKET}/`;
      const idx = url.indexOf(marker);
      if (idx >= 0) await supabase.storage.from(BUCKET).remove([url.substring(idx + marker.length)]);
      await persist(urls.filter((u) => u !== url));
    } catch (err: any) {
      setError(err?.message || 'Falha ao remover.');
    }
  };

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          <span>{isUploading ? 'Enviando...' : 'Enviar imagens'}</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      {urls.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Nenhuma imagem enviada.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {urls.map((url) => (
            <div key={url} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square">
              <a href={url} target="_blank" rel="noreferrer">
                <img src={url} alt={label} className="w-full h-full object-cover" />
              </a>
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 p-1 bg-white/90 rounded-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remover"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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

            <div className="mt-3 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
              <PhotoUploadField
                idOS={selectedOS.id_os}
                column="fotos_queima"
                folder="queima"
                label="Fotos da Queima"
                initial={selectedOS.fotos_queima || []}
              />
              <PhotoUploadField
                idOS={selectedOS.id_os}
                column="fotos_pecas_danificadas"
                folder="pecas_danificadas"
                label="Peças Danificadas"
                initial={selectedOS.fotos_pecas_danificadas || []}
              />
            </div>
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
