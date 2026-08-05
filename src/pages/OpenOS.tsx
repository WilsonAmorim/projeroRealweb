import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Search, 
  Plus, 
  UserPlus, 
  Wrench, 
  Loader2, 
  Tag, 
  XCircle, 
  RotateCcw,
  FilePlus,
  Building2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../contexts/ToastContext';
import { MainLayout } from '../components/layout/MainLayout';
import type { Motor } from '../types/motor';

const ITEMS_PER_PAGE = 10;

const OpenOS: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [clienteSearch, setClienteSearch] = useState('');
  const [motorSearch, setMotorSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [motors, setMotors] = useState<Motor[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedCliente = useDebounce(clienteSearch, 400);
  const debouncedMotor = useDebounce(motorSearch, 400);
  const debouncedTag = useDebounce(tagSearch, 400);

  const fetchMotors = useCallback(async () => {
    setIsLoading(true);
    try {
      let queryBuilder = supabase.from('motores').select(`
        *,
        cliente (
          id_cliente,
          nome_razao_social,
          documento,
          cidade
        )
      `);

      // 1. Filtro de Cliente (id_cliente ou nome/razão social)
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

      // 2. Filtro de Motor (id_motor, num_serie, modelo ou fabricante)
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

      const { data, error } = await queryBuilder
        .order('id_motor', { ascending: false })
        .limit(500);

      if (error) throw error;
      setMotors(data || []);
      setCurrentPage(1);
    } catch (error: any) {
      console.error('Erro ao buscar motores:', error.message || error);
      showToast('Erro ao realizar busca de motores.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedCliente, debouncedMotor, debouncedTag, showToast]);

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

  const handleOpenOS = (idMotor?: number) => {
    if (!idMotor) return;
    navigate(`/os/abrir/${idMotor}`);
  };

  return (
    <MainLayout pageTitle="Abertura de Ordem de Serviço">
      <div className="space-y-6">
        {/* Banner de Cabeçalho */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <FilePlus className="h-7 w-7 text-emerald-400" />
              <span>Nova Ordem de Serviço</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Localize o equipamento associando as buscas por Cliente, Motor e Tag do Cliente.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/clientes')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4 text-emerald-400" />
              <span>Cadastrar Cliente</span>
            </button>
            <button
              onClick={() => navigate('/motores')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <Wrench className="h-4 w-4 text-emerald-400" />
              <span>Cadastrar Motor</span>
            </button>
          </div>
        </div>

        {/* Card dos 3 Campos de Busca */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-500" />
              <span>Pesquisa de Equipamentos</span>
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Limpar Filtros
              </button>
            )}
          </div>

          {/* Grid com as 3 buscas paralelas conforme modelo */}
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
        </div>

        {/* Tabela de Resultados */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isLoading ? 'Buscando...' : `${motors.length} equipamento(s) encontrado(s)`}
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-medium">Carregando equipamentos...</p>
            </div>
          ) : motors.length === 0 ? (
            <div className="p-12 text-center">
              <Wrench className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Nenhum equipamento encontrado</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Tente ajustar os termos de busca de Cliente, Motor ou Tag do Cliente, ou cadastre o cliente/motor se for novo.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => navigate('/clientes')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Cadastrar Cliente
                </button>
                <button
                  onClick={() => navigate('/motores')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Cadastrar Motor
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">ID Motor</th>
                      <th className="px-6 py-3.5">Cliente</th>
                      <th className="px-6 py-3.5">Nº Série / Modelo</th>
                      <th className="px-6 py-3.5">TAG Cliente</th>
                      <th className="px-6 py-3.5">Potência / RPM</th>
                      <th className="px-6 py-3.5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedMotors.map((m) => (
                      <tr key={m.id_motor} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-800">
                          #{m.id_motor}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{m.cliente?.nome_razao_social || 'Cliente N/D'}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            ID Cliente: #{m.id_cliente}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">
                            {m.num_serie || 'Sem Nº Série'}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {m.fabricante || 'Fabricante N/D'} {m.modelo ? `• ${m.modelo}` : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {m.tag_cliente ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 font-mono text-xs font-semibold">
                              <Tag className="h-3 w-3" />
                              {m.tag_cliente}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600">
                          {m.potencia_cv_kw ? `${m.potencia_cv_kw} ${m.unidade_cv_kw || ''}` : 'N/D'}
                          {m.rpm ? ` • ${m.rpm} RPM` : ''}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenOS(m.id_motor)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 transition-all shrink-0 active:scale-95"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Abrir O.S.</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rodapé com Paginação */}
              {!isLoading && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50 gap-4">
                  <div className="text-xs font-semibold text-slate-500">
                    Exibindo {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, motors.length)} a {Math.min(currentPage * ITEMS_PER_PAGE, motors.length)} de {motors.length} resultados
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <ChevronLeft className="h-4 w-4 text-slate-600" />
                    </button>
                    <span className="text-xs font-semibold text-slate-700">
                      Página <span className="text-emerald-600 font-bold">{currentPage}</span> de {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <ChevronRight className="h-4 w-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default OpenOS;