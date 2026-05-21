// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import api from '../services/api';
// import type { Cliente, ClienteResponse } from '../types/client';
// import { useDebounce } from '../hooks/useDebounce';
// import SearchBar from '../components/common/SearchBar';
// import ClientTable from '../components/clients/ClientTable';
// import ClientModal from '../components/clients/ClientModal';
// import { Plus, Users, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';

// const ITEMS_PER_PAGE = 10;

// const Clients: React.FC = () => {
//   const { profile } = useAuth();
//   const [clients, setClients] = useState<Cliente[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isReadOnly, setIsReadOnly] = useState(false);
//   const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
//   const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

//   // Admin (1) and Recepcao (2) can edit and delete
//   const userProfileId = profile?.id_perfil ? String(profile.id_perfil) : '';
//   const canEdit = userProfileId === '1' || userProfileId === '2';
//   const canDelete = userProfileId === '1' || userProfileId === '2';

//   const debouncedSearch = useDebounce(searchQuery, 500);

//   const fetchClients = useCallback(async (query?: string) => {
//     setIsLoading(true);
//     try {
//       let response;
//       if (query && query.trim()) {
//         const trimmedQuery = query.trim();
//         response = await api.get<ClienteResponse>(`/api/search?query=${trimmedQuery}`);
//       } else {
//         response = await api.get<ClienteResponse>('/api/clientes');
//       }

//       const data = response.data.data as any;

//       if (data && data.clientes) {
//         setClients(data.clientes);
//       } else {
//         setClients(Array.isArray(data) ? data : [data]);
//       }
//       setCurrentPage(1);
//     } catch (error: any) {
//       console.error('Erro ao buscar clientes:', error);
//       const errorMsg = error.response?.data?.message || 'Erro ao carregar clientes.';
//       showToast(errorMsg, 'error');
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchClients(debouncedSearch);
//   }, [debouncedSearch, fetchClients]);

//   const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE);
//   const paginatedClients = useMemo(() => {
//     const start = (currentPage - 1) * ITEMS_PER_PAGE;
//     return clients.slice(start, start + ITEMS_PER_PAGE);
//   }, [clients, currentPage]);

//   const showToast = (message: string, type: 'success' | 'error') => {
//     setToast({ message, type });
//     setTimeout(() => setToast(null), 3000);
//   };

//   const handleSaveClient = async (clientData: Cliente) => {
//     try {
//       if (clientData.id_cliente) {
//         await api.put(`/api/clientes/${clientData.id_cliente}`, clientData);
//         showToast('Cliente atualizado com sucesso!', 'success');
//       } else {
//         await api.post('/api/clientes', clientData);
//         showToast('Cliente cadastrado com sucesso!', 'success');
//       }
//       setIsModalOpen(false);
//       await fetchClients(debouncedSearch);
//     } catch (error: any) {
//       const msg = error.response?.data?.message || 'Erro ao salvar cliente.';
//       showToast(msg, 'error');
//       throw error; // Re-throw so modal stays open on error
//     }
//   };

//   const handleDeleteClient = async (id: number) => {
//     if (!window.confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
//       return;
//     }

//     try {
//       await api.delete(`/api/clientes/${id}`);
//       showToast('Cliente excluído com sucesso!', 'success');
//       await fetchClients(debouncedSearch);
//     } catch (err) {
//       console.error('Erro ao excluir cliente:', err);
//       showToast('Erro ao excluir cliente no servidor.', 'error');
//     }
//   };

//   const handleEdit = (client: Cliente) => {
//     setSelectedClient(client);
//     setIsReadOnly(false);
//     setIsModalOpen(true);
//   };

//   const handleView = (client: Cliente) => {
//     setSelectedClient(client);
//     setIsReadOnly(true);
//     setIsModalOpen(true);
//   };

//   const handleAddNew = () => {
//     setSelectedClient(null);
//     setIsReadOnly(false);
//     setIsModalOpen(true);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       <nav className="bg-white border-b border-gray-200 px-6 py-4">
//         <div className="max-w-7xl mx-auto flex justify-between items-center">
//           <div className="flex items-center space-x-4">
//             <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//               <LayoutDashboard className="h-5 w-5 text-gray-500" />
//             </Link>
//             <h1 className="text-xl font-bold text-brand-blue flex items-center">
//               <Users className="h-6 w-6 mr-2" />
//               Gestão de Clientes
//             </h1>
//           </div>

//           {canEdit && (
//             <button
//               onClick={handleAddNew}
//               className="flex items-center px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-dark-blue transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
//             >
//               <Plus className="h-5 w-5 mr-1" />
//               Novo Cliente
//             </button>
//           )}
//         </div>
//       </nav>

//       <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
//         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
//           <SearchBar
//             value={searchQuery}
//             onChange={setSearchQuery}
//             placeholder="Buscar por nome, documento ou cidade..."
//           />
//           <div className="text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
//             {clients.length} {clients.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
//           </div>
//         </div>

//         <ClientTable
//           clients={paginatedClients}
//           isLoading={isLoading}
//           onEdit={handleEdit}
//           onView={handleView}
//           onDelete={handleDeleteClient}
//           canEdit={canEdit}
//           canDelete={canDelete}
//         />

//         {!isLoading && totalPages > 1 && (
//           <div className="flex items-center justify-center space-x-4 pb-8">
//             <button
//               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//               disabled={currentPage === 1}
//               className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
//             >
//               <ChevronLeft className="h-5 w-5" />
//             </button>
//             <span className="text-sm font-medium text-gray-700">
//               Página <span className="text-brand-blue">{currentPage}</span> de {totalPages}
//             </span>
//             <button
//               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//               disabled={currentPage === totalPages}
//               className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
//             >
//               <ChevronRight className="h-5 w-5" />
//             </button>
//           </div>
//         )}
//       </main>

