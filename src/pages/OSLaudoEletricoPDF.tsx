import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Printer, Loader2 } from 'lucide-react';
import { supabase } from '../config/supabase';
import logoCompleto from '../assets/logo_real_completo.png';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

const OSLaudoEletricoPDF: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [osData, setOsData] = useState<any>(null);
    const [laudoData, setLaudoData] = useState<any>(null);
    

    useEffect(() => {
        const fetchData = async () => {
            try {
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
                            tag_cliente,
                            corrente_nominal,
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

                const laudoRequest = await supabase
                    .from('os_laudo_eletrico')
                    .select('*')
                    .eq('id_os', Number(id))
                    .maybeSingle();

                if (laudoRequest.error) throw laudoRequest.error;

                setOsData(osMapeada);
                setLaudoData(laudoRequest.data);

            } catch (error: any) {
                console.error('Erro ao buscar dados do laudo elétrico:', error.message || error);
                alert('Erro ao carregar dados do relatório elétrico.');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, navigate]);

    const handlePrint = () => window.print();

    const fmt = (val: any) => {
        if (val === null || val === undefined) return '';
        const num = parseFloat(val);
        return isNaN(num) ? '' : Number(num).toString();
    };

    const fmt2 = (val: any) => {
        if (val === null || val === undefined) return '';
        const num = Number(String(val).replace(',', '.'));
        if (!Number.isFinite(num)) return '';
        return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
    };

    const toNumeric = (val: any) => {
        if (val === null || val === undefined) return 0;
        const n = Number(String(val).toString().replace(',', '.'));
        return Number.isFinite(n) ? n : 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 text-brand-blue animate-spin mx-auto" />
                    <p className="text-sm text-gray-500 font-medium">Carregando dados do relatório elétrico...</p>
                </div>
            </div>
        );
    }

    const motor = osData?.motor;
    const cliente = osData?.cliente;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row laudo-elec-layout">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    body, html { background: white !important; color: black !important; margin: 0 !important; padding: 0 !important; }
                    @page { size: A4; margin: 8mm 10mm; }
                    .laudo-elec-container { display: block !important; width: 100% !important; }
                }
                .info-grid { display: grid; grid-template-columns: auto 1fr auto 1fr; font-size: 10px; border: 1px solid #333; }
                .info-grid > div { border: 1px solid #ccc; padding: 3px 6px; }
                .info-grid .info-label { font-weight: bold; background-color: #f5f5f5; white-space: nowrap; }
                .section-header { background-color: #333; color: #fff; font-weight: bold; text-align: center; padding: 4px; font-size: 10px; text-transform: uppercase; }
                .report-table { width: 100%; border-collapse: collapse; font-size: 10px; }
                .report-table th, .report-table td { border: 1px solid #333; padding: 6px; }
            `}} />

            <div className="no-print w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-6 flex flex-col justify-between shrink-0">
                <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200" title="Voltar">
                            <ChevronLeft className="h-5 w-5 text-gray-500" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-800">Relatório Elétrico - OS #{id}</h1>
                            <p className="text-xs text-gray-500">Visualização do laudo elétrico para impressão</p>
                        </div>
                    </div>

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
                                <p className="text-xs font-bold text-amber-700">⚠ Nenhum laudo elétrico foi cadastrado para esta OS.</p>
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

            <div className="flex-1 p-4 md:p-8 overflow-y-auto flex justify-center bg-gray-100 laudo-elec-container">
                <div className="w-[210mm] min-h-[297mm] bg-white p-8 shadow-xl border border-gray-200 flex flex-col">
                    <div className="flex items-start justify-between border-b-2 border-gray-800 pb-3 mb-4">
                        <div className="flex items-center space-x-3">
                            <img src={logoCompleto} alt="Real Serviços" className="h-14 w-auto object-contain" />
                        </div>
                        <div className="text-right">
                            <h2 className="text-base font-black text-gray-800 tracking-wide">Relatório Elétrico</h2>
                            <p className="text-[9px] text-gray-500 mt-1">Página: <strong>1</strong></p>
                        </div>
                    </div>

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

                    {/* Corrente (linha completa) */}
                    <div className="mb-3">
                        <div className="section-header">CORRENTE (A)</div>
                        <div className="flex gap-3">
                            <div style={{ minWidth: 160 }}>
                                <table className="report-table">
                                    <thead>
                                        <tr><th>Fase</th><th>Valor (A)</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="font-bold">Nominal</td>
                                            <td>{fmt2(motor?.corrente_nominal ?? laudoData?.corrente_saida_r)}</td>
                                        </tr>
                                        <tr><td>R</td><td>{fmt(laudoData?.corrente_saida_r)}</td></tr>
                                        <tr><td>S</td><td>{fmt(laudoData?.corrente_saida_s)}</td></tr>
                                        <tr><td>T</td><td>{fmt(laudoData?.corrente_saida_t)}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex-1 bg-white" style={{ height: 180 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            { name: 'Nominal', value: toNumeric(motor?.corrente_nominal ?? laudoData?.corrente_saida_r ?? 0) },
                                            { name: 'R', value: toNumeric(laudoData?.corrente_saida_r ?? 0) },
                                            { name: 'S', value: toNumeric(laudoData?.corrente_saida_s ?? 0) },
                                            { name: 'T', value: toNumeric(laudoData?.corrente_saida_t ?? 0) },
                                        ]}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" name="A" fill="#ef4444" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Resistência (linha completa) */}
                    <div className="mb-3">
                        <div className="section-header">RESISTÊNCIA (Ohm)</div>
                        <div className="flex gap-3">
                            <div style={{ minWidth: 200 }}>
                                <table className="report-table w-full">
                                    <thead>
                                        <tr><th>Fase</th><th>Entrada (Ω)</th><th>Saída (Ω)</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>R</td><td>{fmt(laudoData?.resistencia_entrada_r)}</td><td>{fmt(laudoData?.resistencia_saida_r)}</td></tr>
                                        <tr><td>S</td><td>{fmt(laudoData?.resistencia_entrada_s)}</td><td>{fmt(laudoData?.resistencia_saida_s)}</td></tr>
                                        <tr><td>T</td><td>{fmt(laudoData?.resistencia_entrada_t)}</td><td>{fmt(laudoData?.resistencia_saida_t)}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex-1 bg-white" style={{ height: 180 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            { name: 'R', entrada: toNumeric(laudoData?.resistencia_entrada_r ?? 0), saida: toNumeric(laudoData?.resistencia_saida_r ?? 0) },
                                            { name: 'S', entrada: toNumeric(laudoData?.resistencia_entrada_s ?? 0), saida: toNumeric(laudoData?.resistencia_saida_s ?? 0) },
                                            { name: 'T', entrada: toNumeric(laudoData?.resistencia_entrada_t ?? 0), saida: toNumeric(laudoData?.resistencia_saida_t ?? 0) },
                                        ]}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="entrada" name="Entrada" fill="#3b82f6" />
                                        <Bar dataKey="saida" name="Saída" fill="#ef4444" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Isolação (linha completa) */}
                    <div className="mb-3">
                        <div className="section-header">ISOLAÇÃO (MΩ)</div>
                        <div className="flex gap-3">
                            <div style={{ minWidth: 160 }}>
                                <table className="report-table">
                                    <thead>
                                        <tr><th>Fase</th><th>Entrada</th><th>Saída</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>R</td><td>{fmt(laudoData?.isolacao_entrada_r)}</td><td>{fmt(laudoData?.isolacao_saida_r)}</td></tr>
                                        <tr><td>S</td><td>{fmt(laudoData?.isolacao_entrada_s)}</td><td>{fmt(laudoData?.isolacao_saida_s)}</td></tr>
                                        <tr><td>T</td><td>{fmt(laudoData?.isolacao_entrada_t)}</td><td>{fmt(laudoData?.isolacao_saida_t)}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex-1 bg-white" style={{ height: 180 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            { name: 'R', entrada: toNumeric(laudoData?.isolacao_entrada_r ?? 0), saida: toNumeric(laudoData?.isolacao_saida_r ?? 0) },
                                            { name: 'S', entrada: toNumeric(laudoData?.isolacao_entrada_s ?? 0), saida: toNumeric(laudoData?.isolacao_saida_s ?? 0) },
                                            { name: 'T', entrada: toNumeric(laudoData?.isolacao_entrada_t ?? 0), saida: toNumeric(laudoData?.isolacao_saida_t ?? 0) },
                                        ]}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="entrada" name="Entrada" fill="#3b82f6" />
                                        <Bar dataKey="saida" name="Saída" fill="#ef4444" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className="section-header">Resistência (Ω)</div>
                        <div className="flex gap-3">
                            <div style={{ minWidth: 200 }}>
                                <table className="report-table w-full">
                                    <thead>
                                        <tr><th>Fase</th><th>Entrada (Ω)</th><th>Saída (Ω)</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>R</td><td>{fmt(laudoData?.resistencia_entrada_r)}</td><td>{fmt(laudoData?.resistencia_saida_r)}</td></tr>
                                        <tr><td>S</td><td>{fmt(laudoData?.resistencia_entrada_s)}</td><td>{fmt(laudoData?.resistencia_saida_s)}</td></tr>
                                        <tr><td>T</td><td>{fmt(laudoData?.resistencia_entrada_t)}</td><td>{fmt(laudoData?.resistencia_saida_t)}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex-1 bg-white" style={{ height: 180 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            { name: 'R', entrada: Number(laudoData?.resistencia_entrada_r ?? 0), saida: Number(laudoData?.resistencia_saida_r ?? 0) },
                                            { name: 'S', entrada: Number(laudoData?.resistencia_entrada_s ?? 0), saida: Number(laudoData?.resistencia_saida_s ?? 0) },
                                            { name: 'T', entrada: Number(laudoData?.resistencia_entrada_t ?? 0), saida: Number(laudoData?.resistencia_saida_t ?? 0) },
                                        ]}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="entrada" name="Entrada" fill="#3b82f6" />
                                        <Bar dataKey="saida" name="Saída" fill="#ef4444" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    

                    <div className="mb-4">
                        <div className="section-header">Observações</div>
                        <div className="border border-gray-300 min-h-[60px] p-2 text-[10px] leading-relaxed whitespace-pre-wrap">
                            {laudoData?.observacoes || ''}
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-300 flex justify-between items-end text-[9px] text-gray-500">
                        <div>
                            <p className="font-bold text-gray-700">Real Serviços Eletromecânicos e Com Ltda.</p>
                        </div>
                        <div className="text-right">
                            <p>{new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OSLaudoEletricoPDF;
