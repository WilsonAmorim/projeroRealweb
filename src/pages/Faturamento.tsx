

// export default Faturamento;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, FileText, BarChart3, Loader2, Plus, Check, X, Trash2 } from 'lucide-react';
import { supabase } from '../config/supabase';

interface EligibleOS { id_os: number; cliente: string; motor: string; andamento: string; }
interface Fatura {
  id_faturamento: number; id_os: number; valor_servico: number; data_vencimento: string;
  status_pagamento: string; data_pagamento: string | null; valor_desconto: number;
  valor_pagamento: number | null; numero_nota_fiscal: string; cliente: string; motor: string;
}
interface Relatorio extends Fatura { total_servicos: number; total_pecas: number; valor_faturamento: number; valor_total_faturamento: number; }

const tabs = [
  { id: 'elaboracao', label: 'Elaboração do Faturamento', icon: Plus },
  { id: 'emitidas', label: 'Faturas Emitidas', icon: FileText },
  { id: 'relatorio', label: 'Relatório de Faturamento', icon: BarChart3 },
];

const Faturamento: React.FC = () => {
  const navigate = useNavigate();
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

  // CORRIGIDO: Busca as OS direto da tabela filtrando pelos novos andamentos (5 e 6)
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
          .in('id_andamento', [5, 6]); // Garante que traz Pronto para Entrega (5) e Entregue (6)

        if (error) throw error;

        // Formata os dados relacionais para o formato exato que o HTML da tabela espera
        const formatadas: EligibleOS[] = (data || []).map((os: any) => ({
          id_os: os.id_os,
          cliente: os.motores?.cliente?.nome_razao_social || 'N/D',
          motor: os.motores?.num_serie || 'N/D',
          andamento: os.andamento_servico?.descricao_andamento || `Status #${os.id_andamento}`
        }));

        setEligibleOS(formatadas);
      } catch (e) {
        console.error('Erro ao buscar OS elegíveis diretamente:', e);
      } finally {
        setLoadingEligible(false);
      }
    };

    getEligible();
  }, [activeTab]);

  // CORRIGIDO: Busca faturas emitidas com async/await e try/catch
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
          motor: f.ordens_servico?.motores?.num_serie || 'N/D'
        }));
        setFaturas(faturasFormatadas);
      } catch (e) {
        console.error('Erro ao buscar faturas:', e);
      } finally {
        setLoadingFaturas(false);
      }
    };

    getFaturas();
  }, [activeTab]);

  // CORRIGIDO: Atualiza o cálculo do total geral com async/await e try/catch
  useEffect(() => {
    const getTotais = async () => {
      if (selectedOS.length === 0) { setValorTotal(0); setDetalhesOS([]); return; }
      try {
        const { data, error } = await supabase.rpc('get_totais_os_faturamento', { ids_texto: selectedOS.join(',') });
        if (error) throw error;
        
        const totalAcumulado = (data || []).reduce((sum: number, item: any) => sum + Number(item.total), 0);
        setValorTotal(totalAcumulado);
        setDetalhesOS(data || []);
      } catch (e) {
        console.error('Erro ao calcular totais das OS:', e);
      }
    };

    getTotais();
  }, [selectedOS]);

  const toggleOS = (id: number) => {
    setSelectedOS(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSaveFatura = async () => {
    if (selectedOS.length === 0 || !nfe || !dataVencimento) { alert('Preencha todos os campos obrigatórios.'); return; }

    // ===== ADICIONE ESTE BLOCO =====
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("USER:", user);
  // ===============================
    setSaving(true);
    try {
      const descCalculado = desconto ? Number(desconto.replace(',', '.')) : 0;
      
      const faturasPayload = selectedOS.map(id_os => {
        const detalhe = detalhesOS.find(d => d.id_os === id_os);
        return {
          id_os: id_os,
          numero_nota_fiscal: nfe,
          data_vencimento: dataVencimento,
          valor_servico: detalhe ? detalhe.total : 0,
          valor_desconto: descCalculado / selectedOS.length, 
          status_pagamento: 'Pendente'
        };
      });

      const { error } = await supabase.from('faturamento').insert(faturasPayload);
      if (error) throw error;

      alert('Fatura emitida com sucesso!');
      setSelectedOS([]); setNfe(''); setDataVencimento(''); setDesconto('');
      setEligibleOS(prev => prev.filter(os => !selectedOS.includes(os.id_os)));
    } catch (e: any) {
      alert(e.message || 'Erro ao salvar fatura.');
    } finally { setSaving(false); }
  };

  const handlePagar = async (id: number) => {
    if (!payValue) { alert('Informe o valor pago.'); return; }
    try {
      const vPago = Number(payValue.replace(',', '.'));
      const { error } = await supabase
        .from('faturamento')
        .update({
          status_pagamento: 'Pago',
          data_pagamento: new Date().toISOString(),
          valor_pagamento: vPago
        })
        .eq('id_faturamento', id);

      if (error) throw error;

      setFaturas(prev => prev.map(f => f.id_faturamento === id ? { ...f, status_pagamento: 'Pago', data_pagamento: new Date().toISOString(), valor_pagamento: vPago } : f));
      setPayingId(null); setPayValue('');
    } catch (e: any) { alert(e.message || 'Erro ao registrar pagamento.'); }
  };

  const handleCancelar = async (id: number) => {
    if (!confirm('Deseja cancelar esta fatura?')) return;
    try {
      const { error } = await supabase.from('faturamento').delete().eq('id_faturamento', id);
      if (error) throw error;
      setFaturas(prev => prev.filter(f => f.id_faturamento !== id));
    } catch (e: any) { alert(e.message || 'Erro ao cancelar.'); }
  };

  // CORRIGIDO: Função de Relatório refatorada inteiramente para async/await e try/catch
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

      const idsOS = (data || []).map(f => f.id_os);
      let detalhesCalculados: any[] = [];
      
      if (idsOS.length > 0) {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_totais_os_faturamento', { ids_texto: idsOS.join(',') });
        if (rpcError) throw rpcError;
        detalhesCalculados = rpcData || [];
      }

      const formatado: Relatorio[] = (data || []).map((f: any) => {
        const d = detalhesCalculados.find(item => item.id_os === f.id_os);
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
  const fmtDate = (d: string) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '-';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <button onClick={() => navigate('/dashboard')} className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-all">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="p-2 bg-emerald-100 rounded-lg"><DollarSign className="h-5 w-5 text-emerald-600" /></div>
              <h1 className="text-lg font-bold text-gray-800">Módulo de Faturamento</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex space-x-1 bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === t.id ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
              <t.icon className="h-4 w-4" /><span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: Elaboração */}
        {activeTab === 'elaboracao' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-3 border-gray-100">Selecione as OS para faturar</h2>
            {loadingEligible ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 text-emerald-600 animate-spin" /></div>
            ) : eligibleOS.length === 0 ? (
              <p className="text-gray-400 text-center py-12">Nenhuma OS elegível para faturamento.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {eligibleOS.map(os => (
                  <label key={os.id_os} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedOS.includes(os.id_os) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="checkbox" checked={selectedOS.includes(os.id_os)} onChange={() => toggleOS(os.id_os)} className="mr-3 accent-emerald-600" />
                    <span className="font-bold text-gray-800 mr-3">OS #{os.id_os}</span>
                    <span className="text-sm text-gray-500">{os.cliente} — {os.motor}</span>
                    <span className="ml-auto text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">{os.andamento}</span>
                  </label>
                ))}
              </div>
            )}

            {selectedOS.length > 0 && (
              <>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Resumo por OS</h3>
                  {detalhesOS.map((d: any) => (
                    <div key={d.id_os} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                      <span className="font-medium text-gray-700">OS #{d.id_os}</span>
                      <span className="text-gray-500">Serviços: {fmt(Number(d.total_servicos))} | Peças: {fmt(Number(d.total_pecas))}</span>
                      <span className="font-bold text-gray-800">{fmt(Number(d.total))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                    <span className="font-bold text-gray-800 text-lg">Total Geral</span>
                    <span className="font-bold text-emerald-600 text-lg">{fmt(valorTotal)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nº NF-e *</label>
                    <input type="text" value={nfe} onChange={e => setNfe(e.target.value)} placeholder="NF-e 000001"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Data Vencimento *</label>
                    <input type="date" value={dataVencimento} onChange={e => setDataVencimento(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Desconto (R$)</label>
                    <input type="text" value={desconto} onChange={e => setDesconto(e.target.value)} placeholder="0,00"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                  </div>
                </div>

                {desconto && Number(desconto.replace(',', '.')) > 0 && (
                  <div className="flex justify-between bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                    <span className="font-bold text-emerald-800">Valor Final (com desconto)</span>
                    <span className="font-bold text-emerald-600 text-lg">{fmt(valorTotal - Number(desconto.replace(',', '.')))}</span>
                  </div>
                )}

                <button onClick={handleSaveFatura} disabled={saving || !nfe || !dataVencimento}
                  className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm">
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><DollarSign className="h-5 w-5" /><span>Emitir Fatura</span></>}
                </button>
              </>
            )}
          </div>
        )}

        {/* TAB 2: Faturas Emitidas */}
        {activeTab === 'emitidas' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loadingFaturas ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 text-emerald-600 animate-spin" /></div>
            ) : faturas.length === 0 ? (
              <p className="text-gray-400 text-center py-12">Nenhuma fatura emitida.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    <th className="px-4 py-3">NF-e</th><th className="px-4 py-3">OS</th><th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3 text-right">Valor</th><th className="px-4 py-3 text-center">Vencimento</th>
                    <th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {faturas.map(f => (
                    <tr key={f.id_faturamento} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-4 py-3 text-sm font-bold text-gray-700">{f.numero_nota_fiscal}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">#{f.id_os}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{f.cliente}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-800 text-right">{fmt(Number(f.valor_servico) - Number(f.valor_desconto || 0))}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">{fmtDate(f.data_vencimento)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${f.status_pagamento === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {f.status_pagamento}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {f.status_pagamento === 'Pendente' && (
                          <div className="flex items-center justify-center space-x-1">
                            {payingId === f.id_faturamento ? (
                              <div className="flex items-center space-x-1">
                                <input type="text" placeholder="Valor pago" value={payValue} onChange={e => setPayValue(e.target.value)}
                                  className="w-24 px-2 py-1 border border-gray-200 rounded text-xs" />
                                <button onClick={() => handlePagar(f.id_faturamento)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="h-4 w-4" /></button>
                                <button onClick={() => { setPayingId(null); setPayValue(''); }} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X className="h-4 w-4" /></button>
                              </div>
                            ) : (
                              <>
                                <button onClick={() => setPayingId(f.id_faturamento)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-all text-xs font-bold" title="Registrar Pagamento">
                                  <Check className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleCancelar(f.id_faturamento)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all" title="Cancelar Fatura">
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
            )}
          </div>
        )}

        {/* TAB 3: Relatório */}
        {activeTab === 'relatorio' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center space-x-4">
              <label className="text-sm font-bold text-gray-600">Mês:</label>
              <select value={mesSel} onChange={e => setMesSel(Number(e.target.value))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{String(m).padStart(2,'0')}</option>)}
              </select>
              <label className="text-sm font-bold text-gray-600">Ano:</label>
              <select value={anoSel} onChange={e => setAnoSel(Number(e.target.value))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {[2024,2025,2026,2027].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {loadingRelatorio ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 text-emerald-600 animate-spin" /></div>
              ) : relatorio.length === 0 ? (
                <p className="text-gray-400 text-center py-12">Nenhum registro para o período selecionado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        <th className="px-3 py-3">OS</th><th className="px-3 py-3">NF-e</th><th className="px-3 py-3">Cliente</th>
                        <th className="px-3 py-3 text-center">Vencimento</th>
                        <th className="px-3 py-3 text-right">Faturamento</th><th className="px-3 py-3 text-right">Desconto</th>
                        <th className="px-3 py-3 text-right">Total Fat.</th><th className="px-3 py-3 text-right">Serviços</th>
                        <th className="px-3 py-3 text-right">Peças</th><th className="px-3 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {relatorio.map(r => (
                        <tr key={r.id_faturamento} className="hover:bg-gray-50/50 text-sm">
                          <td className="px-3 py-2 font-bold text-gray-700">#{r.id_os}</td>
                          <td className="px-3 py-2 text-gray-600">{r.numero_nota_fiscal}</td>
                          <td className="px-3 py-2 text-gray-600">{r.cliente}</td>
                          <td className="px-3 py-2 text-gray-500 text-center">{fmtDate(r.data_vencimento)}</td>
                          <td className="px-3 py-2 text-right font-medium">{fmt(r.valor_faturamento)}</td>
                          <td className="px-3 py-2 text-right text-red-500">{r.valor_desconto > 0 ? `-${fmt(r.valor_desconto)}` : '-'}</td>
                          <td className="px-3 py-2 text-right font-bold text-emerald-600">{fmt(r.valor_total_faturamento)}</td>
                          <td className="px-3 py-2 text-right text-gray-500">{fmt(r.total_servicos)}</td>
                          <td className="px-3 py-2 text-right text-gray-500">{fmt(r.total_pecas)}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.status_pagamento === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {r.status_pagamento}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold text-sm">
                        <td colSpan={4} className="px-3 py-3 text-gray-700">TOTAIS</td>
                        <td className="px-3 py-3 text-right">{fmt(relatorio.reduce((s, r) => s + r.valor_faturamento, 0))}</td>
                        <td className="px-3 py-3 text-right text-red-500">{fmt(relatorio.reduce((s, r) => s + r.valor_desconto, 0))}</td>
                        <td className="px-3 py-3 text-right text-emerald-600">{fmt(relatorio.reduce((s, r) => s + r.valor_total_faturamento, 0))}</td>
                        <td className="px-3 py-3 text-right">{fmt(relatorio.reduce((s, r) => s + r.total_servicos, 0))}</td>
                        <td className="px-3 py-3 text-right">{fmt(relatorio.reduce((s, r) => s + r.total_pecas, 0))}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Faturamento;