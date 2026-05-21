// import React from 'react';
// import { User, Eye, Edit2, Trash2, Loader2, Settings } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import type { Cliente } from '../../types/client';

// interface ClientTableProps {
//   clients: Cliente[];
//   isLoading: boolean;
//   onEdit: (client: Cliente) => void;
//   onView: (client: Cliente) => void;
//   onDelete: (id: number) => void;
//   canEdit?: boolean;
//   canDelete?: boolean;
// }

// const ClientTable: React.FC<ClientTableProps> = ({
//   clients,
//   isLoading,
//   onEdit,
//   onView,
//   onDelete,
//   canEdit,
//   canDelete
// }) => {
//   const navigate = useNavigate();

//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
//         <Loader2 className="h-10 w-10 text-brand-blue animate-spin mb-4" />
//         <p className="text-gray-500 font-medium">Carregando clientes...</p>
//       </div>
//     );
//   }

//   if (clients.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm text-center px-4">
//         <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
//           <User className="h-8 w-8 text-gray-300" />
//         </div>
//         <h3 className="text-lg font-semibold text-gray-900">Nenhum cliente encontrado</h3>
//         <p className="text-gray-500 max-w-xs">Tente ajustar sua busca ou cadastrar um novo cliente.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">Ações</th>
//               <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Razão Social / Nome</th>
//               <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Documento</th>
//               <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Localização</th>
//               <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contato</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {clients.map((client) => (
//               <tr key={client.id_cliente} className="hover:bg-gray-50 transition-colors duration-150">
//                 <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium w-40">
//                   <div className="flex justify-start space-x-1">
//                     {/* Botão Ver Motores - NOVO */}
//                     <button
//                       onClick={() => navigate(`/motores?clienteId=${client.id_cliente}`)}
//                       className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors rounded-full hover:bg-orange-50"
//                       title="Ver Motores deste Cliente"
//                     >
//                       <Settings className="h-4 w-4" />
//                     </button>

//                     <button
//                       onClick={() => onView(client)}
//                       className="p-1.5 text-gray-400 hover:text-brand-blue transition-colors rounded-full hover:bg-blue-50"
//                       title="Visualizar"
//                     >
//                       <Eye className="h-4 w-4" />
//                     </button>

//                     {canEdit && (
//                       <button
//                         onClick={() => onEdit(client)}
//                         className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50"
//                         title="Editar"
//                       >
//                         <Edit2 className="h-4 w-4" />
//                       </button>
//                     )}

//                     {canDelete && client.id_cliente && (
//                       <button
//                         onClick={() => onDelete(client.id_cliente!)}
//                         className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
//                         title="Excluir"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     )}
//                   </div>
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     <div className="flex-shrink-0 h-9 w-9 bg-blue-50 rounded-full flex items-center justify-center">
//                       <User className="h-4 w-4 text-brand-blue" />
//                     </div>
//                     <div className="ml-4">
//                       <div className="text-sm font-bold text-gray-900">{client.nome_razao_social}</div>
//                       <div className="text-xs text-gray-500">{client.nome_fantasia || '-'}</div>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                   {client.documento || '-'}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                   <div className="flex flex-col">
//                     <span>{client.cidade || '-'}</span>
//                     <span className="text-xs text-gray-400">{client.estado || '-'}</span>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                   <div className="flex flex-col">
//                     <span>{client.telefone || '-'}</span>
//                     <span className="text-xs text-gray-400">{client.email || '-'}</span>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default ClientTable;

import React from 'react';
import { User, Eye, Edit2, Trash2, Loader2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Cliente } from '../../types/client';

interface ClientTableProps {
  clients: Cliente[];
  isLoading: boolean;
  onEdit: (client: Cliente) => void;
  onView: (client: Cliente) => void;
  onDelete: (id: number) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  isLoading,
  onEdit,
  onView,
  onDelete,
  canEdit,
  canDelete
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
        <Loader2 className="h-10 w-10 text-brand-blue animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Carregando clientes...</p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm text-center px-4">
        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Nenhum cliente encontrado</h3>
        <p className="text-gray-500 max-w-xs">Tente ajustar sua busca ou cadastrar um novo cliente.</p>
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Razão Social / Nome</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Documento</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Localização</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contato</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id_cliente ?? client.documento} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium w-40">
                  <div className="flex justify-start space-x-1">
                    
                    {/* Botão Ver Motores - Redireciona aplicando o filtro na rota */}
                    <button
                      type="button"
                      onClick={() => navigate(`/motores?clienteId=${client.id_cliente}`)}
                      className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors rounded-full hover:bg-orange-50"
                      title="Ver Motores deste Cliente"
                    >
                      <Settings className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onView(client)}
                      className="p-1.5 text-gray-400 hover:text-brand-blue transition-colors rounded-full hover:bg-blue-50"
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(client)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}

                    {canDelete && client.id_cliente && (
                      <button
                        type="button"
                        onClick={() => onDelete(client.id_cliente!)}
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
                      <User className="h-4 w-4 text-brand-blue" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">{client.nome_razao_social}</div>
                      <div className="text-xs text-gray-500">{client.nome_fantasia || '-'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {client.documento || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="flex flex-col">
                    <span>{client.cidade || '-'}</span>
                    <span className="text-xs text-gray-400">{client.estado || '-'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="flex flex-col">
                    <span>{client.telefone || '-'}</span>
                    <span className="text-xs text-gray-400">{client.email || '-'}</span>
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

export default ClientTable;