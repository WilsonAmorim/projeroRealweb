import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Cliente } from '../types/client';
import { useDebounce } from '../hooks/useDebounce';
import SearchBar from '../components/common/SearchBar';
import ClientTable from '../components/clients/ClientTable';
import ClientModal from '../components/clients/ClientModal';
import { Plus, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { MainLayout } from '../components/layout/MainLayout';

const ITEMS_PER_PAGE = 10;

const Clients: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

  const userProfileId = profile?.id_perfil ? String(profile.id_perfil) : '';
  const canEdit = userProfileId === '1' || userProfileId === '2';
  const canDelete = userProfileId === '1' || userProfileId === '2';

  const debouncedSearch = useDebounce(searchQuery, 500);

  const fetchClients = useCallback(async (query?: string) => {
    setIsLoading(true);
    try {
      let queryBuilder = supabase.from('cliente').select('*');

      if (query && query.trim()) {
        const trimmed = query.trim();
        queryBuilder = queryBuilder.or(
          `nome_razao_social.ilike.%${trimmed}%,documento.ilike.%${trimmed}%,cidade.ilike.%${trimmed}%`
        );
      } else {
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
  }, [showToast]);

  useEffect(() => {
    fetchClients(debouncedSearch);
  }, [debouncedSearch, fetchClients]);

  const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE);
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return clients.slice(start, start + ITEMS_PER_PAGE);
  }, [clients, currentPage]);

  const handleSaveClient = async (clientData: Cliente) => {
    try {
      const { id_cliente, data_criacao, data_atualizacao, ...payload } = clientData;

      if (!payload.documento || !payload.nome_razao_social) {
        showToast('Documento e Nome/Razão Social são obrigatórios', 'error');
        return;
      }

      if (id_cliente) {
        const { error } = await supabase
          .from('cliente')
          .update(payload)
          .eq('id_cliente', id_cliente);

        if (error) throw error;
        showToast('Cliente atualizado com sucesso!', 'success');
      } else {
        const { error } = await supabase.from('cliente').insert([payload]);

        if (error) throw error;
        showToast('Cliente cadastrado com sucesso!', 'success');
      }

      setIsModalOpen(false);
      await fetchClients(debouncedSearch);
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      let msg = error.message || 'Erro ao salvar cliente.';
      if (error.code === '23505') {
        msg = 'Cliente com este documento já existe';
      }
      showToast(msg, 'error');
      throw error;
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase.from('cliente').delete().eq('id_cliente', id);

      if (error) throw error;

      showToast('Cliente excluído com sucesso!', 'info');
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
    <MainLayout pageTitle="Gestão de Clientes">
      <div className="space-y-6">
        {/* Banner Superior da Página */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Clientes Cadastrados</h1>
              <p className="text-xs text-slate-400 font-medium">
                Gerencie contatos, CNPJ/CPF e histórico dos proprietários dos equipamentos
              </p>
            </div>
          </div>

          {canEdit && (
            <button
              onClick={handleAddNew}
              className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Cliente</span>
            </button>
          )}
        </div>

        {/* Barra de Busca e Tabela */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[280px]">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar por nome, documento ou cidade..."
              />
            </div>
            <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
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
            <div className="flex items-center justify-center space-x-4 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-slate-600" />
              </button>
              <span className="text-sm font-semibold text-slate-700">
                Página <span className="text-emerald-600 font-bold">{currentPage}</span> de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          )}
        </div>

        <ClientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveClient}
          client={selectedClient}
          isReadOnly={isReadOnly}
        />
      </div>
    </MainLayout>
  );
};

export default Clients;