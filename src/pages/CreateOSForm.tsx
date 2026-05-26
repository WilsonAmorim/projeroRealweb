import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase'; // Configuração do Supabase importada
import { Save, ChevronLeft, Wrench, Loader2, ImagePlus } from 'lucide-react';

const CreateOSForm: React.FC = () => {
    const { idMotor } = useParams();
    const navigate = useNavigate();

    const [observacoes, setObservacoes] = useState('');
    const [fotos, setFotos] = useState<FileList | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSaveOS = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!idMotor) {
            alert('ID do motor inválido. Verifique a rota e tente novamente.');
            setIsSubmitting(false);
            return;
        }

        try {
            const urlsFotos: string[] = [];

            // 1. FLUXO DE UPLOAD DE IMAGENS (Se houver fotos selecionadas)
            if (fotos && fotos.length > 0) {
                for (let i = 0; i < fotos.length; i++) {
                    const file = fotos[i];

                    const fileExt = file.name.split('.').pop();
                    const fileName = `${idMotor}_${Date.now()}_${i}.${fileExt}`;
                    const filePath = `entradas/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('fotos_queima')
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data: publicUrlData } = supabase.storage
                        .from('fotos_queima')
                        .getPublicUrl(filePath);

                    if (publicUrlData?.publicUrl) {
                        urlsFotos.push(publicUrlData.publicUrl);
                    }
                }
            }

            // 2. MONTAGEM DO PAYLOAD PARA O BANCO DE DADOS
            const osPayload: Record<string, any> = {
                id_motor: Number(idMotor),
                data_entrada: new Date().toISOString(),
                id_andamento: 9, // Mantém fixo em "Aguardando Orçamento"
                observacoes_gerais: observacoes || null
            };

            if (urlsFotos.length > 0) {
                osPayload.fotos_entrada = urlsFotos;
            }

            const { error: insertError } = await supabase
                .from('ordens_servico')
                .insert([osPayload]);

            if (insertError) throw insertError;

            navigate('/dashboard');
        } catch (error: any) {
            const errorMessage = error?.message || error?.details || JSON.stringify(error);
            console.error('Erro ao salvar a OS no Supabase:', errorMessage);
            alert(`Erro ao gravar a Ordem de Serviço. ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-8">

                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft className="h-6 w-6 text-gray-500" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                                <Wrench className="h-6 w-6 mr-2 text-brand-blue" />
                                Nova Ordem de Serviço
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Preencha os dados de entrada do equipamento</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSaveOS} className="space-y-6">

                    {/* Informações Travadas (Read-Only) */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase">ID do Motor</label>
                            <p className="text-lg font-semibold text-gray-800">#{idMotor}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase">Status Inicial</label>
                            <span className="inline-block mt-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm font-semibold rounded-full">
                                Aguardando Orçamento
                            </span>
                        </div>
                    </div>

                    {/* Observações Gerais de Entrada */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Observações Visuais / Check-in</label>
                        <textarea
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            placeholder="Ex: Motor chegou sem a tampa da caixa de ligação, pintura arranhada, cliente relatou cheiro de queimado..."
                            rows={5}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue"
                        />
                    </div>

                    {/* Upload de Fotos da Entrada */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <ImagePlus className="h-4 w-4 mr-2" /> Fotos de Chegada do Equipamento (Opcional)
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setFotos(e.target.files)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20"
                        />
                        <p className="text-xs text-gray-400 mt-1">Anexe fotos caso o motor tenha chegado com avarias visíveis.</p>
                    </div>

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
                            className="flex items-center px-6 py-2.5 bg-brand-blue text-white font-medium rounded-lg hover:bg-brand-dark-blue transition-colors disabled:opacity-70"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                            Abrir O.S.
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default CreateOSForm;