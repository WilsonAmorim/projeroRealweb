import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLaudoByOS } from '../../services/laudoEletrico';
import type { LaudoEletricoRow } from '../../services/laudoEletrico';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

type Props = { idOs: number; correnteNominal?: number | null; };

export default function LaudoEletricoView({ idOs, correnteNominal }: Props) {
  const [data, setData] = useState<LaudoEletricoRow | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const row = await getLaudoByOS(idOs);
      if (!mounted) return;
      setData(row);
    })();
    const handler = (e: any) => {
      try {
        const detail = e?.detail;
        if (detail && detail.id_os === idOs) setData(detail);
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('laudoEletricoSaved', handler as EventListener);
    return () => { mounted = false; };
  }, [idOs]);

  const num = (v: any) => (v == null || isNaN(Number(v)) ? 0 : Number(v));

  // prepare datasets
  const currentData = [
    { name: 'Nominal', value: num(correnteNominal) },
    { name: 'R', value: num(data?.corrente_saida_r) },
    { name: 'S', value: num(data?.corrente_saida_s) },
    { name: 'T', value: num(data?.corrente_saida_t) },
  ];

  const resistenciaData = [
    { name: 'R', entrada: num(data?.resistencia_entrada_r), saida: num(data?.resistencia_saida_r) },
    { name: 'S', entrada: num(data?.resistencia_entrada_s), saida: num(data?.resistencia_saida_s) },
    { name: 'T', entrada: num(data?.resistencia_entrada_t), saida: num(data?.resistencia_saida_t) },
  ];

  const isolacaoData = [
    { name: 'R', entrada: num(data?.isolacao_entrada_r), saida: num(data?.isolacao_saida_r) },
    { name: 'S', entrada: num(data?.isolacao_entrada_s), saida: num(data?.isolacao_saida_s) },
    { name: 'T', entrada: num(data?.isolacao_entrada_t), saida: num(data?.isolacao_saida_t) },
  ];

  if (!data) return <div className="text-sm text-gray-500">Nenhum laudo elétrico salvo para esta OS.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate(`/os/${idOs}/laudo-eletrico`)}
          className="px-3 py-2 bg-brand-blue text-white rounded text-xs font-bold"
        >
          Gerar PDF
        </button>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold mb-3">Corrente de Saída (A)</h4>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <BarChart data={currentData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Medido" fill="#f43f5e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold mb-3">Resistência (Ohm)</h4>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <BarChart data={resistenciaData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="entrada" name="Entrada" fill="#3b82f6" />
              <Bar dataKey="saida" name="Saída" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold mb-3">Isolação (MOhm)</h4>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <BarChart data={isolacaoData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="entrada" name="Entrada" fill="#3b82f6" />
              <Bar dataKey="saida" name="Saída" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
