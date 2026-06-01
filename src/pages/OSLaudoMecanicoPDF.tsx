import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Printer, Loader2 } from 'lucide-react';
import { supabase } from '../config/supabase';
import logoCompleto from '../assets/logo_real_completo.png';
import tampaImg from '../assets/tampa.png';
import eixoImg from '../assets/eixo.png';

const OSLaudoMecanicoPDF: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [osData, setOsData] = useState<any>(null);
    const [laudoData, setLaudoData] = useState<any>(null);
    const [osServicos, setOsServicos] = useState<any[]>([]);
    const [osPecas, setOsPecas] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Buscar dados mestre da OS com Motor e Cliente
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
                            numero_polos,
                            rolamento_la,
                            rolamento_loa,
                            tensao_nominal,
                            corrente_nominal,
                            tag_cliente,
                            cliente (
                                id_cliente,
                                nome_razao_social
                            )
                        )
                    `)
                    .eq('id_os', Number(id))
                    .single();

                if (osRequest.error) throw osRequest.error;

                const osMapeada = {
                    ...osRequest.data,
                    motor: osRequest.data.motor,
                    cliente: (osRequest.data.motor as any)?.cliente
                };

                // 2. Buscar Laudo Mecânico
                const laudoRequest = await supabase
                    .from('os_laudo_mecanico')
                    .select('*')
                    .eq('id_os', Number(id))
                    .maybeSingle();

                if (laudoRequest.error) throw laudoRequest.error;

                // 3. Buscar Serviços e Peças da OS
                const [servicosReq, pecasReq] = await Promise.all([
                    supabase.from('os_servicos').select('*, servico:servico(*)').eq('id_os', Number(id)),
                    supabase.from('os_pecas').select('*, peca:pecas(*)').eq('id_os', Number(id)),
                ]);

                if (servicosReq.error) throw servicosReq.error;
                if (pecasReq.error) throw pecasReq.error;

                setOsData(osMapeada);
                setLaudoData(laudoRequest.data);
                setOsServicos(servicosReq.data || []);
                setOsPecas(pecasReq.data || []);

            } catch (error: any) {
                console.error('Erro ao buscar dados do laudo mecânico:', error.message || error);
                alert('Erro ao carregar dados do relatório mecânico.');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, navigate]);

    const handlePrint = () => {
        window.print();
    };

    // Formatador de medições: exibe com 3 casas decimais ou vazio
    const fmt = (val: any): string => {
        if (val === null || val === undefined) return '';
        const num = parseFloat(val);
        return isNaN(num) ? '' : num.toFixed(3);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 text-brand-blue animate-spin mx-auto" />
                    <p className="text-sm text-gray-500 font-medium">Carregando dados do relatório mecânico...</p>
                </div>
            </div>
        );
    }

    const motor = osData?.motor;
    const cliente = osData?.cliente;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row laudo-mec-layout">
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
                    @page { size: A4; margin: 8mm 10mm; }
                    .laudo-mec-layout { display: block !important; min-height: 0 !important; height: auto !important; background: white !important; }
                    .laudo-mec-container { display: block !important; background: white !important; padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
                    .laudo-mec-sheet {
                        display: block !important; width: 100% !important; max-width: 100% !important;
                        box-shadow: none !important; border: none !important; margin: 0 !important;
                        padding: 0 !important; background: white !important;
                    }
                    .laudo-mec-sheet table { page-break-inside: auto !important; }
                    .laudo-mec-sheet tr { page-break-inside: avoid !important; break-inside: avoid !important; }
                    h2, h3, .section-header { page-break-after: avoid !important; break-after: avoid !important; }
                }
                /* Estilos do Relatório Mecânico */
                .report-table { width: 100%; border-collapse: collapse; font-size: 10px; }
                .report-table th, .report-table td { border: 1px solid #333; padding: 3px 6px; }
                .report-table th { background-color: #d9d9d9; font-weight: bold; text-align: center; font-size: 9px; text-transform: uppercase; }
                .report-table td { text-align: center; }
                .report-table td.label-cell { text-align: left; font-weight: bold; background-color: #f5f5f5; }
                .section-header { background-color: #333; color: #fff; font-weight: bold; text-align: center; padding: 4px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
                .info-grid { display: grid; grid-template-columns: auto 1fr auto 1fr; font-size: 10px; border: 1px solid #333; }
                .info-grid > div { border: 1px solid #ccc; padding: 3px 6px; }
                .info-grid .info-label { font-weight: bold; background-color: #f5f5f5; white-space: nowrap; }
                .report-img { max-height: 120px; width: auto; object-fit: contain; margin: auto; }
            `}} />

            {/* Painel Esquerdo: Botão de Impressão (não imprime) */}
            <div className="no-print w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-6 flex flex-col justify-between shrink-0">
                <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200" title="Voltar">
                            <ChevronLeft className="h-5 w-5 text-gray-500" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-800">Relatório Mecânico - OS #{id}</h1>
                            <p className="text-xs text-gray-500">Visualização do laudo mecânico para impressão</p>
                        </div>
                    </div>

                    {/* Resumo de dados */}
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cliente</p>
                            <p className="text-sm font-bold text-gray-800">{cliente?.nome_razao_social || 'N/D'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Motor</p>
                            <p className="text-sm font-bold text-gray-800">{motor?.fabricante || ''} {motor?.modelo || ''}</p>
                            <p className="text-xs text-gray-500">S/N: {motor?.num_serie || 'N/D'}</p>
                        </div>
                        {!laudoData && (
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                                <p className="text-xs font-bold text-amber-700">⚠ Nenhum laudo mecânico foi cadastrado para esta OS.</p>
                                <p className="text-[10px] text-amber-600 mt-1">O relatório será gerado com campos em branco.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    <button onClick={handlePrint} className="w-full flex items-center justify-center space-x-2 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-bold shadow-lg shadow-brand-blue/20 active:scale-98 transition-all">
                        <Printer className="h-5 w-5" /> <span>Gerar PDF / Imprimir</span>
                    </button>
                    <p className="text-[10px] text-center text-gray-400">Selecione "Salvar como PDF" na caixa de diálogo de impressão para exportar o arquivo digital.</p>
                </div>
            </div>

            {/* Painel Direito: Relatório em formato papel */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto flex justify-center bg-gray-100 laudo-mec-container">
                <div className="laudo-mec-sheet w-[210mm] min-h-[297mm] bg-white p-8 shadow-xl border border-gray-200 flex flex-col">

                    {/* === CABEÇALHO === */}
                    <div className="flex items-start justify-between border-b-2 border-gray-800 pb-3 mb-4">
                        <div className="flex items-center space-x-3">
                            <img src={logoCompleto} alt="Real Serviços" className="h-14 w-auto object-contain" />
                        </div>
                        <div className="text-right">
                            <h2 className="text-base font-black text-gray-800 tracking-wide">Relatório Mecânico - CA</h2>
                            <p className="text-[9px] text-gray-500 mt-1">Página: <strong>1</strong></p>
                        </div>
                    </div>

                    {/* === DADOS DA OS / MOTOR === */}
                    <div className="mb-3">
                        <div className="info-grid">
                            <div className="info-label">Cliente:</div>
                            <div style={{ gridColumn: 'span 3' }}>{cliente?.nome_razao_social || ''}</div>

                            <div className="info-label">Tag Motor:</div>
                            <div>{motor?.tag_cliente || ''}</div>
                            <div className="info-label">Tag Cliente:</div>
                            <div>{motor?.tag_cliente || ''}</div>

                            <div className="info-label">Descrição:</div>
                            <div style={{ gridColumn: 'span 3' }}>{motor?.especificacao || ''}</div>

                            <div className="info-label">Motivo da Manutenção:</div>
                            <div>{osData?.causa_texto || osData?.observacoes_gerais || ''}</div>
                            <div className="info-label">Motor:</div>
                            <div>CA</div>

                            <div className="info-label">Potência:</div>
                            <div>{motor?.potencia_cv_kw || ''} {motor?.unidade_cv_kw || 'CV'}</div>
                            <div className="info-label">Fabricante:</div>
                            <div style={{ gridColumn: 'span 1' }}>{motor?.fabricante || ''}</div>

                            <div className="info-label">Modelo:</div>
                            <div>{motor?.modelo || ''}</div>
                            <div className="info-label">Nº Polos:</div>
                            <div>{motor?.numero_polos || ''}</div>

                            <div className="info-label">Nº Série:</div>
                            <div>{motor?.num_serie || ''}</div>
                            <div className="info-label">Tipo Manutenção:</div>
                            <div>Corretiva</div>

                            <div className="info-label">Regime:</div>
                            <div>Normal</div>
                            <div className="info-label">Data Entrada:</div>
                            <div>{osData?.data_entrada ? new Date(osData.data_entrada).toLocaleDateString('pt-BR') : ''}</div>

                            <div className="info-label">Data Saída:</div>
                            <div style={{ gridColumn: 'span 3' }}>{osData?.data_saida ? new Date(osData.data_saida).toLocaleDateString('pt-BR') : ''}</div>
                        </div>
                    </div>

                    {/* === SEÇÃO TAMPAS + EIXO (lado a lado) === */}
                    <div className="grid grid-cols-2 gap-3 mb-3">

                        {/* TAMPAS */}
                        <div>
                            <div className="section-header">TAMPAS</div>
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '20%' }}></th>
                                        <th>Especificado</th>
                                        <th>Encontrado</th>
                                        <th>Deixado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="label-cell">LA</td>
                                        <td>{fmt(laudoData?.tampa_la_especificado)}</td>
                                        <td>{fmt(laudoData?.tampa_la_encontrado)}</td>
                                        <td>{fmt(laudoData?.tampa_la_deixado)}</td>
                                    </tr>
                                    <tr>
                                        <td className="label-cell">LOA</td>
                                        <td>{fmt(laudoData?.tampa_loa_especificado)}</td>
                                        <td>{fmt(laudoData?.tampa_loa_encontrado)}</td>
                                        <td>{fmt(laudoData?.tampa_loa_deixado)}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="flex justify-center border border-gray-300 border-t-0 p-2 bg-white">
                                <img src={tampaImg} alt="Tampa" className="report-img" />
                            </div>
                        </div>

                        {/* EIXO */}
                        <div>
                            <div className="section-header">EIXO</div>
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '30%' }}>Pista do Rolamento</th>
                                        <th>Especificado</th>
                                        <th>Encontrado</th>
                                        <th>Deixado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="label-cell">LA</td>
                                        <td>{fmt(laudoData?.eixo_la_especificado)}</td>
                                        <td>{fmt(laudoData?.eixo_la_encontrado)}</td>
                                        <td>{fmt(laudoData?.eixo_la_deixado)}</td>
                                    </tr>
                                    <tr>
                                        <td className="label-cell">LOA</td>
                                        <td>{fmt(laudoData?.eixo_loa_especificado)}</td>
                                        <td>{fmt(laudoData?.eixo_loa_encontrado)}</td>
                                        <td>{fmt(laudoData?.eixo_loa_deixado)}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="flex justify-center border border-gray-300 border-t-0 p-2 bg-white">
                                <img src={eixoImg} alt="Eixo" className="report-img" />
                            </div>
                        </div>
                    </div>

                    {/* === ACOPLAMENTO + VENTOINHA (mesma linha) === */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* ACOPLAMENTO */}
                        <div>
                            <div className="section-header">ACOPLAMENTO</div>
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        <th>Pista de Assentamento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div className="grid grid-cols-3 gap-0 text-[9px]">
                                                <div>
                                                    <div className="font-bold text-gray-500 mb-1">Encontrado</div>
                                                    <div>{fmt(laudoData?.acoplamento_encontrado)}</div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-500 mb-1">Deixado</div>
                                                    <div>{fmt(laudoData?.acoplamento_deixado)}</div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-500 mb-1">Diâm. Interno</div>
                                                    <div>{fmt(laudoData?.acoplamento_diam_interno)}</div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* VENTOINHA */}
                        <div>
                            <div className="section-header">VENTOINHA</div>
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        <th>Pista de Assentamento</th>
                                        <th style={{ width: '35%' }}>Dist. acop/polia à ponta do eixo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div className="grid grid-cols-3 gap-0 text-[9px]">
                                                <div>
                                                    <div className="font-bold text-gray-500 mb-1">Encontrado</div>
                                                    <div>{fmt(laudoData?.ventoinha_encontrado)}</div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-500 mb-1">Deixado</div>
                                                    <div>{fmt(laudoData?.ventoinha_deixado)}</div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-500 mb-1">Diâm. Interno</div>
                                                    <div>{fmt(laudoData?.ventoinha_diam_interno)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center font-bold">
                                            {fmt(laudoData?.dist_acop_polia_ponta_eixo)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* === ROLAMENTOS === */}
                    <div className="mb-3">
                        <div className="section-header">ROLAMENTOS</div>
                        <table className="report-table">
                            <tbody>
                                <tr>
                                    <td className="label-cell" style={{ width: '15%' }}>LA:</td>
                                    <td style={{ width: '35%' }}>{motor?.rolamento_la || ''}</td>
                                    <td className="label-cell" style={{ width: '15%' }}>LOA:</td>
                                    <td style={{ width: '35%' }}>{motor?.rolamento_loa || ''}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* === SERVIÇOS REALIZADOS + PEÇAS SUBSTITUÍDAS (lado a lado) === */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* SERVIÇOS */}
                        <div>
                            <div className="section-header">SERVIÇOS REALIZADOS</div>
                            <div className="border border-gray-300 min-h-[80px] p-2 text-[10px] leading-relaxed">
                                {osServicos.length > 0 ? (
                                    <ul className="list-none space-y-0.5">
                                        {osServicos.map((item, idx) => (
                                            <li key={item.id_osservicos || idx}>
                                                {item.servico?.descricao_servico || 'Serviço'}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-400 italic">Nenhum serviço registrado.</p>
                                )}
                            </div>
                        </div>

                        {/* PEÇAS */}
                        <div>
                            <div className="section-header">PEÇAS SUBSTITUÍDAS</div>
                            <div className="border border-gray-300 min-h-[80px] p-2 text-[10px] leading-relaxed">
                                {osPecas.length > 0 ? (
                                    <ul className="list-none space-y-0.5">
                                        {osPecas.map((item, idx) => (
                                            <li key={item.id_ospecas || idx}>
                                                {item.peca?.descricao_pecas || 'Peça'}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-400 italic">Nenhuma peça substituída.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* === OBSERVAÇÕES === */}
                    <div className="mb-4">
                        <div className="section-header">OBSERVAÇÕES</div>
                        <div className="border border-gray-300 min-h-[60px] p-2 text-[10px] leading-relaxed whitespace-pre-wrap">
                            {laudoData?.observacoes || ''}
                        </div>
                    </div>

                    {/* === RODAPÉ === */}
                    <div className="mt-auto pt-4 border-t border-gray-300 flex justify-between items-end text-[9px] text-gray-500">
                        <div>
                            <p className="font-bold text-gray-700">Real Serviços Eletromecânicos e Com Ltda.</p>
                        </div>
                        <div className="text-right">
                            <p>{new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OSLaudoMecanicoPDF;
