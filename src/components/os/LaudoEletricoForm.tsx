import React, { useEffect, useState } from 'react';
import { getLaudoByOS, upsertLaudo } from '../../services/laudoEletrico';
import type { LaudoEletricoRow } from '../../services/laudoEletrico';
import { supabase } from '../../lib/supabase';

type Props = {
  idOs: number;
  idMotor?: number;
  initialTensao?: number | '';
  initialCorrente?: number | '';
  onSaved?: (row: LaudoEletricoRow) => void;
};

export default function LaudoEletricoForm({ idOs, idMotor, initialTensao, initialCorrente, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
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
        if (row) setValues(row);
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
    try {
      const row = await upsertLaudo({ ...values, id_os: idOs });
      
      if (idMotor) {
        await supabase.from('motores').update({
          tensao_nominal: tensaoNominal === '' ? null : tensaoNominal.toString(),
          corrente_nominal: correnteNominal === '' ? null : correnteNominal.toString()
        }).eq('id_motor', idMotor);
      }

      setSaved(true);
      onSaved?.(row);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar laudo');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v: number | null | undefined, decimals = 2) => (v == null ? '' : Number(v).toFixed(decimals));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-brand-blue text-white rounded-md font-semibold hover:bg-brand-blue/90 disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Salvar Laudo'}
          </button>
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
        <label className="block text-sm">Observações Elétricas</label>
        <textarea className="mt-1 w-full p-3 bg-white border border-gray-200 rounded-md text-sm" rows={5} value={values.observacoes || ''} onChange={(e) => setField('observacoes', e.target.value)} />
      </section>

      {saved && <div className="text-sm text-green-600 mt-2">Laudo salvo com sucesso.</div>}
    </form>
  );
}
