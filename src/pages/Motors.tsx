import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Motor } from '../types/motor';
import { useDebounce } from '../hooks/useDebounce';
import SearchBar from '../components/common/SearchBar';
import { Plus, Wrench, ChevronLeft, ChevronRight, Package, XCircle } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);
  const [loadingOSId] = useState<number | null>(null);

  const clienteIdFiltro = searchParams.get('clienteId');

  const userProfileId = profile?.id_perfil ? String(profile.id_perfil) : '';
  const canEdit = userProfileId === '1' || userProfileId === '2';
  const canDelete = userProfileId === '1' || userProfileId === '2';

  const debouncedSearch = useDebounce(searchQuery, 500);

  const fetchMotors = useCallback(
    async (query?: string) => {
      setIsLoading(true);
      try {
        let queryBuilder = supabase.from('motores').select('*, cliente(*)');

        if (query && query.trim()) {
          const trimmed = query.trim();
          queryBuilder = queryBuilder.or(
            `num_serie.ilike.%${trimmed}%,fabricante.ilike.%${trimmed}%,modelo.ilike.%${trimmed}%,cliente.nome_razao_social.ilike.%${trimmed}%`
          );
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
    },
    [clienteIdFiltro, showToast]
  );

  useEffect(() => {
    fetchMotors(debouncedSearch);
  }, [debouncedSearch, fetchMotors]);

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
      fetchMotors(debouncedSearch);
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
      fetchMotors(debouncedSearch);
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

        {/* Busca e Tabela */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[280px]">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar por Nº de Série, Fabricante ou Cliente..."
              />
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <Package className="h-4 w-4" />
              <span>{motors.length} {motors.length === 1 ? 'motor' : 'motores'}</span>
            </div>
          </div>

          {clienteIdFiltro && (
            <div className="flex items-center">
              <div className="bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-200 flex items-center shadow-sm">
                <span className="mr-2">Filtrando Motores por Cliente</span>
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