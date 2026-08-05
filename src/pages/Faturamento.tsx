import React, { useEffect, useState } from 'react';
import { DollarSign, FileText, BarChart3, Loader2, Plus, Check, X, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { MainLayout } from '../components/layout/MainLayout';

interface EligibleOS {
  id_os: number;
  cliente: string;
  motor: string;
  andamento: string;
}

interface Fatura {
  id_faturamento: number;
  id_os: number;
  valor_servico: number;
  data_vencimento: string;
  status_pagamento: string;
  data_pagamento: string | null;
  valor_desconto: number;
  valor_pagamento: number | null;
  numero_nota_fiscal: string;
  cliente: string;
  motor: string;
}

interface Relatorio extends Fatura {
  total_servicos: number;
  total_pecas: number;
  valor_faturamento: number;
  valor_total_faturamento: number;
}

const tabs = [
  { id: 'elaboracao', label: 'Elaboração do Faturamento', icon: Plus },
  { id: 'emitidas', label: 'Faturas Emitidas', icon: FileText },
  { id: 'relatorio', label: 'Relatório de Faturamento', icon: BarChart3 },
];

const Faturamento: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('elaboracao');

  // Tab 1 state
  const [eligibleOS, setEligibleOS] = useState<EligibleOS[]>([]);
  const [selectedOS, setSelectedOS] = useState<number[]>([]);
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [valorTotal, setValorTotal] = useState(0);
  const [detalhesOS, setDetalhesOS] = useState<any[]>([]);
  const [nfe, setNfe] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [desconto, setDesconto] = useState('');
  const [saving, setSaving] = useState(false);

  // Tab 2 state
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loadingFaturas, setLoadingFaturas] = useState(false);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payValue, setPayValue] = useState('');

  // Tab 3 state
  const [relatorio, setRelatorio] = useState<Relatorio[]>([]);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);
  const [mesSel, setMesSel] = useState(new Date().getMonth() + 1);
  const [anoSel, setAnoSel] = useState(new Date().getFullYear());

  useEffect(() => {
    const getEligible = async () => {
      if (activeTab !== 'elaboracao') return;
      setLoadingEligible(true);
      try {
        const { data, error } = await supabase
          .from('ordens_servico')
          .select(`
            id_os,
            id_andamento,
            andamento_servico(descricao_andamento),
            motores(
              num_serie,
              cliente(nome_razao_social)
            )
          `)
          .in('id_andamento', [5, 6]);

        if (error) throw error;

        const formatadas: EligibleOS[] = (data || []).map((os: any) => ({
          id_os: os.id_os,
          cliente: os.motores?.cliente?.nome_razao_social || 'N/D',
          motor: os.motores?.num_serie || 'N/D',
          andamento: os.andamento_servico?.descricao_andamento || `Status #${os.id_andamento}`,
        }));

        setEligibleOS(formatadas);
      } catch (e: any) {
        console.error('Erro ao buscar OS elegíveis diretamente:', e);
        showToast('Erro ao buscar OS para faturamento.', 'error');
      } finally {
        setLoadingEligible(false);
      }
    };

    getEligible();
  }, [activeTab, showToast]);

  useEffect(() => {
    const getFaturas = async () => {
      if (activeTab !== 'emitidas') return;
      setLoadingFaturas(true);
      try {
        const { data, error } = await supabase
          .from('faturamento')
          .select(`
            *,
            ordens_servico (
              motores (
                num_serie,
                cliente (nome_razao_social)
              )
            )
          `)
          .order('id_faturamento', { ascending: false });

        if (error) throw error;

        const faturasFormatadas = (data || []).map((f: any) => ({
          ...f,
          cliente: f.ordens_servico?.motores?.cliente?.nome_razao_social || 'N/D',
          motor: f.ordens_servico?.motores?.num_serie || 'N/D',
        }));
        setFaturas(faturasFormatadas);
      } catch (e: any) {
        console.error('Erro ao buscar faturas:', e);
        showToast('Erro ao buscar faturas emitidas.', 'error');
      } finally {
        setLoadingFaturas(false);
      }
    };

    getFaturas();
  }, [activeTab, showToast]);

  const calcularTotaisOS = async (idsOS: number[]) => {
    if (!idsOS || idsOS.length === 0) return [];

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_totais_os_faturamento',
        { ids_texto: idsOS.join(',') }
      );
      if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
        return rpcData;
      }
    } catch {
      // Ignora erro RPC e avança para o fallback
    }

    try {
      const [servicosReq, pecasReq, rebobinamentosReq] = await Promise.all([
        supabase.from('os_servicos').select('id_os, preco, valor, servico:servico(preco)').in('id_os', idsOS),
        supabase.from('os_pecas').select('id_os, preco, valor, valor_unitario, peca:pecas(preco)').in('id_os', idsOS),
        supabase.from('os_rebobinamentos').select('id_os, preco, valor, rebobinamento:rebobinamentos(preco)').in('id_os', idsOS),
      ]);

      const servicos = servicosReq.data || [];
      const pecas = pecasReq.data || [];
      const rebobinamentos = rebobinamentosReq.data || [];

      const getItemPrice = (item: any) => {
        const raw =
          item?.preco ??
          item?.valor_unitario ??
          item?.valor ??
          item?.servico?.preco ??
          item?.peca?.preco ??
          item?.rebobinamento?.preco ??
          0;
        const n = Number(raw);
        return Number.isFinite(n) ? n : 0;
      };

      const mapTotais: Record<number, { id_os: number; total_servicos: number; total_pecas: number; total: number }> = {};

      idsOS.forEach((id) => {
        mapTotais[id] = { id_os: id, total_servicos: 0, total_pecas: 0, total: 0 };
      });

      servicos.forEach((s: any) => {
        if (mapTotais[s.id_os]) mapTotais[s.id_os].total_servicos += getItemPrice(s);
      });

      rebobinamentos.forEach((r: any) => {
        if (mapTotais[r.id_os]) mapTotais[r.id_os].total_servicos += getItemPrice(r);
      });

      pecas.forEach((p: any) => {
        if (mapTotais[p.id_os]) mapTotais[p.id_os].total_pecas += getItemPrice(p);
      });

      Object.values(mapTotais).forEach((item) => {
        item.total = item.total_servicos + item.total_pecas;
      });

      return Object.values(mapTotais);
    } catch (err) {
      console.error('Erro ao calcular totais das OS via consulta direta:', err);
      return idsOS.map((id) => ({ id_os: id, total_servicos: 0, total_pecas: 0, total: 0 }));
    }
  };

  useEffect(() => {
    const getTotais = async () => {
      if (selectedOS.length === 0) {
        setValorTotal(0);
        setDetalhesOS([]);
        return;
      }
      try {
        const data = await calcularTotaisOS(selectedOS);
        const totalAcumulado = (data || []).reduce(
          (sum: number, item: any) => sum + Number(item.total),
          0
        );
        setValorTotal(totalAcumulado);
        setDetalhesOS(data || []);
      } catch (e: any) {
        console.error('Erro ao calcular totais das OS:', e);
      }
    };

    getTotais();
  }, [selectedOS]);

  const toggleOS = (id: number) => {
    setSelectedOS((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSaveFatura = async () => {
    if (selectedOS.length === 0 || !nfe || !dataVencimento) {
      showToast('Preencha todos os campos obrigatórios da fatura.', 'error');
      return;
    }

    setSaving(true);
    try {
      const descCalculado = desconto ? Number(desconto.replace(',', '.')) : 0;

      const faturasPayload = selectedOS.map((id_os) => {
        const detalhe = detalhesOS.find((d) => d.id_os === id_os);
        return {
          id_os: id_os,
          numero_nota_fiscal: nfe,
          data_vencimento: dataVencimento,
          valor_servico: detalhe ? detalhe.total : 0,
          valor_desconto: descCalculado / selectedOS.length,
          status_pagamento: 'Pendente',
        };
      });

      const { error } = await supabase.from('faturamento').insert(faturasPayload);
      if (error) throw error;

      showToast('Fatura emitida com sucesso!', 'success');
      setSelectedOS([]);
      setNfe('');
      setDataVencimento('');
      setDesconto('');
      setEligibleOS((prev) => prev.filter((os) => !selectedOS.includes(os.id_os)));
    } catch (e: any) {
      showToast(e.message || 'Erro ao salvar fatura.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePagar = async (id: number) => {
    if (!payValue) {
      showToast('Informe o valor pago.', 'error');
      return;
    }
    try {
      const vPago = Number(payValue.replace(',', '.'));
      const { error } = await supabase
        .from('faturamento')
        .update({
          status_pagamento: 'Pago',
          data_pagamento: new Date().toISOString(),
          valor_pagamento: vPago,
        })
        .eq('id_faturamento', id);

      if (error) throw error;

      showToast('Pagamento registrado com sucesso!', 'success');
      setFaturas((prev) =>
        prev.map((f) =>
          f.id_faturamento === id
            ? {
                ...f,
                status_pagamento: 'Pago',
                data_pagamento: new Date().toISOString(),
                valor_pagamento: vPago,
              }
            : f
        )
      );
      setPayingId(null);
      setPayValue('');
    } catch (e: any) {
      showToast(e.message || 'Erro ao registrar pagamento.', 'error');
    }
  };

  const handleCancelar = async (id: number) => {
    if (!confirm('Deseja realmente cancelar esta fatura?')) return;
    try {
      const { error } = await supabase.from('faturamento').delete().eq('id_faturamento', id);
      if (error) throw error;
      showToast('Fatura cancelada.', 'info');
      setFaturas((prev) => prev.filter((f) => f.id_faturamento !== id));
    } catch (e: any) {
      showToast(e.message || 'Erro ao cancelar fatura.', 'error');
    }
  };

  const fetchRelatorio = async () => {
    setLoadingRelatorio(true);

    const dataInicio = `${anoSel}-${String(mesSel).padStart(2, '0')}-01`;
    const dataFim = new Date(anoSel, mesSel, 0).toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('faturamento')
        .select(`
          *,
          ordens_servico (
            id_os,
            motores (cliente (nome_razao_social))
          )
        `)
        .gte('data_vencimento', dataInicio)
        .lte('data_vencimento', dataFim);

      if (error) throw error;

      const idsOS = (data || []).map((f) => f.id_os);
      let detalhesCalculados: any[] = [];

      if (idsOS.length > 0) {
        detalhesCalculados = await calcularTotaisOS(idsOS);
      }

      const formatado: Relatorio[] = (data || []).map((f: any) => {
        const d = detalhesCalculados.find((item) => item.id_os === f.id_os);
        const vServico = Number(f.valor_servico);
        const vDesc = Number(f.valor_desconto || 0);

        return {
          ...f,
          cliente: f.ordens_servico?.motores?.cliente?.nome_razao_social || 'N/D',
          valor_faturamento: vServico,
          valor_total_faturamento: vServico - vDesc,
          total_servicos: d ? d.total_servicos : 0,
          total_pecas: d ? d.total_pecas : 0,
        };
      });

      setRelatorio(formatado);
    } catch (e: any) {
      console.error('Erro ao gerar relatório:', e.message || e);
      showToast('Erro ao carregar relatório.', 'error');
    } finally {
      setLoadingRelatorio(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'relatorio') {
      fetchRelatorio();
    }
  }, [activeTab, mesSel, anoSel]);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtDate = (d: string) => (d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '-');

  return (
    <MainLayout pageTitle="Relatórios e Faturamento">
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Faturamento & Financeiro</h1>
              <p className="text-xs text-slate-400 font-medium">
                Emissão de faturas de OS concluídas, acompanhamento de pagamentos e relatórios
              </p>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="flex space-x-1 bg-slate-900 p-1.5 rounded-2xl shadow-md border border-slate-800">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Elaboração */}
        {activeTab === 'elaboracao' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-3 border-slate-100">
              Selecione as Ordens de Serviço para Faturar
            </h2>
            {loadingEligible ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              </div>
            ) : eligibleOS.length === 0 ? (
              <p className="text-slate-400 text-center py-12 text-sm font-medium">
                Nenhuma Ordem de Serviço elegível para faturamento no momento.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {eligibleOS.map((os) => (
                  <label
                    key={os.id_os}
                    className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedOS.includes(os.id_os)
                        ? 'border-emerald-500 bg-emerald-50/60 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOS.includes(os.id_os)}
                      onChange={() => toggleOS(os.id_os)}
                      className="mr-3 h-4 w-4 accent-emerald-500 rounded"
                    />
                    <span className="font-bold text-slate-800 mr-3">OS #{os.id_os}</span>
                    <span className="text-sm text-slate-600">
                      {os.cliente} — {os.motor}
                    </span>
                    <span className="ml-auto text-xs px-2.5 py-1 bg-slate-900 text-emerald-400 rounded-full font-bold">
                      {os.andamento}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {selectedOS.length > 0 && (
              <>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Resumo das OS Selecionadas
                  </h3>
                  {detalhesOS.map((d: any) => (
                    <div
                      key={d.id_os}
                      className="flex justify-between text-sm py-1.5 border-b border-slate-200/60 last:border-0"
                    >
                      <span className="font-bold text-slate-700">OS #{d.id_os}</span>
                      <span className="text-slate-500 text-xs">
                        Serviços: {fmt(Number(d.total_servicos))} | Peças: {fmt(Number(d.total_pecas))}
                      </span>
                      <span className="font-bold text-slate-800">{fmt(Number(d.total))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 border-t border-slate-300">
                    <span className="font-bold text-slate-800 text-base">Total Geral</span>
                    <span className="font-extrabold text-emerald-600 text-lg">{fmt(valorTotal)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">
                      Nº NF-e *
                    </label>
                    <input
                      type="text"
                      value={nfe}
                      onChange={(e) => setNfe(e.target.value)}
                      placeholder="Ex: NF-e 000123"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">
                      Data Vencimento *
                    </label>
                    <input
                      type="date"
                      value={dataVencimento}
                      onChange={(e) => setDataVencimento(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">
                      Desconto (R$)
                    </label>
                    <input
                      type="text"
                      value={desconto}
                      onChange={(e) => setDesconto(e.target.value)}
                      placeholder="0,00"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveFatura}
                  disabled={saving || !nfe || !dataVencimento}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/20"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <DollarSign className="h-5 w-5" />
                      <span>Emitir Fatura</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* TAB 2: Faturas Emitidas */}
        {activeTab === 'emitidas' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {loadingFaturas ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              </div>
            ) : faturas.length === 0 ? (
              <p className="text-slate-400 text-center py-12 text-sm font-medium">Nenhuma fatura emitida ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="px-4 py-3">NF-e</th>
                      <th className="px-4 py-3">OS</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3 text-right">Valor</th>
                      <th className="px-4 py-3 text-center">Vencimento</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {faturas.map((f) => (
                      <tr key={f.id_faturamento} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-800">{f.numero_nota_fiscal}</td>
                        <td className="px-4 py-3 text-slate-600">#{f.id_os}</td>
                        <td className="px-4 py-3 text-slate-600">{f.cliente}</td>
                        <td className="px-4 py-3 font-bold text-slate-800 text-right">
                          {fmt(Number(f.valor_servico) - Number(f.valor_desconto || 0))}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-center">{fmtDate(f.data_vencimento)}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              f.status_pagamento === 'Pago'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {f.status_pagamento}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {f.status_pagamento === 'Pendente' && (
                            <div className="flex items-center justify-center space-x-1">
                              {payingId === f.id_faturamento ? (
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="text"
                                    placeholder="Valor pago"
                                    value={payValue}
                                    onChange={(e) => setPayValue(e.target.value)}
                                    className="w-24 px-2 py-1 border border-slate-200 rounded-lg text-xs outline-none"
                                  />
                                  <button
                                    onClick={() => handlePagar(f.id_faturamento)}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setPayingId(null);
                                      setPayValue('');
                                    }}
                                    className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setPayingId(f.id_faturamento)}
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                    title="Registrar Pagamento"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleCancelar(f.id_faturamento)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Cancelar Fatura"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Relatório */}
        {activeTab === 'relatorio' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-center space-x-4">
              <label className="text-xs font-bold text-slate-600 uppercase">Mês:</label>
              <select
                value={mesSel}
                onChange={(e) => setMesSel(Number(e.target.value))}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <label className="text-xs font-bold text-slate-600 uppercase">Ano:</label>
              <select
                value={anoSel}
                onChange={(e) => setAnoSel(Number(e.target.value))}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
              >
                {[2024, 2025, 2026, 2027].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              {loadingRelatorio ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                </div>
              ) : relatorio.length === 0 ? (
                <p className="text-slate-400 text-center py-12 text-sm font-medium">
                  Nenhum registro para o período selecionado.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        <th className="px-3 py-3">OS</th>
                        <th className="px-3 py-3">NF-e</th>
                        <th className="px-3 py-3">Cliente</th>
                        <th className="px-3 py-3 text-center">Vencimento</th>
                        <th className="px-3 py-3 text-right">Faturamento</th>
                        <th className="px-3 py-3 text-right">Desconto</th>
                        <th className="px-3 py-3 text-right">Total Fat.</th>
                        <th className="px-3 py-3 text-right">Serviços</th>
                        <th className="px-3 py-3 text-right">Peças</th>
                        <th className="px-3 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {relatorio.map((r) => (
                        <tr key={r.id_faturamento} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-2.5 font-bold text-slate-800">#{r.id_os}</td>
                          <td className="px-3 py-2.5 text-slate-600">{r.numero_nota_fiscal}</td>
                          <td className="px-3 py-2.5 text-slate-600">{r.cliente}</td>
                          <td className="px-3 py-2.5 text-slate-500 text-center">{fmtDate(r.data_vencimento)}</td>
                          <td className="px-3 py-2.5 text-right font-medium">{fmt(r.valor_faturamento)}</td>
                          <td className="px-3 py-2.5 text-right text-red-500">
                            {r.valor_desconto > 0 ? `-${fmt(r.valor_desconto)}` : '-'}
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-emerald-600">
                            {fmt(r.valor_total_faturamento)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-500">{fmt(r.total_servicos)}</td>
                          <td className="px-3 py-2.5 text-right text-slate-500">{fmt(r.total_pecas)}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                r.status_pagamento === 'Pago'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {r.status_pagamento}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 border-t-2 border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-800">
                        <td colSpan={4} className="px-3 py-3">
                          TOTAIS DO PERÍODO
                        </td>
                        <td className="px-3 py-3 text-right font-bold">
                          {fmt(relatorio.reduce((s, r) => s + r.valor_faturamento, 0))}
                        </td>
                        <td className="px-3 py-3 text-right text-red-500 font-bold">
                          {fmt(relatorio.reduce((s, r) => s + r.valor_desconto, 0))}
                        </td>
                        <td className="px-3 py-3 text-right text-emerald-600 font-black text-sm">
                          {fmt(relatorio.reduce((s, r) => s + r.valor_total_faturamento, 0))}
                        </td>
                        <td className="px-3 py-3 text-right font-bold">
                          {fmt(relatorio.reduce((s, r) => s + r.total_servicos, 0))}
                        </td>
                        <td className="px-3 py-3 text-right font-bold">
                          {fmt(relatorio.reduce((s, r) => s + r.total_pecas, 0))}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Faturamento;