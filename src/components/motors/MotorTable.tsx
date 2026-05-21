import React from 'react';
import { Settings, Eye, Edit2, Trash2, Loader2, User, FileText } from 'lucide-react';
import type { Motor } from '../../types/motor';

interface MotorTableProps {
    motors: Motor[];
    isLoading: boolean;
    onEdit: (motor: Motor) => void;
    onView: (motor: Motor) => void;
    onDelete: (id: number) => void;
    onOpenOS?: (motor: Motor) => void;
    loadingOSId?: number | null;
    canEdit?: boolean;
    canDelete?: boolean;
}

const MotorTable: React.FC<MotorTableProps> = ({
    motors,
    isLoading,
    onEdit,
    onView,
    onDelete,
    onOpenOS,
    loadingOSId,
    canEdit,
    canDelete
}) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                <Loader2 className="h-10 w-10 text-brand-blue animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Carregando motores...</p>
            </div>
        );
    }

    if (motors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm text-center px-4">
                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Settings className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Nenhum motor encontrado</h3>
                <p className="text-gray-500 max-w-xs">Tente ajustar sua busca ou cadastrar um novo equipamento.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">Ações</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Identificação / Equipamento</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Proprietário</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Potência / RPM</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fabricante / Modelo</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {motors.map((motor) => (
                            <tr key={motor.id_motor} className="hover:bg-gray-50 transition-colors duration-150">
                                {/* Actions Column */}
                                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium w-40">
                                    <div className="flex justify-start space-x-1 items-center">

                                        {/* NOVO: Botão de Abrir O.S. */}
                                        {onOpenOS && (
                                            <button
                                                onClick={() => onOpenOS(motor)}
                                                disabled={loadingOSId === motor.id_motor}
                                                className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50 disabled:opacity-50"
                                                title="Abrir O.S. para este motor"
                                            >
                                                {loadingOSId === motor.id_motor ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                                                ) : (
                                                    <FileText className="h-4 w-4" />
                                                )}
                                            </button>
                                        )}

                                        <button
                                            onClick={() => onView(motor)}
                                            className="p-1.5 text-gray-400 hover:text-brand-blue transition-colors rounded-full hover:bg-blue-50"
                                            title="Visualizar Detalhes"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>

                                        {canEdit && (
                                            <button
                                                onClick={() => onEdit(motor)}
                                                className="p-1.5 text-gray-400 hover:text-amber-600 transition-colors rounded-full hover:bg-amber-50"
                                                title="Editar"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                        )}

                                        {canDelete && motor.id_motor && (
                                            <button
                                                onClick={() => onDelete(motor.id_motor!)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                                                title="Excluir"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-9 w-9 bg-blue-50 rounded-full flex items-center justify-center">
                                            <Settings className="h-4 w-4 text-brand-blue" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-gray-900">{motor.num_serie}</div>
                                            <div className="text-xs text-gray-500">TAG: {motor.tag_cliente || '-'}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                        <User className="h-3 w-3 text-gray-400" />
                                        <span className="font-medium text-gray-900">
                                            {motor.cliente?.nome_razao_social || 'Cliente não identificado'}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-brand-blue">
                                            {motor.potencia_cv_kw} {motor.unidade_cv_kw || ''}
                                        </span>
                                        <span className="text-xs text-gray-400">{motor.rpm ? `${motor.rpm} RPM` : '-'}</span>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <div className="flex flex-col">
                                        <span>{motor.fabricante || '-'}</span>
                                        <span className="text-xs text-gray-400">{motor.modelo || '-'}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MotorTable;

