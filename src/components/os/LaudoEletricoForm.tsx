import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, Save } from 'lucide-react';
import { getLaudoByOS, upsertLaudo } from '../../services/laudoEletrico';
import type { LaudoEletricoRow } from '../../services/laudoEletrico';
import { supabase } from '../../config/supabase';

type Props = {
  idOs: number;
  idMotor?: number;
  initialTensao?: number | '';
  initialCorrente?: number | '';
  onSaved?: (row: LaudoEletricoRow) => void;
};

export default function LaudoEletricoForm({ idOs, idMotor, initialTensao, initialCorrente, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [values, setValues] = useState<LaudoEletricoRow>({ id_os: idOs });

  // UI-only nominal fields
  const [tensaoNominal, setTensaoNominal] = useState<number | ''>('');
  const [correnteNominal, setCorrenteNominal] = useState<number | ''>('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const row = await getLaudoByOS(idOs);
        if (!mounted) return;
        if (row) {
          setValues(row);
        } else {
          // Se não existir laudo, garante que o estado resete mantendo o id_os correto
          setValues({ id_os: idOs });
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { mounted = false; };
  }, [idOs]);

  useEffect(() => {
    if (initialTensao !== undefined) setTensaoNominal(initialTensao);
    if (initialCorrente !== undefined) setCorrenteNominal(initialCorrente);
  }, [initialTensao, initialCorrente]);

  function setField<K extends keyof LaudoEletricoRow>(k: K, v: LaudoEletricoRow[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    try {
      // Buscar o ID do usuário atualmente autenticado diretamente do Supabase Auth para satisfazer RLS
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id || '987b663b-b1e5-44c5-a873-6ee4e52eec0f';

      // 1. Envia os dados para o banco
      const payload = { ...values, id_os: idOs, id_usuario: currentUserId };
      const row = await upsertLaudo(payload);
      
      // 2. Atualiza o estado local IMEDIATAMENTE com os dados retornados do banco
      if (row) {
        setValues(row);
      }

      if (idMotor) {
        await supabase.from('motores').update({
          tensao_nominal: tensaoNominal === '' ? null : tensaoNominal.toString(),
          corrente_nominal: correnteNominal === '' ? null : correnteNominal.toString() // Corrigido aqui!
        }).eq('id_motor', idMotor);
      }

      setStatusMessage({ type: 'success', text: 'Laudo Elétrico salvo com sucesso!' });
      // Notificar views locais sem forçar reload ou navegação
      try {
        window.dispatchEvent(new CustomEvent('laudoEletricoSaved', { detail: row }));
      } catch (e) {
        // fallback: ainda chamar onSaved se for fornecido
        onSaved?.(row);
      }
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || err?.details || err?.hint || JSON.stringify(err);
      setStatusMessage({ type: 'error', text: `Erro ao salvar laudo: ${errMsg}` });
    } finally {
      setLoading(false);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const fmt = (v: number | null | undefined, decimals = 2) => (v == null ? '' : Number(v).toFixed(decimals));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Tensão Nominal (V)</label>
          <input
            value={tensaoNominal as any}
            onChange={(e) => setTensaoNominal(e.target.value === '' ? '' : Number(e.target.value))}
            type="number"
            step="1"
            className="mt-1 w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Corrente Nominal (A)</label>
          <input
            value={correnteNominal as any}
            onChange={(e) => setCorrenteNominal(e.target.value === '' ? '' : Number(e.target.value))}
            type="number"
            step="0.01"
            className="mt-1 w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
          />
        </div>
      </div>

      <section>
        <h3 className="font-semibold mb-3 border-b pb-2">Medições de Corrente de Saída (A)</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm">Corrente R</label>
            <input
              className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-md text-sm"
              type="number"
              step="0.01"
              value={fmt(values.corrente_saida_r, 2)}
              onChange={(e) => setField('corrente_saida_r', e.target.value === '' ? null : Number(e.target.value))}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm">Corrente S</label>
            <input
              className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-md text-sm"
              type="number"
              step="0.01"
              value={fmt(values.corrente_saida_s, 2)}
              onChange={(e) => setField('corrente_saida_s', e.target.value === '' ? null : Number(e.target.value))}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm">Corrente T</label>
            <input
              className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-md text-sm"
              type="number"
              step="0.01"
              value={fmt(values.corrente_saida_t, 2)}
              onChange={(e) => setField('corrente_saida_t', e.target.value === '' ? null : Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-3 border-b pb-2">Resistência Ôhm (Entrada / Saída)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm">Entrada R</label>
            <input className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-md text-sm" type="number" step="0.0001" value={fmt(values.resistencia_entrada_r, 4)} onChange={(e) => setField('resistencia_entrada_r', e.target.value === '' ? null : Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm">Entrada S</label>
            <input className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-md text-sm" type="number" step="0.0001" value={fmt(values.resistencia_entrada_s, 4)} onChange={(e) => setField('resistencia_entrada_s', e.target.value === '' ? null : Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm">Entrada T</label>
            <input className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-md text-sm" type="number" step="0.0001" value={fmt(values.resistencia_entrada_t, 4)} onChange={(e) => setField('resistencia_entrada_t', e.target.value === '' ? null : Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm">Saída R</label>
            <input className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-md text-sm" type="number" step="0.0001" value={fmt(values.resistencia_saida_r, 4)} onChange={(e) => setField('resistencia_saida_r', e.target.value === '' ? null : Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm">Saída S</label>
            <input className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-md text-sm" type="number" step="0.0001" value={fmt(values.resistencia_saida_s, 4)} onChange={(e) => setField('resistencia_saida_s', e.target.value === '' ? null : Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm">Saída T</label>
            <input className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-md text-sm" type="number" step="0.0001" value={fmt(values.resistencia_saida_t, 4)} onChange={(e) => setField('resistencia_saida_t', e.target.value === '' ? null : Number(e.target.value))} />
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-3 border-b pb-2">Isolação (MOhm) - Entrada / Saída</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm">Entrada R</label>
            <input className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-md text-sm" type="number" step="0.01" value={fmt(values.isolacao_entrada_r, 2)} onChange={(e) => setField('isolacao_entrada_r', e.target.value === '' ? null : Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm">Entrada S</label>
            <input className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-md text-sm" type="number" step="0.01" value={fmt(values.isolacao_entrada_s, 2)} onChange={(e) => setField('isolacao_entrada_s', e.target.value === '' ? null : Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm">Entrada T</label>
            <input className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-md text-sm" type="number" step="0.01" value={fmt(values.isolacao_entrada_t, 2)} onChange={(e) => setField('isolacao_entrada_t', e.target.value === '' ? null : Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm">Saída R</label>
            <input className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-md text-sm" type="number" step="0.01" value={fmt(values.isolacao_saida_r, 2)} onChange={(e) => setField('isolacao_saida_r', e.target.value === '' ? null : Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm">Saída S</label>
            <input className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-md text-sm" type="number" step="0.01" value={fmt(values.isolacao_saida_s, 2)} onChange={(e) => setField('isolacao_saida_s', e.target.value === '' ? null : Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm">Saída T</label>
            <input className="mt-1 w-full p-2 bg-white border border-gray-200 rounded-md text-sm" type="number" step="0.01" value={fmt(values.isolacao_saida_t, 2)} onChange={(e) => setField('isolacao_saida_t', e.target.value === '' ? null : Number(e.target.value))} />
          </div>
        </div>
      </section>

      <section>
        <label className="block text-sm font-semibold mb-2">Observações Elétricas</label>
        <textarea className="mt-1 w-full p-3 bg-white border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue" rows={5} value={values.observacoes || ''} onChange={(e) => setField('observacoes', e.target.value)} />
      </section>

      <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/15 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>Salvar Laudo Elétrico</span>
        </button>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl border flex items-start space-x-3 animate-fade-in ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
            : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold text-sm">{statusMessage.text}</p>
          </div>
        </div>
      )}
    </form>
  );
}