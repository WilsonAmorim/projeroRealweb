import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import {
    ChevronLeft, Package, Plus, Trash2,
    ClipboardList, Wrench, Loader2, Save,
    Settings, Box, Edit3, Check, X, FileText
} from 'lucide-react';

interface OSServico {
    id_osservicos: number;
    id_os: number;
    preco: number;
    iss?: number;
    id_servico: number;
    servico?: { descricao_servico: string };
}

interface OSPeca {
    id_ospecas: number;
    id_os: number;
    preco: number;
    icms?: number;
    id_pecas: number;
    peca?: { descricao_pecas: string };
}

interface OSRebobinamento {
    id_osrebobinamento: number;
    id_os: number;
    preco: number;
    iss?: number;
    id_rebobinamento: number;
    rebobinamento?: { descricao_rebobinamento: string };
}

const OSServiceTracking: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [osData, setOsData] = useState<any>(null);
    
    const [osServicos, setOsServicos] = useState<OSServico[]>([]);
    const [osPecas, setOsPecas] = useState<OSPeca[]>([]);
    const [osRebobinamentos, setOsRebobinamentos] = useState<OSRebobinamento[]>([]);
    
    const [serviceTypes, setServiceTypes] = useState<any[]>([]);
    const [pecasList, setPecasList] = useState<any[]>([]);
    const [rebobinamentoList, setRebobinamentoList] = useState<any[]>([]);

    // Tabs
    const [activeTab, setActiveTab] = useState<'servicos' | 'pecas' | 'rebobinamento'>('servicos');

    // Form states
    const [idServico, setIdServico] = useState('');
    const [idPecas, setIdPecas] = useState('');
    const [idRebobinamento, setIdRebobinamento] = useState('');
    const [valorUnitario, setValorUnitario] = useState('0');

    useEffect(() => {
        const fetchData = async () => {
            console.log('ID recebido:', id);
            console.log('ID convertido:', Number(id));
            try {
                const [osRes, servicosRes, pecasRes, servRefsRes, pecaRefsRes, rebobRefsRes, rebobRes] = await Promise.all([
                    supabase
                        .from('ordens_servico')
                        .select('*, motor:motores(num_serie, cliente(nome_razao_social))')
                        .eq('id_os', Number(id))
                        .single(),
                    supabase.from('os_servicos').select('*, servico:servico(*)').eq('id_os', Number(id)),
                    supabase.from('os_pecas').select('*, peca:pecas(*)').eq('id_os', Number(id)),
                    supabase.from('servico').select('*').order('descricao_servico'),
                    supabase.from('pecas').select('*').order('descricao_pecas'),
                    supabase.from('rebobinamentos').select('*').order('descricao_rebobinamento'),
                    supabase.from('os_rebobinamentos').select('*, rebobinamento:rebobinamentos(*)').eq('id_os', Number(id))
                ]);

                if (osRes.error) throw osRes.error;
                if (servicosRes.error) throw servicosRes.error;
                if (pecasRes.error) throw pecasRes.error;
                if (servRefsRes.error) throw servRefsRes.error;
                if (pecaRefsRes.error) throw pecaRefsRes.error;
                    if (rebobRefsRes.error) throw rebobRefsRes.error;
                if (rebobRes.error) throw rebobRes.error;

                const osDataMapped = {
                    ...osRes.data,
                    cliente: { razao_social: osRes.data.motor?.cliente?.nome_razao_social },
                    motor: { num_serie: osRes.data.motor?.num_serie }
                };

                console.log('Serviços carregados:', servRefsRes.data);
                console.log('Peças carregadas:', pecaRefsRes.data);
                console.log('Todos os erros:', {
                    os: osRes.error,
                    servicos: servicosRes.error,
                    pecas: pecasRes.error,
                    servRefs: servRefsRes.error,
                    pecaRefs: pecaRefsRes.error,
                    rebob: rebobRes.error
                });

                setOsData(osDataMapped);
                setOsServicos(servicosRes.data || []);
                setOsPecas(pecasRes.data || []);
                setOsRebobinamentos(rebobRes.data || []);
                setServiceTypes(servRefsRes.data || []);
                setPecasList(pecaRefsRes.data || []);
                setRebobinamentoList(rebobRefsRes.data || []);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleRebobinamentoChange = (value: string) => {
        setIdRebobinamento(value);
        if (value) {
            const selected = rebobinamentoList.find(r => r.id_rebobinamento === Number(value));
            if (selected && selected.preco !== null && selected.preco !== undefined) {
                setValorUnitario(selected.preco.toString());
            } else {
                setValorUnitario('0');
            }
        } else {
            setValorUnitario('0');
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (activeTab === 'servicos' && idServico) {
                await supabase.from('os_servicos').insert([{
                    id_os: Number(id),
                    id_servico: Number(idServico),
                    preco: Number(valorUnitario)
                }]);
            } else if (activeTab === 'pecas' && idPecas) {
                const payload = {
                    id_os: Number(id),
                    id_pecas: Number(idPecas),
                    preco: Number(valorUnitario)
                };
                console.log('Inserindo peça payload:', payload);
                const { data: insertPecaData, error: insertPecaError } = await supabase
                    .from('os_pecas')
                    .insert([payload])
                    .select('*, peca:pecas(*)');
                if (insertPecaError) {
                    console.error('Erro ao inserir peça:', insertPecaError);
                    throw insertPecaError;
                }
                console.log('Peça inserida com sucesso:', insertPecaData);
            } else if (activeTab === 'rebobinamento' && idRebobinamento) {
                await supabase.from('os_rebobinamentos').insert([{
                    id_os: Number(id),
                    id_rebobinamento: Number(idRebobinamento),
                    preco: Number(valorUnitario)
                }]);
            }

            // Recarrega itens
            const [servicosRes, pecasRes, rebobRes] = await Promise.all([
                supabase.from('os_servicos').select('*, servico:servico(*)').eq('id_os', Number(id)),
                supabase.from('os_pecas').select('*, peca:pecas(*)').eq('id_os', Number(id)),
                supabase.from('os_rebobinamentos').select('*, rebobinamento:rebobinamentos(*)').eq('id_os', Number(id))
            ]);

            setOsServicos(servicosRes.data || []);
            setOsPecas(pecasRes.data || []);
            setOsRebobinamentos(rebobRes.data || []);

            // Limpa form
            setIdServico('');
            setIdPecas('');
            setIdRebobinamento('');
            setValorUnitario('0');
        } catch (error) {
            console.error('Erro ao adicionar item:', error);
            alert('Erro ao adicionar item.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveItem = async (idItem: number, type: 'servico' | 'peca' | 'rebobinamento') => {
        if (!confirm('Deseja remover este item?')) return;
        try {
            if (type === 'servico') {
                await supabase.from('os_servicos').delete().eq('id_osservicos', idItem);
                setOsServicos(osServicos.filter(i => i.id_osservicos !== idItem));
            } else if (type === 'peca') {
                await supabase.from('os_pecas').delete().eq('id_ospecas', idItem);
                setOsPecas(osPecas.filter(i => i.id_ospecas !== idItem));
            } else if (type === 'rebobinamento') {
                await supabase.from('os_rebobinamentos').delete().eq('id_osrebobinamento', idItem);
                setOsRebobinamentos(osRebobinamentos.filter(i => i.id_osrebobinamento !== idItem));
            }
        } catch (error) {
            console.error('Erro ao remover item:', error);
        }
    };

    const handleUpdatePrice = async (idItem: number, newPrice: number, type: 'servico' | 'peca' | 'rebobinamento') => {
        try {
            if (type === 'servico') {
                await supabase.from('os_servicos').update({ preco: newPrice }).eq('id_osservicos', idItem);
                setOsServicos(osServicos.map(i => i.id_osservicos === idItem ? { ...i, preco: newPrice } : i));
            } else if (type === 'peca') {
                await supabase.from('os_pecas').update({ preco: newPrice }).eq('id_ospecas', idItem);
                setOsPecas(osPecas.map(i => i.id_ospecas === idItem ? { ...i, preco: newPrice } : i));
            } else if (type === 'rebobinamento') {
                await supabase.from('os_rebobinamentos').update({ preco: newPrice }).eq('id_osrebobinamento', idItem);
                setOsRebobinamentos(osRebobinamentos.map(i => i.id_osrebobinamento === idItem ? { ...i, preco: newPrice } : i));
            }
        } catch (error) {
            console.error('Erro ao atualizar preço:', error);
            alert('Erro ao atualizar preço.');
            throw error;
        }
    };

    const totalServicos = osServicos.reduce((acc, item) => acc + Number(item.preco), 0);
    const totalPecas = osPecas.reduce((acc, item) => acc + Number(item.preco), 0);
    const totalRebobinamento = osRebobinamentos.reduce((acc, item) => acc + Number(item.preco), 0);
    const totalOS = totalServicos + totalPecas + totalRebobinamento;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 text-brand-blue animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft className="h-6 w-6 text-gray-500" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 flex items-center">
                                <Package className="h-5 w-5 mr-2 text-brand-blue" />
                                Acompanhamento de O.S. #{id}
                            </h1>
                            <p className="text-sm text-gray-500 font-medium mt-1">
                                {osData?.cliente?.razao_social} | {osData?.motor?.num_serie}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <button
                            onClick={() => navigate(`/os/${id}/orcamento`)}
                            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-md shadow-emerald-600/15 active:scale-95 transition-all"
                        >
                            <FileText className="h-4 w-4" />
                            <span>Gerar Orçamento</span>
                        </button>
                        
                        <div className="bg-brand-blue/5 border border-brand-blue/10 px-4 py-2 rounded-lg text-right">
                            <p className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">Total da Manutenção</p>
                            <p className="text-2xl font-black text-brand-blue">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOS)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Add Item Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            
                            {/* Tabs Header */}
                            <div className="flex border-b border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => setActiveTab('servicos')}
                                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center transition-colors ${
                                        activeTab === 'servicos'
                                            ? 'text-brand-blue border-b-2 border-brand-blue bg-white'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                                >
                                    <Settings className="h-4 w-4 mr-2" />
                                    Serviços
                                </button>
                                <button
                                    onClick={() => setActiveTab('pecas')}
                                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center transition-colors ${
                                        activeTab === 'pecas'
                                            ? 'text-brand-blue border-b-2 border-brand-blue bg-white'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                                >
                                    <Box className="h-4 w-4 mr-2" />
                                    Peças
                                </button>
                                <button
                                    onClick={() => setActiveTab('rebobinamento')}
                                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center transition-colors ${
                                        activeTab === 'rebobinamento'
                                            ? 'text-brand-blue border-b-2 border-brand-blue bg-white'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                                >
                                    <Wrench className="h-4 w-4 mr-2" />
                                    Rebobinamento
                                </button>
                            </div>

                            <div className="p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                    <Plus className="h-5 w-5 mr-2 text-brand-blue" />
                                    {activeTab === 'servicos' ? 'Lançar Serviço' : activeTab === 'pecas' ? 'Lançar Peça' : 'Lançar Rebobinamento'}
                                </h2>

                                <form onSubmit={handleAddItem} className="space-y-4">
                                    
                                    {activeTab === 'servicos' && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipo de Serviço</label>
                                            <select
                                                required
                                                value={idServico}
                                                onChange={(e) => setIdServico(e.target.value)}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                                            >
                                                <option value="">Selecione um serviço...</option>
                                                {serviceTypes.map(t => (
                                                    <option key={t.id_servico} value={t.id_servico}>{t.descricao_servico}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {activeTab === 'pecas' && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Peça (Estoque)</label>
                                            <select
                                                required
                                                value={idPecas}
                                                onChange={(e) => setIdPecas(e.target.value)}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                                            >
                                                <option value="">Selecione uma peça...</option>
                                                {pecasList.map(p => (
                                                    <option key={p.id_pecas} value={p.id_pecas}>{p.descricao_pecas}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {activeTab === 'rebobinamento' && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rebobinamento</label>
                                            <select
                                                required
                                                value={idRebobinamento}
                                                onChange={(e) => handleRebobinamentoChange(e.target.value)}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                                            >
                                                <option value="">Selecione um rebobinamento...</option>
                                                {rebobinamentoList.map(r => (
                                                    <option key={r.id_rebobinamento} value={r.id_rebobinamento}>
                                                        {r.descricao_rebobinamento} {r.cv ? `(${r.cv} CV)` : ''} {r.polos ? `- ${r.polos} Polos` : ''} - R$ {Number(r.preco).toFixed(2)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Valor / Preço</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-400 text-xs font-bold">R$</span>
                                            </div>
                                            <input
                                                type="number"
                                                required
                                                step="0.01"
                                                min="0"
                                                value={valorUnitario}
                                                onChange={(e) => setValorUnitario(e.target.value)}
                                                className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full mt-4 flex items-center justify-center space-x-2 py-3 bg-brand-blue text-white rounded-lg font-bold hover:bg-brand-blue-dark transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                            <>
                                                <Save className="h-5 w-5" />
                                                <span>{activeTab === 'servicos' ? 'Lançar Serviço' : activeTab === 'pecas' ? 'Lançar Peça' : 'Lançar Rebobinamento'}</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Summary per Tab */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                    <ClipboardList className="h-5 w-5 mr-2 text-brand-blue" />
                                    {activeTab === 'servicos' ? 'Resumo de Serviços' : activeTab === 'pecas' ? 'Resumo de Peças' : 'Resumo de Rebobinamentos'}
                                </h2>
                                <div className="flex flex-col items-end">
                                    <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest">
                                        {activeTab === 'servicos' ? osServicos.length : activeTab === 'pecas' ? osPecas.length : osRebobinamentos.length} ITENS
                                    </span>
                                    <span className="text-xs font-bold text-brand-blue mt-1">
                                        Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                            activeTab === 'servicos' ? totalServicos : activeTab === 'pecas' ? totalPecas : totalRebobinamento
                                        )}
                                    </span>
                                </div>
                            </div>

                            {activeTab === 'servicos' ? (
                                osServicos.length === 0 ? (
                                    <EmptyState message="Nenhum serviço lançado." />
                                ) : (
                                    <ItemsTable 
                                        items={osServicos} 
                                        type="servico" 
                                        onRemove={(id) => handleRemoveItem(id, 'servico')} 
                                        onUpdatePrice={(id, price) => handleUpdatePrice(id, price, 'servico')}
                                    />
                                )
                            ) : activeTab === 'pecas' ? (
                                osPecas.length === 0 ? (
                                    <EmptyState message="Nenhuma peça lançada." />
                                ) : (
                                    <ItemsTable 
                                        items={osPecas} 
                                        type="peca" 
                                        onRemove={(id) => handleRemoveItem(id, 'peca')} 
                                        onUpdatePrice={(id, price) => handleUpdatePrice(id, price, 'peca')}
                                    />
                                )
                            ) : (
                                osRebobinamentos.length === 0 ? (
                                    <EmptyState message="Nenhum rebobinamento lançado." />
                                ) : (
                                    <ItemsTable 
                                        items={osRebobinamentos} 
                                        type="rebobinamento" 
                                        onRemove={(id) => handleRemoveItem(id, 'rebobinamento')} 
                                        onUpdatePrice={(id, price) => handleUpdatePrice(id, price, 'rebobinamento')}
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="p-12 text-center h-full flex flex-col items-center justify-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
            <Wrench className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-gray-500 font-medium">{message}</h3>
        <p className="text-gray-400 text-sm mt-1">Utilize o formulário ao lado para começar.</p>
    </div>
);

const ItemsTable: React.FC<{
    items: any[],
    type: 'servico' | 'peca' | 'rebobinamento',
    onRemove: (id: number) => void,
    onUpdatePrice: (id: number, price: number) => Promise<void>
}> = ({ items, type, onRemove, onUpdatePrice }) => {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const startEdit = (item: any) => {
        const id = type === 'servico' 
            ? item.id_osservicos 
            : type === 'peca' 
                ? item.id_ospecas 
                : item.id_osrebobinamento;
        setEditingId(id);
        setEditingValue(item.preco.toString());
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingValue('');
    };

    const handleSave = async (id: number) => {
        const value = parseFloat(editingValue);
        if (isNaN(value) || value < 0) {
            alert('Por favor, insira um valor válido.');
            return;
        }
        setIsSaving(true);
        try {
            await onUpdatePrice(id, value);
            setEditingId(null);
        } catch (error) {
            // Erro já tratado no pai
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50/50">
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Imposto</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Preço</th>
                        <th className="px-6 py-4 text-center"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {items.map((item) => {
                        const id = type === 'servico' 
                            ? item.id_osservicos 
                            : type === 'peca' 
                                ? item.id_ospecas 
                                : item.id_osrebobinamento;
                        const isEditing = editingId === id;

                        return (
                            <tr key={id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {type === 'servico' 
                                            ? item.servico?.descricao_servico 
                                            : type === 'peca' 
                                                ? item.peca?.descricao_pecas 
                                                : item.rebobinamento?.descricao_rebobinamento}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-xs text-gray-500 font-medium">
                                        {type === 'peca' 
                                            ? `ICMS (20,5%): ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.icms || (item.preco * 0.205))}` 
                                            : `ISS (5%): ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.iss || (item.preco * 0.05))}`
                                        }
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {isEditing ? (
                                        <div className="flex items-center justify-end space-x-2">
                                            <span className="text-gray-400 text-xs font-bold">R$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={editingValue}
                                                onChange={(e) => setEditingValue(e.target.value)}
                                                disabled={isSaving}
                                                className="w-24 p-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none text-right font-bold"
                                                autoFocus
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-sm font-bold text-gray-800">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={() => handleSave(id)}
                                                    disabled={isSaving}
                                                    className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-all"
                                                    title="Salvar"
                                                >
                                                    {isSaving ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Check className="h-4 w-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    disabled={isSaving}
                                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
                                                    title="Cancelar"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => startEdit(item)}
                                                    className="p-2 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    title="Editar Preço"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => onRemove(id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    title="Remover Item"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default OSServiceTracking;
