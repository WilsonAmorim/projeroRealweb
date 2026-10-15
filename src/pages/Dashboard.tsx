import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Wrench, Loader2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MainLayout } from '../components/layout/MainLayout';
import DashboardCard from '../components/os/DashboardCard';
import { EditOSModal } from '../components/os/EditOSModal';
import { RebobinamentosModal } from '../components/admin/RebobinamentosModal';
import { UserManagementModal } from '../components/admin/UserManagementModal';

interface ActiveOS {
  id_os: number;
  cliente: { nome_razao_social: string };
  motor: { num_serie: string; especificacao: string };
  data_abertura: string;
  andamento: string;
}

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeOSList, setActiveOSList] = useState<ActiveOS[]>([]);
  const [isLoadingOS, setIsLoadingOS] = useState(true);

  // Estados para o Modal de Edição/Visualização da O.S.
  const [selectedOS, setSelectedOS] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdatingOS, setIsUpdatingOS] = useState(false);

  // Listas auxiliares para os selects do Modal
  const [andamentosOptions, setAndamentosOptions] = useState<any[]>([]);
  const [causasOptions, setCausasOptions] = useState<any[]>([]);

  // Estados dos campos editáveis da O.S.
  const [editAndamento, setEditAndamento] = useState('');
  const [editCausaQueima, setEditCausaQueima] = useState('');
  const [editObservacoes, setEditObservacoes] = useState('');

  // Rebobinamentos states
  const [isRebobinamentosOpen, setIsRebobinamentosOpen] = useState(false);
  const [rebobinamentosList, setRebobinamentosList] = useState<any[]>([]);
  const [isLoadingRebobinamentos, setIsLoadingRebobinamentos] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [cv, setCv] = useState('');
  const [polos, setPolos] = useState('');
  const [preco, setPreco] = useState('');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSavingRebobinamentos, setIsSavingRebobinamentos] = useState(false);

  // Usuários states
  const [isUsuariosOpen, setIsUsuariosOpen] = useState(false);
  const [usuariosList, setUsuariosList] = useState<any[]>([]);
  const [perfisList, setPerfisList] = useState<any[]>([]);
  const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(false);

  const [usuarioNome, setUsuarioNome] = useState('');
  const [usuarioEmail, setUsuarioEmail] = useState('');
  const [usuarioPassword, setUsuarioPassword] = useState('');
  const [usuarioPerfil, setUsuarioPerfil] = useState('');
  const [usuarioAtivo, setUsuarioAtivo] = useState(true);
  const [editingUsuario, setEditingUsuario] = useState<any | null>(null);
  const [isSavingUsuario, setIsSavingUsuario] = useState(false);

  const clearForm = () => {
    setDescricao('');
    setCv('');
    setPolos('');
    setPreco('');
    setEditingItem(null);
  };

  const fetchRebobinamentos = async () => {
    setIsLoadingRebobinamentos(true);
    try {
      const { data, error } = await supabase
        .from('rebobinamentos')
        .select('*')
        .order('id_rebobinamento', { ascending: false });

      if (error) throw error;
      setRebobinamentosList(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar rebobinamentos:', error.message);
      showToast('Erro ao carregar rebobinamentos.', 'error');
    } finally {
      setIsLoadingRebobinamentos(false);
    }
  };

  useEffect(() => {
    if (isRebobinamentosOpen) {
      fetchRebobinamentos();
    }
  }, [isRebobinamentosOpen]);

  const clearUsuarioForm = () => {
    setUsuarioNome('');
    setUsuarioEmail('');
    setUsuarioPassword('');
    setUsuarioPerfil('');
    setUsuarioAtivo(true);
    setEditingUsuario(null);
  };

  const fetchUsuarios = async () => {
    setIsLoadingUsuarios(true);
    try {
      const [userReq, profilesReq] = await Promise.all([
        supabase.from('usuarios').select('*, perfil:perfis_acesso(nome_perfil)').order('nome_completo'),
        supabase.from('perfis_acesso').select('*').order('nome_perfil'),
      ]);

      if (userReq.error) throw userReq.error;
      if (profilesReq.error) throw profilesReq.error;

      setUsuariosList(userReq.data || []);
      setPerfisList(profilesReq.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error.message);
      showToast('Erro ao carregar usuários.', 'error');
    } finally {
      setIsLoadingUsuarios(false);
    }
  };

  useEffect(() => {
    if (isUsuariosOpen) {
      fetchUsuarios();
    }
  }, [isUsuariosOpen]);

  const handleSubmitUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioNome.trim() || !usuarioEmail.trim() || !usuarioPerfil || (!editingUsuario && !usuarioPassword)) {
      showToast('Preencha todos os campos obrigatórios do usuário.', 'error');
      return;
    }

    setIsSavingUsuario(true);
    try {
      if (editingUsuario) {
        const payload = {
          nome_completo: usuarioNome.trim(),
          email: usuarioEmail.trim().toLowerCase(),
          id_perfil: Number(usuarioPerfil),
          ativo: usuarioAtivo,
        };

        const { error } = await supabase
          .from('usuarios')
          .update(payload)
          .eq('id_usuario', editingUsuario.id_usuario);

        if (error) throw error;
        showToast('Usuário atualizado com sucesso!', 'success');
      } else {
        const { error } = await supabase.auth.signUp({
          email: usuarioEmail.trim().toLowerCase(),
          password: usuarioPassword,
          options: {
            data: {
              full_name: usuarioNome.trim(),
              id_perfil: Number(usuarioPerfil),
            },
          },
        });

        if (error) throw error;
        showToast('Usuário criado com sucesso no sistema!', 'success');
      }

      clearUsuarioForm();
      await fetchUsuarios();
    } catch (error: any) {
      console.error('Erro detalhado ao salvar usuário:', error);
      showToast(error.message || 'Erro ao salvar usuário.', 'error');
    } finally {
      setIsSavingUsuario(false);
    }
  };

  const handleEditUsuario = (user: any) => {
    setEditingUsuario(user);
    setUsuarioNome(user.nome_completo || '');
    setUsuarioEmail(user.email || '');
    setUsuarioPassword('');
    setUsuarioPerfil(user.id_perfil ? String(user.id_perfil) : '');
    setUsuarioAtivo(user.ativo !== false);
  };

  const handleToggleUsuarioStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ ativo: !currentStatus })
        .eq('id_usuario', id);

      if (error) throw error;
      showToast(`Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`, 'info');
      await fetchUsuarios();
    } catch (error: any) {
      console.error('Erro ao alterar status do usuário:', error.message);
      showToast('Erro ao alterar status do usuário.', 'error');
    }
  };

  const handleSubmitRebobinamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) return;

    setIsSavingRebobinamentos(true);
    const payload = {
      descricao_rebobinamento: descricao.trim(),
      cv: cv.trim() !== '' ? cv.trim() : null,
      polos: polos.trim() !== '' ? Number(polos) : null,
      preco: preco.trim() !== '' ? Number(String(preco).replace(',', '.')) : null,
    };

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('rebobinamentos')
          .update(payload)
          .eq('id_rebobinamento', editingItem.id_rebobinamento);

        if (error) throw error;
        showToast('Rebobinamento atualizado!', 'success');
      } else {
        const { error } = await supabase.from('rebobinamentos').insert([payload]);
        if (error) throw error;
        showToast('Rebobinamento criado!', 'success');
      }
      clearForm();
      await fetchRebobinamentos();
    } catch (error: any) {
      console.error('Erro ao salvar rebobinamento:', error.message);
      showToast('Erro ao salvar rebobinamento.', 'error');
    } finally {
      setIsSavingRebobinamentos(false);
    }
  };

  const handleEditRebobinamento = (item: any) => {
    setEditingItem(item);
    setDescricao(item.descricao_rebobinamento || '');
    setCv(item.cv !== null && item.cv !== undefined ? String(item.cv) : '');
    setPolos(item.polos !== null && item.polos !== undefined ? String(item.polos) : '');
    setPreco(item.preco !== null && item.preco !== undefined ? String(item.preco) : '');
  };

  const handleDeleteRebobinamento = async (id: number) => {
    if (!confirm('Deseja realmente excluir este tipo de rebobinamento?')) return;

    try {
      const { error } = await supabase.from('rebobinamentos').delete().eq('id_rebobinamento', id);
      if (error) throw error;

      if (editingItem?.id_rebobinamento === id) {
        clearForm();
      }
      showToast('Item excluído com sucesso!', 'info');
      await fetchRebobinamentos();
    } catch (error: any) {
      console.error('Erro ao excluir rebobinamento:', error.message);
      showToast('Erro ao excluir rebobinamento.', 'error');
    }
  };

  // CARREGA OPÇÕES DOS SELECTS
  useEffect(() => {
    const loadModalOptions = async () => {
      const [andamentosReq, causasReq] = await Promise.all([
        supabase.from('andamento_servico').select('id_andamento, descricao_andamento').order('id_andamento'),
        supabase.from('causas_queima').select('id_causa_queima, descricao_causa').order('descricao_causa'),
      ]);
      if (!andamentosReq.error) {
        setAndamentosOptions(
          (andamentosReq.data || []).map((a) => ({
            id_andamento: a.id_andamento,
            descricao: a.descricao_andamento,
          }))
        );
      }
      if (!causasReq.error) {
        setCausasOptions(
          (causasReq.data || []).map((c) => ({
            id_causa_queima: c.id_causa_queima,
            descricao: c.descricao_causa,
          }))
        );
      }
    };
    loadModalOptions();
  }, []);

  const handleOpenOSDetails = async (id_os: number) => {
    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          id_os,
          data_entrada,
          observacoes_gerais,
          id_andamento,
          id_causa_queima,
          fotos_queima,
          fotos_pecas_danificadas,
          andamento_servico!ordens_servico_id_andamento_fkey(descricao_andamento),
          motor:motores(
            *,
            cliente(*)
          )
        `)
        .eq('id_os', id_os)
        .single();

      if (error) throw error;

      // O cliente é vinculado ao motor (mesma relação usada na fila)
      const motorData: any = Array.isArray((data as any).motor) ? (data as any).motor[0] : (data as any).motor;
      setSelectedOS({ ...data, motor: motorData, cliente: motorData?.cliente ?? null });
      setEditAndamento(data.id_andamento ? String(data.id_andamento) : '');
      setEditCausaQueima(data.id_causa_queima ? String(data.id_causa_queima) : '');
      setEditObservacoes(data.observacoes_gerais ?? '');
      setIsViewModalOpen(true);
    } catch (err: any) {
      console.error('Erro ao buscar detalhes da O.S:', err.message);
      showToast('Não foi possível carregar os detalhes desta ordem.', 'error');
    }
  };

  const handleUpdateOSFields = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOS) return;

    setIsUpdatingOS(true);
    try {
      const { error } = await supabase
        .from('ordens_servico')
        .update({
          id_andamento: editAndamento ? Number(editAndamento) : null,
          id_causa_queima: editCausaQueima ? Number(editCausaQueima) : null,
          observacoes_gerais: editObservacoes.trim() || null,
        })
        .eq('id_os', selectedOS.id_os);

      if (error) throw error;

      setIsViewModalOpen(false);
      await fetchActiveOSList();
      showToast('Ordem de Serviço atualizada com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro ao atualizar O.S no Supabase:', err.message);
      showToast('Erro ao salvar alterações da O.S.', 'error');
    } finally {
      setIsUpdatingOS(false);
    }
  };

  const fetchActiveOSList = async () => {
    setIsLoadingOS(true);
    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          id_os,
          data_entrada,
          id_andamento,
          andamento_servico!ordens_servico_id_andamento_fkey(descricao_andamento),
          motor:motores(
            num_serie,
            especificacao,
            cliente(nome_razao_social)
          )
        `)
        .not('id_andamento', 'in', '(5,6)')
        .order('id_os', { ascending: true });

      if (error) throw error;

      const formatadas: ActiveOS[] = (data || []).map((os: any) => ({
        id_os: os.id_os,
        data_abertura: os.data_entrada || '',
        andamento: os.andamento_servico?.descricao_andamento || 'Pendente',
        cliente: {
          nome_razao_social: os.motor?.cliente?.nome_razao_social || 'N/D',
        },
        motor: {
          num_serie: os.motor?.num_serie || 'N/D',
          especificacao: os.motor?.especificacao || '',
        },
      }));

      setActiveOSList(formatadas);
    } catch (error: any) {
      console.error('Erro detalhado na consulta da fila:', error.message);
      setActiveOSList([]);
    } finally {
      setIsLoadingOS(false);
    }
  };

  useEffect(() => {
    fetchActiveOSList();
  }, []);

  return (
    <MainLayout
      onOpenRebobinamentos={() => setIsRebobinamentosOpen(true)}
      onOpenUsuarios={() => setIsUsuariosOpen(true)}
    >
      <div className="space-y-6">
        {/* Banner de Boas-vindas */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Fila de Serviços em Andamento
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Olá, <span className="text-slate-100 font-semibold">{profile?.nome || 'Usuário'}</span>. Acompanhe a esteira de manutenção dos motores elétricos.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/os/abrir')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Nova OS / Cliente</span>
            </button>
          </div>
        </div>

        {/* Card Principal de Ordens de Serviço */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Ordens de Serviço Ativas</h2>
                <p className="text-xs text-slate-400 font-medium">
                  Motores em triagem, inspeção, rebobinamento ou testes
                </p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 bg-slate-900 text-emerald-400 border border-slate-800 rounded-full text-xs font-bold shadow-sm">
              {activeOSList.length} OS EM EXECUÇÃO
            </span>
          </div>

          {isLoadingOS ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-3" />
              <p className="text-sm text-slate-400 font-medium animate-pulse">
                Carregando Ordens de Serviço...
              </p>
            </div>
          ) : activeOSList.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-16 flex flex-col items-center text-center px-4">
              <div className="bg-white p-3.5 rounded-full shadow-sm mb-3">
                <Wrench className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-base font-bold text-slate-700">Nenhuma Ordem Ativa</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Todas as ordens de serviço foram concluídas ou faturadas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOSList.map((os) => (
                <DashboardCard
                  key={os.id_os}
                  os={os as any}
                  onViewDetails={handleOpenOSDetails}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modais Refatorados */}
      <EditOSModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        selectedOS={selectedOS}
        andamentosOptions={andamentosOptions}
        causasOptions={causasOptions}
        editAndamento={editAndamento}
        setEditAndamento={setEditAndamento}
        editCausaQueima={editCausaQueima}
        setEditCausaQueima={setEditCausaQueima}
        editObservacoes={editObservacoes}
        setEditObservacoes={setEditObservacoes}
        isUpdatingOS={isUpdatingOS}
        onSave={handleUpdateOSFields}
      />

      <RebobinamentosModal
        isOpen={isRebobinamentosOpen}
        onClose={() => {
          setIsRebobinamentosOpen(false);
          clearForm();
        }}
        rebobinamentosList={rebobinamentosList}
        isLoading={isLoadingRebobinamentos}
        descricao={descricao}
        setDescricao={setDescricao}
        cv={cv}
        setCv={setCv}
        polos={polos}
        setPolos={setPolos}
        preco={preco}
        setPreco={setPreco}
        editingItem={editingItem}
        isSaving={isSavingRebobinamentos}
        onSave={handleSubmitRebobinamento}
        onEdit={handleEditRebobinamento}
        onDelete={handleDeleteRebobinamento}
        onClearForm={clearForm}
      />

      <UserManagementModal
        isOpen={isUsuariosOpen}
        onClose={() => {
          setIsUsuariosOpen(false);
          clearUsuarioForm();
        }}
        usuariosList={usuariosList}
        perfisList={perfisList}
        isLoading={isLoadingUsuarios}
        usuarioNome={usuarioNome}
        setUsuarioNome={setUsuarioNome}
        usuarioEmail={usuarioEmail}
        setUsuarioEmail={setUsuarioEmail}
        usuarioPassword={usuarioPassword}
        setUsuarioPassword={setUsuarioPassword}
        usuarioPerfil={usuarioPerfil}
        setUsuarioPerfil={setUsuarioPerfil}
        usuarioAtivo={usuarioAtivo}
        setUsuarioAtivo={setUsuarioAtivo}
        editingUsuario={editingUsuario}
        isSaving={isSavingUsuario}
        onSave={handleSubmitUsuario}
        onEdit={handleEditUsuario}
        onToggleStatus={handleToggleUsuarioStatus}
        onClearForm={clearUsuarioForm}
      />
    </MainLayout>
  );
};

export default Dashboard;