//       <ClientModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSave={handleSaveClient}
//         client={selectedClient}
//         isReadOnly={isReadOnly}
//       />

//       {toast && (
//         <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-2xl z-[100] transform transition-all duration-300 flex items-center space-x-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
//           }`}>
//           <span className="font-medium">{toast.message}</span>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Clients;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../config/supabase'; // Seu arquivo de inicialização do Supabase Client
import type { Cliente } from '../types/client';
import { useDebounce } from '../hooks/useDebounce';
import SearchBar from '../components/common/SearchBar';
import ClientTable from '../components/clients/ClientTable';
import ClientModal from '../components/clients/ClientModal';
import { Plus, Users, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ITEMS_PER_PAGE = 10;

const Clients: React.FC = () => {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const userProfileId = profile?.id_perfil ? String(profile.id_perfil) : '';
  const canEdit = userProfileId === '1' || userProfileId === '2';
  const canDelete = userProfileId === '1' || userProfileId === '2';

  const debouncedSearch = useDebounce(searchQuery, 500);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // RESTRUTURADO: Consulta direta ao banco de dados unificando a busca interna
  const fetchClients = useCallback(async (query?: string) => {
    setIsLoading(true);
    try {
      let queryBuilder = supabase.from('cliente').select('*');

      // Se houver texto de busca, aplica os filtros (OR) equivalentes ao seu backend de search
      if (query && query.trim()) {
        const trimmed = query.trim();
        queryBuilder = queryBuilder.or(
          `nome_razao_social.ilike.%${trimmed}%,documento.ilike.%${trimmed}%,cidade.ilike.%${trimmed}%`
        );
      } else {
        // Ordenação padrão por nome se não houver busca ativa
        queryBuilder = queryBuilder.order('nome_razao_social', { ascending: true });
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      setClients(data || []);
      setCurrentPage(1);
    } catch (error: any) {
      console.error('Erro ao buscar clientes:', error);
      showToast(error.message || 'Erro ao carregar clientes do banco.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients(debouncedSearch);
  }, [debouncedSearch, fetchClients]);

  const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE);
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return clients.slice(start, start + ITEMS_PER_PAGE);
  }, [clients, currentPage]);

  // RESTRUTURADO: Salva e atualiza diretamente as informações na tabela
  const handleSaveClient = async (clientData: Cliente) => {
    try {
      // Remover propriedades geradas automaticamente ou de controle que o banco rejeita se enviadas brutas
      const { id_cliente, data_criacao, data_atualizacao, ...payload } = clientData;

      if (!payload.documento || !payload.nome_razao_social) {
        showToast('Documento e Nome/Razão Social são obrigatórios', 'error');
        return;
      }

      if (id_cliente) {
        // Fluxo de Atualização (Equivalente ao updateCliente)
        const { error } = await supabase
          .from('cliente')
          .update(payload)
          .eq('id_cliente', id_cliente);

        if (error) throw error;
        showToast('Cliente atualizado com sucesso!', 'success');
      } else {
        // Fluxo de Cadastro (Equivalente ao createCliente)
        // O id_usuario será preenchido automaticamente pela regra DEFAULT auth.uid() do banco
        const { error } = await supabase
          .from('cliente')
          .insert([payload]);

        if (error) throw error;
        showToast('Cliente cadastrado com sucesso!', 'success');
      }

      setIsModalOpen(false);
      await fetchClients(debouncedSearch);
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      let msg = error.message || 'Erro ao salvar cliente.';
      
      // Captura o erro clássico de chave duplicada (documento já existente)
      if (error.code === '23505') {
        msg = 'Cliente com este documento já existe';
      }
      
      showToast(msg, 'error');
      throw error;
    }
  };

  // RESTRUTURADO: Deleção direta
  const handleDeleteClient = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('cliente')
        .delete()
        .eq('id_cliente', id);

      if (error) throw error;

      showToast('Cliente excluído com sucesso!', 'success');
      await fetchClients(debouncedSearch);
    } catch (error: any) {
      console.error('Erro ao excluir cliente:', error);
      showToast(error.message || 'Erro ao excluir cliente no servidor.', 'error');
    }
  };

  const handleEdit = (client: Cliente) => {
    setSelectedClient(client);
    setIsReadOnly(false);
    setIsModalOpen(true);
  };

  const handleView = (client: Cliente) => {
    setSelectedClient(client);
    setIsReadOnly(true);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedClient(null);
    setIsReadOnly(false);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <LayoutDashboard className="h-5 w-5 text-gray-500" />
            </Link>
            <h1 className="text-xl font-bold text-brand-blue flex items-center">
              <Users className="h-6 w-6 mr-2" />
              Gestão de Clientes
            </h1>
          </div>

          {canEdit && (
            <button
              onClick={handleAddNew}
              className="flex items-center px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-dark-blue transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5 mr-1" />
              Novo Cliente
            </button>
          )}
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por nome, documento ou cidade..."
          />
          <div className="text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            {clients.length} {clients.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
          </div>
        </div>

        <ClientTable
          clients={paginatedClients}
          isLoading={isLoading}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDeleteClient}
          canEdit={canEdit}
          canDelete={canDelete}
        />

        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4 pb-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              Página <span className="text-brand-blue">{currentPage}</span> de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </main>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
        client={selectedClient}
        isReadOnly={isReadOnly}
      />

      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-2xl z-[100] transform transition-all duration-300 flex items-center space-x-2 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Clients;