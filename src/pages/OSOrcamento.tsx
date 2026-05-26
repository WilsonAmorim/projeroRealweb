

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Printer, Loader2, Calendar, Award, FileText } from 'lucide-react';
import { supabase } from '../config/supabase'; // Importação do cliente do Supabase
import logoCompleto from '../assets/logo_real_completo.png';

const OSOrcamento: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [osData, setOsData] = useState<any>(null);
    const [osServicos, setOsServicos] = useState<any[]>([]);
    const [osPecas, setOsPecas] = useState<any[]>([]);
    const [osRebobinamentos, setOsRebobinamentos] = useState<any[]>([]);

    // Commercial Terms States
    const [prazoExecucao, setPrazoExecucao] = useState('5');
    const [garantia, setGarantia] = useState('6');
    const [validadeProposta, setValidadeProposta] = useState('10');

    // RESTRUTURADO: Carregamento de dados usando o Supabase Client
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Busca os dados mestre da OS trazendo Motor e Cliente via JOIN nativo
                const osRequest = await supabase
                    .from('ordens_servico')
                    .select(`
                        *,
                        motor:motores (
                            num_serie,
                            fabricante,
                            modelo,
                            potencia_cv_kw,
                            unidade_cv_kw,
                            especificacao,
                            cliente (
                                id_cliente,
                                nome_razao_social
                            )
                        )
                    `)
                    .eq('id_os', Number(id))
                    .single();

                if (osRequest.error) throw osRequest.error;

                // Remapeia a estrutura para manter a compatibilidade com o formato original do seu HTML
                const osMapeada = {
                    ...osRequest.data,
                    motor: osRequest.data.motor,
                    cliente: (osRequest.data.motor as any)?.cliente
                };

                // 2. Busca os itens lançados (Peças, Serviços e Rebobinamentos) nas tabelas pivot
                const [servicosRequest, pecasRequest, rebobinamentosRequest] = await Promise.all([
                    supabase.from('os_servicos').select('*, servico:servico(*)').eq('id_os', Number(id)),
                    supabase.from('os_pecas').select('*, peca:pecas(*)').eq('id_os', Number(id)),
                    supabase.from('os_rebobinamentos').select('*, rebobinamento:rebobinamentos(*)').eq('id_os', Number(id))
                ]);

                if (servicosRequest.error) throw servicosRequest.error;
                if (pecasRequest.error) throw pecasRequest.error;
                if (rebobinamentosRequest.error) throw rebobinamentosRequest.error;

                // Alimenta os estados mantendo os fallbacks originais do seu código
                setOsData(osMapeada);
                setOsServicos(servicosRequest.data || []);
                setOsPecas(pecasRequest.data || []);
                setOsRebobinamentos(rebobinamentosRequest.data || []);

            } catch (error: any) {
                console.error('Erro ao buscar dados do orçamento no Supabase:', error.message || error);
                alert('Erro ao carregar dados do orçamento.');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, navigate]);

    // Lógica de cálculo de impostos e subtotais com fallback para diferentes nomes de campo
    const getItemPrice = (item: any) => {
        const raw = item?.preco ?? item?.valor_unitario ?? item?.valor ?? 0;
        const n = Number(raw);
        return Number.isFinite(n) ? n : 0;
    };

    const subtotalServicos = osServicos.reduce((acc, item) => acc + getItemPrice(item), 0) + osRebobinamentos.reduce((acc, item) => acc + getItemPrice(item), 0);
    const impostoServicos = subtotalServicos * 0.05;
    const subtotalPecas = osPecas.reduce((acc, item) => acc + getItemPrice(item), 0);
    const impostoPecas = subtotalPecas * 0.205;
    const totalOS = subtotalServicos + impostoServicos + subtotalPecas + impostoPecas;

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 text-brand-blue animate-spin mx-auto" />
                    <p className="text-sm text-gray-500 font-medium">Carregando dados do orçamento...</p>
                </div>
            </div>
        );
    }

    const motor = osData?.motor;
    const cliente = osData?.cliente;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row main-layout-container">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    body, html {
                        background: white !important;
                        color: black !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page { size: A4; margin: 0 !important; }
                    .main-layout-container { display: block !important; min-height: 0 !important; height: auto !important; background: white !important; }
                    .print-container { display: block !important; background: white !important; background-color: white !important; padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; height: auto !important; min-height: 0 !important; }
                    .print-sheet {
                        display: block !important; width: 100% !important; max-width: 100% !important; box-shadow: none !important; border: none !important; margin: 0 !important; min-height: auto !important;
                        padding-left: 20mm !important; padding-right: 20mm !important; padding-top: 0 !important; padding-bottom: 0 !important; background: white !important;
                    }
                    thead { display: table-header-group !important; }
                    thead tr { page-break-inside: avoid !important; break-inside: avoid !important; }
                    .print-sheet > table > tbody > tr { page-break-inside: auto !important; break-inside: auto !important; }
                    .print-sheet tbody table tr { page-break-inside: avoid !important; break-inside: avoid !important; }
                    h2, h3 { page-break-after: avoid !important; break-after: avoid !important; }
                }
            `}} />

            {/* Painel Esquerdo: Controles Comerciais (.no-print) */}
            <div className="no-print w-full lg:w-96 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-6 flex flex-col justify-between shrink-0">
                <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200" title="Voltar">
                            <ChevronLeft className="h-5 w-5 text-gray-500" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-800">Orçamento O.S. #{id}</h1>
                            <p className="text-xs text-gray-500">Configuração das condições comerciais</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1 text-brand-blue" /> Prazo de Execução (Dias Úteis)
                            </label>
                            <input type="number" min="1" value={prazoExecucao} onChange={(e) => setPrazoExecucao(e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                                <Award className="h-3.5 w-3.5 mr-1 text-brand-blue" /> Garantia (Meses)
                            </label>
                            <input type="number" min="0" value={garantia} onChange={(e) => setGarantia(e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                                <FileText className="h-3.5 w-3.5 mr-1 text-brand-blue" /> Validade da Proposta (Dias)
                            </label>
                            <input type="number" min="1" value={validadeProposta} onChange={(e) => setValidadeProposta(e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none" />
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    <button onClick={handlePrint} className="w-full flex items-center justify-center space-x-2 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-bold shadow-lg shadow-brand-blue/20 active:scale-98 transition-all">
                        <Printer className="h-5 w-5" /> <span>Gerar PDF / Imprimir</span>
                    </button>
                    <p className="text-[10px] text-center text-gray-400">Selecione "Salvar como PDF" na caixa de diálogo de impressão para exportar o arquivo digital.</p>
                </div>
            </div>

            {/* Painel Direito: Simulação da Proposta em Papel A4 */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto flex justify-center bg-gray-100 print-container">
                <div className="print-sheet w-[210mm] min-h-[297mm] bg-white p-12 flex flex-col justify-between">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <td className="p-0 border-none">
                                    <div className="hidden print:block h-[15mm] w-full" />
                                    <div className="flex flex-col items-center border-b-2 border-gray-800 pb-6 mb-6">
                                        <img src={logoCompleto} alt="Real Serviços" className="h-16 w-auto object-contain mb-2" />
                                        <h2 className="text-sm font-black text-gray-800 tracking-widest uppercase">Real Serviços Eletromecânicos e Com Ltda</h2>
                                        <p className="text-[10px] text-gray-500">Manutenção Industrial - Rebobinamento de Motores</p>
                                    </div>
                                </td>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <td className="p-0 border-none">
                                    <div className="hidden print:block h-[15mm] w-full" />
                                </td>
                            </tr>
                        </tfoot>
                        <tbody>
                            <tr>
                                <td className="p-0 border-none">
                                    <div className="space-y-4 mb-6">
                                        <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg flex justify-between items-center">
                                            <span className="text-xs font-black text-gray-700 uppercase tracking-wide">Assunto: Orçamento para Manutenção de Equipamento - OS #{id}</span>
                                            <span className="text-[10px] text-gray-400 font-semibold">{new Date(osData?.data_entrada || Date.now()).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        <p className="text-sm text-gray-800 leading-relaxed">Prezado(a) <strong className="font-bold">{cliente?.nome_razao_social || 'Cliente'}</strong>,</p>
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 border border-gray-200 p-4 rounded-lg gap-4">
                                            <p className="text-xs text-gray-600 leading-relaxed">Conforme solicitado, apresentamos o orçamento referente aos serviços de manutenção/rebobinamento do motor elétrico informado.</p>
                                            <div className="text-left sm:text-right shrink-0 bg-white border border-gray-200 px-4 py-2 rounded-md shadow-sm">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Valor do Orçamento</span>
                                                <span className="text-lg font-black text-brand-blue">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOS)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 1. Identificação do Equipamento */}
                                    <div className="space-y-2 mb-6">
                                        <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">1. Identificação do Equipamento</h3>
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                                            <p className="text-gray-600"><strong className="font-semibold text-gray-800">Equipamento:</strong> Motor Elétrico</p>
                                            <p className="text-gray-600"><strong className="font-semibold text-gray-800">Marca/Modelo:</strong> {motor?.fabricante || 'Não Informado'} {motor?.modelo ? `/ ${motor.modelo}` : ''}</p>
                                            <p className="text-gray-600"><strong className="font-semibold text-gray-800">Número de Série:</strong> {motor?.num_serie || 'N/D'}</p>
                                            <p className="text-gray-600"><strong className="font-semibold text-gray-800">Potência/Especificação:</strong> {motor?.potencia_cv_kw ? `${motor.potencia_cv_kw} ${motor.unidade_cv_kw || 'CV/kW'}` : 'Não Informado'} {motor?.especificacao ? `- ${motor.especificacao}` : ''}</p>
                                        </div>
                                    </div>

                                    {/* 2. Diagnóstico Técnico */}
                                    <div className="space-y-2 mb-6">
                                        <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">2. Diagnóstico Técnico</h3>
                                        <div className="text-xs space-y-2 leading-relaxed">
                                            <p className="text-gray-600"><strong className="font-semibold text-gray-800">Causa provável da queima:</strong> {osData?.causa_texto}</p>
                                            {osData?.observacoes_gerais && <p className="text-gray-600"><strong className="font-semibold text-gray-800">Parecer Técnico:</strong> {osData.observacoes_gerais}</p>}
                                        </div>
                                    </div>

                                    {/* 3. Serviços Rebobinamento */}
                                    <div className="space-y-2 mb-6">
                                        <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">3. Serviços Rebobinamento</h3>
                                        <table className="w-full text-xs text-left">
                                            <thead>
                                                <tr className="border-b border-gray-300 font-bold text-gray-700">
                                                    <th className="py-2">Descrição</th><th className="py-2 text-right w-32">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {osRebobinamentos.length > 0 ? (
                                                    osRebobinamentos.map((item) => {
                                                        const rebobObj = item.rebobinamento;
                                                        const desc = rebobObj?.descricao_rebobinamento || 'Serviço de Rebobinamento';
                                                        const specs = [rebobObj?.cv && `${rebobObj.cv} CV`, rebobObj?.polos && `${rebobObj.polos} Polos`].filter(Boolean).join(' - ');
                                                        return (
                                                            <tr key={item.id_osrebobinamento} className="text-gray-600">
                                                                <td className="py-2 font-medium">{specs ? `${desc} (${specs})` : desc}</td>
                                                                <td className="py-2 text-right font-bold text-gray-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.preco))}</td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : <tr className="text-gray-400 italic"><td className="py-2" colSpan={2}>Nenhum serviço de rebobinamento lançado.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* 4. Serviços Adicionais */}
                                    <div className="space-y-2 mb-6">
                                        <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">4. Serviços</h3>
                                        <table className="w-full text-xs text-left">
                                            <thead>
                                                <tr className="border-b border-gray-300 font-bold text-gray-700">
                                                    <th className="py-2">Descrição</th><th className="py-2 text-right w-32">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {osServicos.length > 0 ? (
                                                    osServicos.map((item) => (
                                                        <tr key={item.id_osservicos} className="text-gray-600">
                                                            <td className="py-2 font-medium">{item.servico?.descricao_servico || 'Serviço Geral'}</td>
                                                            <td className="py-2 text-right font-bold text-gray-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.preco))}</td>
                                                        </tr>
                                                    ))
                                                ) : <tr className="text-gray-400 italic"><td className="py-2" colSpan={2}>Nenhum serviço geral lançado.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* 5. Peças/Materiais */}
                                    <div className="space-y-2 mb-6">
                                        <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">5. Peças/Materiais</h3>
                                        <table className="w-full text-xs text-left">
                                            <thead>
                                                <tr className="border-b border-gray-300 font-bold text-gray-700">
                                                    <th className="py-2">Descrição</th><th className="py-2 text-right w-32">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {osPecas.length > 0 ? (
                                                    osPecas.map((item) => (
                                                        <tr key={item.id_ospecas} className="text-gray-600">
                                                            <td className="py-2 font-medium">{item.peca?.descricao_pecas || 'Peça / Material'}</td>
                                                            <td className="py-2 text-right font-bold text-gray-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.preco))}</td>
                                                        </tr>
                                                    ))
                                                ) : <tr className="text-gray-400 italic"><td className="py-2" colSpan={2}>Nenhuma peça substituída.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Resumo de Valores */}
                                    <div className="space-y-2 mb-6 page-break-inside-avoid">
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col items-end space-y-1">
                                            <div className="flex justify-between w-full sm:w-2/3 md:w-1/2 text-xs">
                                                <span className="font-semibold text-gray-600">Sub-total Serviços:</span>
                                                <span className="font-bold text-gray-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotalServicos)}</span>
                                            </div>
                                            <div className="flex justify-between w-full sm:w-2/3 md:w-1/2 text-xs text-gray-500 pb-1 border-b border-gray-100">
                                                <span>+ Imposto Serviços (ISS 5%):</span>
                                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(impostoServicos)}</span>
                                            </div>
                                            <div className="flex justify-between w-full sm:w-2/3 md:w-1/2 text-xs pt-1">
                                                <span className="font-semibold text-gray-600">Sub-total Peças/Materiais:</span>
                                                <span className="font-bold text-gray-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotalPecas)}</span>
                                            </div>
                                            <div className="flex justify-between w-full sm:w-2/3 md:w-1/2 text-xs text-gray-500 pb-1">
                                                <span>+ Imposto Peças (ICMS 20,5%):</span>
                                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(impostoPecas)}</span>
                                            </div>
                                            <div className="flex justify-between w-full sm:w-2/3 md:w-1/2 text-sm border-t border-gray-200 pt-2 mt-2">
                                                <span className="font-bold text-gray-800 uppercase">Total Geral:</span>
                                                <span className="font-black text-brand-blue">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOS)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 6. Condições Comerciais */}
                                    <div className="space-y-3 mb-8 pt-4 border-t border-gray-200">
                                        <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">6. Condições Comerciais</h3>
                                        <div className="space-y-2 text-xs">
                                            <p className="text-gray-600"><strong className="font-semibold text-gray-800">Prazo de Execução:</strong> {prazoExecucao} dias úteis após aprovação.</p>
                                            <p className="text-gray-600"><strong className="font-semibold text-gray-800">Garantia:</strong> {garantia} meses sobre os serviços e peças.</p>
                                            <p className="text-gray-600"><strong className="font-semibold text-gray-800">Validade da Proposta:</strong> {validadeProposta} dias a contar desta data.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Rodapé da Proposta */}
                    <div className="space-y-4 border-t border-gray-200 pt-6 mt-6">
                        <p className="text-[10px] text-gray-500 leading-relaxed text-center">
                            Para autorizar a execução dos serviços ou caso tenha qualquer dúvida técnica, basta responder a este e-mail / <strong className="font-semibold text-gray-700">realserv@terra.com.br</strong> ou entrar em contato conosco pelo telefone <strong className="font-semibold text-gray-700">(71) 3369-1880 / 3369-1881</strong>.
                        </p>
                        <p className="text-[10px] text-gray-400 text-center font-medium italic">Ficamos no aguardo de sua avaliação para darmos andamento ao serviço.</p>
                        <div className="flex justify-between items-end pt-4">
                            <div className="text-left text-[9px] text-gray-400">
                                <p className="font-bold">Real Serviços Eletromecânicos e Com Ltda</p>
                                <p>CNPJ: 13.798.996/0001-74</p>
                                <p>Endereço: Lauro de Freitas, BA</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-700">Departamento de Assistência Técnica</p>
                                <p className="text-[10px] text-gray-400">Real Serviços</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OSOrcamento;