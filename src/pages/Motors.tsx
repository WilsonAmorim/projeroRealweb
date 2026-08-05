import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Motor } from '../types/motor';
import { useDebounce } from '../hooks/useDebounce';
import { Plus, Wrench, ChevronLeft, ChevronRight, Package, XCircle, Search, RotateCcw } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { MainLayout } from '../components/layout/MainLayout';

import MotorTable from '../components/motors/MotorTable';
import MotorModal from '../components/motors/MotorModal';

const ITEMS_PER_PAGE = 10;

const Motors: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [motors, setMotors] = useState<Motor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3 buscas associativas idênticas à tela de Nova OS
  const [clienteSearch, setClienteSearch] = useState('');
  const [motorSearch, setMotorSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);
  const [loadingOSId] = useState<number | null>(null);

  const clienteIdFiltro = searchParams.get('clienteId');

  const userProfileId = profile?.id_perfil ? String(profile.id_perfil) : '';
  const canEdit = userProfileId === '1' || userProfileId === '2';
  const canDelete = userProfileId === '1' || userProfileId === '2';

  const debouncedCliente = useDebounce(clienteSearch, 400);
  const debouncedMotor = useDebounce(motorSearch, 400);
  const debouncedTag = useDebounce(tagSearch, 400);

  const fetchMotors = useCallback(async () => {
    setIsLoading(true);
    try {
      let queryBuilder = supabase.from('motores').select('*, cliente(*)');

      // 1. Filtro por Cliente (id_cliente ou nome/razão social)
      if (debouncedCliente.trim()) {
        const term = debouncedCliente.trim();
        const isNum = !isNaN(Number(term)) && Number(term) > 0;

        let clientQuery = supabase.from('cliente').select('id_cliente');
        if (isNum) {
          clientQuery = clientQuery.or(`id_cliente.eq.${Number(term)},nome_razao_social.ilike.%${term}%`);
        } else {
          clientQuery = clientQuery.ilike('nome_razao_social', `%${term}%`);
        }

        const { data: matchedClients, error: clientErr } = await clientQuery;
        if (clientErr) throw clientErr;

        const clientIds = matchedClients?.map((c) => c.id_cliente) || [];
        if (clientIds.length > 0) {
          queryBuilder = queryBuilder.in('id_cliente', clientIds);
        } else {
          setMotors([]);
          setCurrentPage(1);
          setIsLoading(false);
          return;
        }
      }

      // 2. Filtro por Motor (id_motor, num_serie, modelo ou fabricante)
      if (debouncedMotor.trim()) {
        const term = debouncedMotor.trim();
        const isNum = !isNaN(Number(term)) && Number(term) > 0;

        if (isNum) {
          queryBuilder = queryBuilder.or(
            `id_motor.eq.${Number(term)},num_serie.ilike.%${term}%,modelo.ilike.%${term}%,fabricante.ilike.%${term}%`
          );
        } else {
          queryBuilder = queryBuilder.or(
            `num_serie.ilike.%${term}%,modelo.ilike.%${term}%,fabricante.ilike.%${term}%`
          );
        }
      }

      // 3. Filtro por Tag do Cliente
      if (debouncedTag.trim()) {
        const term = debouncedTag.trim();
        queryBuilder = queryBuilder.ilike('tag_cliente', `%${term}%`);
      }

      if (clienteIdFiltro) {
        queryBuilder = queryBuilder.eq('id_cliente', Number(clienteIdFiltro));
      }

      const { data, error } = await queryBuilder.order('id_motor', { ascending: false });

      if (error) throw error;

      setMotors(data || []);
      setCurrentPage(1);
    } catch (error: any) {
      console.error('ERRO DETALHADO:', error.message || error);
      showToast('Erro ao carregar motores.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedCliente, debouncedMotor, debouncedTag, clienteIdFiltro, showToast]);

  useEffect(() => {
    fetchMotors();
  }, [fetchMotors]);

  const hasActiveFilters = Boolean(clienteSearch || motorSearch || tagSearch);

  const clearFilters = () => {
    setClienteSearch('');
    setMotorSearch('');
    setTagSearch('');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(motors.length / ITEMS_PER_PAGE);
  const paginatedMotors = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return motors.slice(start, start + ITEMS_PER_PAGE);
  }, [motors, currentPage]);

  const handleSaveMotor = async (motorData: Motor) => {
    try {
      const { id_motor, cliente, data_criacao, data_atualizacao, ...payload } = motorData as any;

      if (id_motor) {
        const { data, error } = await supabase
          .from('motores')
          .update(payload)
          .eq('id_motor', id_motor)
          .select('*, cliente(*)')
          .single();

        if (error) throw error;
        showToast('Motor atualizado com sucesso!', 'success');
        setSelectedMotor(data || null);
      } else {
        const { data, error } = await supabase
          .from('motores')
          .insert([payload])
          .select('*, cliente(*)')
          .single();

        if (error) throw error;
        showToast('Motor cadastrado com sucesso!', 'success');
        setSelectedMotor(data || null);
      }

      setIsModalOpen(false);
      fetchMotors();
    } catch (error: any) {
      console.error('Erro ao salvar motor:', error);
      const msg = error.message || 'Erro ao salvar motor.';
      showToast(msg, 'error');
      throw error;
    }
  };

  const handleDeleteMotor = async (id: number) => {
    if (!window.confirm('Excluir este motor? Esta ação removerá o histórico técnico vinculado.')) return;
    try {
      const { error } = await supabase.from('motores').delete().eq('id_motor', id);
      if (error) throw error;
      showToast('Motor removido com sucesso.', 'info');
      fetchMotors();
    } catch (err: any) {
      console.error('Erro ao excluir motor:', err);
      showToast('Erro ao excluir motor.', 'error');
    }
  };

  const handleOpenOS = (motor: Motor) => {
    if (!motor.id_motor) {
      showToast('Erro: Motor sem ID identificado.', 'error');
      return;
    }
    navigate(`/os/abrir/${motor.id_motor}`);
  };

  const clearClientFilter = () => {
    setSearchParams({});
  };

  return (
    <MainLayout pageTitle="Cadastro de Motores">
      <div className="space-y-6">
        {/* Banner Superior */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Motores Elétricos e Equipamentos</h1>
              <p className="text-xs text-slate-400 font-medium">
                Catálogo técnico de motores por cliente, potência (CV/kW), rotação e número de série
              </p>
            </div>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setSelectedMotor(null);
                setIsReadOnly(false);
                setIsModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Motor</span>
            </button>
          )}
        </div>

        {/* Card com os 3 Campos de Busca Associativos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <span>Pesquisa de Equipamentos</span>
            </h2>
            <div className="flex items-center space-x-3">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Limpar Filtros
                </button>
              )}
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <Package className="h-4 w-4" />
                <span>{motors.length} {motors.length === 1 ? 'motor' : 'motores'}</span>
              </div>
            </div>
          </div>

          {/* Grid com os 3 inputs em linha */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca 1: Cliente */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Cliente
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={clienteSearch}
                  onChange={(e) => setClienteSearch(e.target.value)}
                  placeholder="ID ou Nome do Cliente..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
                {clienteSearch && (
                  <button
                    onClick={() => setClienteSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Busca 2: Motor */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Motor
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={motorSearch}
                  onChange={(e) => setMotorSearch(e.target.value)}
                  placeholder="ID, Nº Série, Modelo..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
                {motorSearch && (
                  <button
                    onClick={() => setMotorSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Busca 3: Tag Cliente */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Tag Cliente
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  placeholder="TAG do Cliente (ex: BOMBA-01)..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
                {tagSearch && (
                  <button
                    onClick={() => setTagSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {clienteIdFiltro && (
            <div className="flex items-center pt-2">
              <div className="bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-200 flex items-center shadow-sm">
                <span className="mr-2">Filtrando Motores por Cliente ID #{clienteIdFiltro}</span>
                <button
                  type="button"
                  onClick={clearClientFilter}
                  className="p-0.5 hover:bg-amber-200 rounded-full transition-colors"
                  title="Limpar Filtro"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <MotorTable
            motors={paginatedMotors}
            isLoading={isLoading}
            onEdit={(m) => {
              setSelectedMotor(m);
              setIsReadOnly(false);
              setIsModalOpen(true);
            }}
            onView={(m) => {
              setSelectedMotor(m);
              setIsReadOnly(true);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteMotor}
            onOpenOS={handleOpenOS}
            loadingOSId={loadingOSId}
            canEdit={canEdit}
            canDelete={canDelete}
          />

          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 pt-4">
              <button
                type="button"
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
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          )}
        </div>

        <MotorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveMotor}
          motor={selectedMotor}
          isReadOnly={isReadOnly}
        />
      </div>
    </MainLayout>
  );
};

export default Motors;