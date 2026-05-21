import React from 'react';
import { Settings, User, Clock, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardCardProps {
    os: {
        id_os: number;
        data_entrada: string | Date;
        id_andamento: number;
        andamento?: string; 
        cliente?: { 
            nome_razao_social: string; 
        };
        motor?: { 
            num_serie: string; 
            especificacao?: string | null; 
        };
    };
    onViewDetails: (id_os: number) => void; // <-- ADICIONADO: Agora o TypeScript sabe que o card recebe essa função
}

const DashboardCard: React.FC<DashboardCardProps> = ({ os, onViewDetails }) => {
    const navigate = useNavigate();

    // Retorna classes de cores dinâmicas com base no status do andamento
    const getStatusStyles = (status: string) => {
        const lowerStatus = status.toLowerCase();
        
        if (lowerStatus.includes('aguardando') || lowerStatus.includes('proposta')) {
            return 'bg-amber-500 text-white border-amber-600'; 
        }
        if (lowerStatus.includes('manutenção') || lowerStatus.includes('execução') || lowerStatus.includes('rebobinagem')) {
            return 'bg-blue-600 text-white border-blue-700'; 
        }
        if (lowerStatus.includes('concluído') || lowerStatus.includes('pronto') || lowerStatus.includes('faturado')) {
            return 'bg-emerald-600 text-white border-emerald-700'; 
        }
        if (lowerStatus.includes('cancelado') || lowerStatus.includes('parado')) {
            return 'bg-rose-600 text-white border-rose-700'; 
        }
        
        return 'bg-gray-600 text-white border-gray-700';
    };

    const statusAndamento = os.andamento || 'Em Análise';
    const nomeCliente = os.cliente?.nome_razao_social || 'Cliente não identificado';
    const serieMotor = os.motor?.num_serie || 'Sem Série';
    const especMotor = os.motor?.especificacao || 'Sem especificações técnicas';

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between min-h-[240px]">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-sm transition-colors duration-200 ${getStatusStyles(statusAndamento)}`}>
                        <Clock className="w-3 h-3 mr-1 text-white" />
                        {statusAndamento}
                    </span>
                    <span className="text-sm font-bold text-gray-400 group-hover:text-brand-blue transition-colors">
                        #{os.id_os}
                    </span>
                </div>

                <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                        <User className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Cliente</p>
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">{nomeCliente}</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <Settings className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Equipamento</p>
                            <p className="text-sm font-medium text-gray-800">Série: {serieMotor}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{especMotor}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                {/* CORRIGIDO: Agora usa a função injetada via Prop para abrir o modal de detalhes */}
                <button 
                    type="button"
                    onClick={() => onViewDetails(os.id_os)}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-brand-blue/10 hover:text-brand-blue rounded-lg transition-colors"
                >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Detalhes</span>
                </button>
                
                <button 
                    type="button"
                    onClick={() => navigate(`/os/${os.id_os}/acompanhamento`)}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-semibold text-white bg-brand-blue hover:bg-brand-blue-dark rounded-lg shadow-sm shadow-brand-blue/20 transition-colors"
                >
                    <Package className="w-3.5 h-3.5" />
                    <span>Serviços/Peças</span>
                </button>
            </div>
        </div>
    );
};

export default DashboardCard;