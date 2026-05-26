import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase'; // Importação do cliente do Supabase
import { Save, ChevronLeft, ClipboardCheck, Loader2, AlertTriangle, FileText } from 'lucide-react';

const UpdateOSForm: React.FC = () => {
    const { id } = useParams(); // ID da Ordem de Serviço
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados do Formulário
    const [idAndamento, setIdAndamento] = useState('');
    const [idCausaQueima, setIdCausaQueima] = useState('');
    const [obsTecnicas, setObsTecnicas] = useState('');
    const [dadosOS, setDadosOS] = useState<any>(null);
    const [listaAndamentos, setListaAndamentos] = useState<any[]>([]);
    const [listaCausas, setListaCausas] = useState<any[]>([]);

    // RESTRUTURADO: Carregar dados atuais da OS, andamentos e causas usando Supabase
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Busca os dados mestres e as tabelas de referência em paralelo
                const [osResponse, andamentosResponse, causasResponse] = await Promise.all([
                    supabase
                        .from('ordens_servico')
                        .select('*, cliente(nome_razao_social), motor:motores(num_serie)')
                        .eq('id_os', Number(id))
                        .single(),
                    supabase.from('andamento_servico').select('*').order('descricao_andamento'),
                    supabase.from('causa_queima').select('*').order('descricao_causa')
                ]);

                if (osResponse.error) throw osResponse.error;
                if (andamentosResponse.error) throw andamentosResponse.error;
                if (causasResponse.error) throw causasResponse.error;

                const os = osResponse.data;
                
                // Mapeia estrutura interna para compatibilidade com o HTML original
                const osMapeada = {
                    ...os,
                    cliente: { razao_social: (os.cliente as any)?.nome_razao_social },
                    motor: os.motor
                };

                setDadosOS(osMapeada);
                setIdAndamento(String(os.id_andamento));
                setIdCausaQueima(os.id_causa_queima ? String(os.id_causa_queima) : '');
                setObsTecnicas(os.observacoes_gerais || '');
                
                setListaAndamentos(andamentosResponse.data || []);
                setListaCausas(causasResponse.data || []);
            } catch (error: any) {
                console.error('Erro ao carregar dados do Supabase:', error.message || error);
                alert('Erro ao carregar dados da Ordem de Serviço.');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        
        if (id) fetchData();
    }, [id, navigate]);

    // RESTRUTURADO: Atualização da O.S. com Supabase .update()
    const handleUpdateOS = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('ordens_servico')
                .update({
                    id_andamento: Number(idAndamento),
                    id_causa_queima: idCausaQueima ? Number(idCausaQueima) : null, // Envia nulo se não houver seleção
                    observacoes_gerais: obsTecnicas || null
                })
                .eq('id_os', Number(id));

            if (error) throw error;

            alert('Ordem de Serviço atualizada com sucesso!');
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Erro ao atualizar a OS no Supabase:', error.message || error);
            alert('Erro ao atualizar a Ordem de Serviço.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-8">

                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft className="h-6 w-6 text-gray-500" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                                <ClipboardCheck className="h-6 w-6 mr-2 text-blue-600" />
                                Atualizar O.S. #{id}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {dadosOS?.cliente?.razao_social} | {dadosOS?.motor?.num_serie}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate(`/os/${id}/orcamento`)}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm active:scale-95 transition-all w-fit"
                    >
                        <FileText className="h-4 w-4" />
                        <span>Ver Orçamento</span>
                    </button>
                </div>

                <form onSubmit={handleUpdateOS} className="space-y-6">

                    {/* Seletor de Andamento */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Status do Andamento</label>
                        <select
                            value={idAndamento}
                            onChange={(e) => setIdAndamento(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
                            required
                        >
                            <option value="">Selecione o andamento...</option>
                            {listaAndamentos.map((andamento) => (
                                <option key={andamento.id_andamento} value={String(andamento.id_andamento)}>
                                    {andamento.descricao_andamento}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Causa da Queima */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" /> Causa Provável da Queima
                        </label>
                        <select
                            value={idCausaQueima}
                            onChange={(e) => setIdCausaQueima(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">Não identificado / Não informado</option>
                            {listaCausas.map((causa) => (
                                <option key={causa.id_causa_queima} value={String(causa.id_causa_queima)}>
                                    {causa.descricao_causa}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Observações Técnicas */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Observações Técnicas / Diagnóstico</label>
                        <textarea
                            value={obsTecnicas}
                            onChange={(e) => setObsTecnicas(e.target.value)}
                            placeholder="Descreva o que foi encontrado durante a desmontagem ou testes..."
                            rows={4}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Botões de Ação */}
                    <div className="pt-6 border-t border-gray-100 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-5 w-5 mr-2" />
                            )}
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateOSForm;