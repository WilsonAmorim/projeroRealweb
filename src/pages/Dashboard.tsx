import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Users, DollarSign, Settings, Wrench, Loader2, RotateCw, Edit, Trash2, X, Eye, Calendar, Save } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../config/supabase';
import DashboardCard from '../components/os/DashboardCard';
import logo from '../assets/logo_real.jpg';

interface ActiveOS {
  id_os: number;
  cliente: { nome_razao_social: string };
  motor: { num_serie: string; especificacao: string };
  data_abertura: string;
  andamento: string;
}

const Dashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
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
        supabase.from('usuarios').select('*, perfis_acesso(nome_perfil)').order('nome_completo'),
        supabase.from('perfis_acesso').select('*').order('nome_perfil')
      ]);

      if (userReq.error) throw userReq.error;
      if (profilesReq.error) throw profilesReq.error;

      setUsuariosList(userReq.data || []);
      setPerfisList(profilesReq.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error.message);
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
    
    // Validação inicial dos campos obrigatórios
    if (!usuarioNome.trim() || !usuarioEmail.trim() || !usuarioPerfil || (!editingUsuario && !usuarioPassword)) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSavingUsuario(true);
    try {
      if (editingUsuario) {
        // -------------------------------------------------------------
        // MODO EDIÇÃO: Atualização normal na tabela public.usuarios
        // -------------------------------------------------------------
        const payload = {
          nome_completo: usuarioNome.trim(),
          email: usuarioEmail.trim().toLowerCase(),
          id_perfil: Number(usuarioPerfil),
          ativo: usuarioAtivo
        };

        const { error } = await supabase
          .from('usuarios')
          .update(payload)
          .eq('id_usuario', editingUsuario.id_usuario);

        if (error) throw error;
        alert('Usuário atualizado com sucesso!');

      } else {
        // -------------------------------------------------------------
        // MODO CRIAÇÃO: Cadastra no Auth e a Trigger do banco copia para a tabela pública
        // -------------------------------------------------------------
        const { error } = await supabase.auth.signUp({
          email: usuarioEmail.trim().toLowerCase(),
          password: usuarioPassword,
          options: {
            data: { 
              full_name: usuarioNome.trim(),
              id_perfil: Number(usuarioPerfil) 
            }
          }
        });

        if (error) throw error;

        // Caso a confirmação de e-mail ainda esteja ativa no seu painel do Supabase,
        // o usuário precisará clicar no link antes de logar, mas o cadastro foi feito.
        alert('Usuário criado com sucesso no sistema!');
      }

      // Limpa o formulário e recarrega a lista do painel
      clearUsuarioForm();
      await fetchUsuarios();

    } catch (error: any) {
      console.error('Erro detalhado ao salvar usuário:', error);
      alert(error.message || 'Erro inesperado ao salvar usuário.');
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

  const handleDeleteUsuario = async (id: string) => {
    if (!confirm('Deseja realmente excluir permanentemente este usuário da lista?')) return;

    try {
      const { error } = await supabase.from('usuarios').delete().eq('id_usuario', id);
      if (error) throw error;

      if (editingUsuario?.id_usuario === id) {
        clearUsuarioForm();
      }
      await fetchUsuarios();
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error.message);
      alert('Erro ao excluir usuário.');
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
      preco: preco.trim() !== '' ? Number(String(preco).replace(',', '.')) : null
    };

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('rebobinamentos')
          .update(payload)
          .eq('id_rebobinamento', editingItem.id_rebobinamento);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('rebobinamentos').insert([payload]);
        if (error) throw error;
      }
      clearForm();
      await fetchRebobinamentos();
    } catch (error: any) {
      console.error('Erro ao salvar rebobinamento:', error.message);
      alert('Erro ao salvar rebobinamento.');
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
      await fetchRebobinamentos();
    } catch (error: any) {
      console.error('Erro ao excluir rebobinamento:', error.message);
      alert('Erro ao excluir rebobinamento.');
    }
  };

  const perfilExibicao = profile?.nome_perfil || 'Usuário';

  // CARREGA OPÇÕES DOS SELECTS (Andamentos e Causas)
  useEffect(() => {
    const loadModalOptions = async () => {
      const [andamentosReq, causasReq] = await Promise.all([
        supabase.from('andamento_servico').select('id_andamento, descricao_andamento').order('id_andamento'),
        supabase.from('causas_queima').select('id_causa_queima, descricao_causa').order('descricao_causa')
      ]);
      if (!andamentosReq.error) setAndamentosOptions(andamentosReq.data || []);
      if (!causasReq.error) setCausasOptions(causasReq.data || []);
    };
    loadModalOptions();
  }, []);

  // ABRE O DETALHE POPULANDO OS CAMPOS EDITÁVEIS
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
          andamento_servico!ordens_servico_id_andamento_fkey(descricao_andamento),
          motores(
            num_serie, 
            fabricante,
            modelo,
            potencia_cv_kw,
            unidade_cv_kw,
            rpm,
            especificacao,
            cliente(nome_razao_social, telefone, email)
          )
        `)
        .eq('id_os', id_os)
        .single();

      if (error) throw error;
      
      setSelectedOS(data);
      setEditAndamento(data.id_andamento ? String(data.id_andamento) : '');
      setEditCausaQueima(data.id_causa_queima ? String(data.id_causa_queima) : '');
      setEditObservacoes(data.observacoes_gerais ?? '');
      setIsViewModalOpen(true);
    } catch (err: any) {
      console.error("Erro ao buscar detalhes da O.S:", err.message);
      alert("Não foi possível carregar os detalhes desta ordem.");
    }
  };

  // SALVA AS ALTERAÇÕES DE ANDAMENTO E CAUSA NO SUPABASE
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
          observacoes_gerais: editObservacoes.trim() || null
        })
        .eq('id_os', selectedOS.id_os);

      if (error) throw error;

      setIsViewModalOpen(false);
      await fetchActiveOSList(); 
      alert("Ordem de Serviço atualizada com sucesso!");
    } catch (err: any) {
      console.error("Erro ao atualizar O.S no Supabase:", err.message);
      alert("Erro ao salvar alterações da O.S.");
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
          nome_razao_social: os.motor?.cliente?.nome_razao_social || 'N/D'
        },
        motor: {
          num_serie: os.motor?.num_serie || 'N/D',
          especificacao: os.motor?.especificacao || ''
        }
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

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header / Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <img src={logo} alt="RealServiços" className="h-10 w-auto" />
              <span className="ml-2 text-xl font-bold text-gray-700 uppercase tracking-tight">Real Serviços</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600 border-r pr-4 border-gray-200">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-bold text-gray-900">{profile?.nome || 'Usuário'}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 font-black uppercase tracking-tighter">
                    {perfilExibicao}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-all hover:bg-red-50 rounded-full"
                title="Sair do sistema"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 w-full">
        {/* Grade de Módulos Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/clientes" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
            <div className="p-3 bg-blue-50 rounded-lg w-fit mb-4 group-hover:bg-blue-600 transition-colors">
              <Users className="h-6 w-6 text-blue-600 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Clientes</h3>
            <p className="text-xs text-gray-500 mt-1">Gestão de cadastros e vínculos de motores</p>
          </Link>

          <Link to="/motores" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
            <div className="p-3 bg-orange-50 rounded-lg w-fit mb-4 group-hover:bg-orange-600 transition-colors">
              <Settings className="h-6 w-6 text-orange-600 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Motores</h3>
            <p className="text-xs text-gray-500 mt-1">Fichas técnicas e histórico de manutenção</p>
          </Link>

          {/* Restrição de Acesso Admin baseada no id_perfil */}
          {Number(profile?.id_perfil) === 1 && (
            <>
              <button
                type="button"
                onClick={() => navigate('/faturamento')}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group text-left w-full cursor-pointer"
              >
                <div className="p-3 bg-emerald-50 rounded-lg w-fit mb-4 group-hover:bg-emerald-600 transition-colors">
                  <DollarSign className="h-6 w-6 text-emerald-600 group-hover:text-white" />
                </div>
                <h3 className="font-bold text-gray-900">Faturamento</h3>
                <p className="text-xs text-gray-500 mt-1">Fluxo de caixa e ordens concluídas</p>
              </button>

              <button
                type="button"
                onClick={() => setIsUsuariosOpen(true)}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group text-left w-full cursor-pointer"
              >
                <div className="p-3 bg-indigo-50 rounded-lg w-fit mb-4 group-hover:bg-indigo-600 transition-colors">
                  <Users className="h-6 w-6 text-indigo-600 group-hover:text-white" />
                </div>
                <h3 className="font-bold text-gray-900">Usuários</h3>
                <p className="text-xs text-gray-500 mt-1">Gestão de perfis e acessos do sistema</p>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsRebobinamentosOpen(true)}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group text-left w-full outline-none"
          >
            <div className="p-3 bg-purple-50 rounded-lg w-fit mb-4 group-hover:bg-purple-600 transition-colors">
              <RotateCw className="h-6 w-6 text-purple-600 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Rebobinamentos</h3>
            <p className="text-xs text-gray-500 mt-1">Cadastro e alteração de tipos de rebobinamento</p>
          </button>
        </div>

        {/* Seção da Fila de Trabalho */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8 border-b pb-4 border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Wrench className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Fila de Trabalho</h2>
                <p className="text-xs text-gray-400">Ordens de serviço em andamento na oficina</p>
              </div>
            </div>
            <div className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-xs font-bold shadow-sm">
              {activeOSList.length} ATIVAS
            </div>
          </div>

          {isLoadingOS ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4 opacity-20" />
              <p className="text-sm text-gray-400 animate-pulse font-medium">Sincronizando dados...</p>
            </div>
          ) : activeOSList.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl py-24 flex flex-col items-center text-center px-4">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Wrench className="h-10 w-10 text-gray-200" />
              </div>
              <p className="text-lg font-bold text-gray-700">Oficina em dia!</p>
              <p className="text-sm text-gray-400 max-w-xs mt-2">
                Não há ordens de serviço pendentes ou em execução no momento.
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
      </main>

      {/* Modal Rebobinamentos */}
      {isRebobinamentosOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center space-x-2">
                <RotateCw className="h-5 w-5 text-purple-600 animate-spin" style={{ animationDuration: '3s' }} />
                <h3 className="text-lg font-bold text-gray-800">Tipos de Rebobinamento</h3>
              </div>
              <button
                onClick={() => { setIsRebobinamentosOpen(false); clearForm(); }}
                className="p-1.5 hover:bg-gray-200/60 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <form onSubmit={handleSubmitRebobinamento} className="bg-purple-50/30 border border-purple-100 p-4 rounded-xl space-y-4">
                <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider">
                  {editingItem ? 'Editar Tipo de Rebobinamento' : 'Novo Tipo de Rebobinamento'}
                </label>
                
                <div className="space-y-3">
                  <div>
                    <span className="block text-xs font-bold text-gray-500 mb-1">Descrição</span>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      placeholder="Ex: Rebobinamento Estator, Classe H, etc..."
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      disabled={isSavingRebobinamentos}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="block text-xs font-bold text-gray-500 mb-1">Potência (CV)</span>
                      <input
                        type="text"
                        placeholder="Ex: 5.5"
                        value={cv}
                        onChange={(e) => setCv(e.target.value)}
                        disabled={isSavingRebobinamentos}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-500 mb-1">Polos</span>
                      <input
                        type="number"
                        placeholder="Ex: 4"
                        value={polos}
                        onChange={(e) => setPolos(e.target.value)}
                        disabled={isSavingRebobinamentos}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-500 mb-1">Preço (R$)</span>
                      <input
                        type="text"
                        placeholder="Ex: 1250,00"
                        value={preco}
                        onChange={(e) => setPreco(e.target.value)}
                        disabled={isSavingRebobinamentos}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    {editingItem && (
                      <button type="button" onClick={clearForm} className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg text-sm hover:bg-gray-200">
                        Cancelar
                      </button>
                    )}
                    <button type="submit" disabled={isSavingRebobinamentos || !descricao.trim()} className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg text-sm hover:bg-purple-700 flex items-center space-x-1.5 shadow-sm">
                      {isSavingRebobinamentos ? <Loader2 className="h-4 w-4 animate-spin" /> : editingItem ? <span>Atualizar</span> : <span>Adicionar</span>}
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tipos Cadastrados</h4>
                {isLoadingRebobinamentos ? (
                  <div className="py-12 flex justify-center items-center"><Loader2 className="h-8 w-8 text-purple-600 animate-spin opacity-40" /></div>
                ) : rebobinamentosList.length === 0 ? (
                  <div className="py-12 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-center px-4 bg-gray-50/50">
                    <p className="text-sm font-semibold text-gray-500">Nenhum tipo cadastrado</p>
                  </div>
                ) : (
                  <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                          <th className="px-4 py-3">Descrição</th>
                          <th className="px-4 py-3 text-center">CV</th>
                          <th className="px-4 py-3 text-center">Polos</th>
                          <th className="px-4 py-3 text-right">Preço</th>
                          <th className="px-4 py-3 text-center w-24">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {rebobinamentosList.map((item) => (
                          <tr key={item.id_rebobinamento} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-4 py-3 text-sm font-medium text-gray-700">{item.descricao_rebobinamento}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 text-center">{item.cv ? `${item.cv} CV` : '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 text-center">{item.polos ? `${item.polos}P` : '-'}</td>
                            <td className="px-4 py-3 text-sm font-bold text-gray-800 text-right">
                              {item.preco ? Number(item.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button type="button" onClick={() => handleEditRebobinamento(item)} className="p-1.5 text-gray-400 hover:text-purple-600 rounded-lg"><Edit className="h-4 w-4" /></button>
                                <button type="button" onClick={() => handleDeleteRebobinamento(item.id_rebobinamento)} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Usuários */}
      {isUsuariosOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-800">Gestão de Usuários</h3>
              </div>
              <button onClick={() => { setIsUsuariosOpen(false); clearUsuarioForm(); }} className="p-1.5 hover:bg-gray-200/60 rounded-lg text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <form onSubmit={handleSubmitUsuario} className="bg-indigo-50/30 border border-indigo-100 p-4 rounded-xl space-y-4">
                <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
                </label>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="block text-xs font-bold text-gray-500 mb-1">Nome Completo</span>
                      <input type="text" required maxLength={150} placeholder="Nome do usuário" value={usuarioNome} onChange={(e) => setUsuarioNome(e.target.value)} disabled={isSavingUsuario} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-500 mb-1">E-mail</span>
                      <input type="email" required maxLength={150} placeholder="email@exemplo.com" value={usuarioEmail} onChange={(e) => setUsuarioEmail(e.target.value)} disabled={isSavingUsuario} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <span className="block text-xs font-bold text-gray-500 mb-1">{editingUsuario ? 'Nova Senha (opcional)' : 'Senha'}</span>
                      <input type="password" required={!editingUsuario} placeholder={editingUsuario ? 'Deixar em branco' : 'Senha de acesso'} value={usuarioPassword} onChange={(e) => setUsuarioPassword(e.target.value)} disabled={isSavingUsuario} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-500 mb-1">Perfil de Acesso</span>
                      <select required value={usuarioPerfil} onChange={(e) => setUsuarioPerfil(e.target.value)} disabled={isSavingUsuario} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none">
                        <option value="">Selecione um perfil</option>
                        {perfisList.map(p => <option key={p.id_perfil} value={p.id_perfil}>{p.nome_perfil}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={usuarioAtivo} onChange={(e) => setUsuarioAtivo(e.target.checked)} disabled={isSavingUsuario} className="rounded text-indigo-600 shadow-sm focus:ring-0" />
                        <span className="text-sm font-semibold text-gray-700">Usuário Ativo</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    {editingUsuario && <button type="button" onClick={clearUsuarioForm} className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg text-sm hover:bg-gray-200">Cancelar</button>}
                    <button type="submit" disabled={isSavingUsuario} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm hover:bg-indigo-700 flex items-center space-x-1.5 shadow-sm">
                      {isSavingUsuario ? <Loader2 className="h-4 w-4 animate-spin" /> : editingUsuario ? <span>Atualizar Usuário</span> : <span>Adicionar Usuário</span>}
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Usuários Cadastrados</h4>
                {isLoadingUsuarios ? (
                  <div className="py-12 flex justify-center items-center"><Loader2 className="h-8 w-8 text-indigo-600 animate-spin opacity-40" /></div>
                ) : usuariosList.length === 0 ? (
                  <div className="py-12 text-center text-gray-500"><p className="text-sm">Nenhum usuário encontrado</p></div>
                ) : (
                  <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                          <th className="px-4 py-3">Nome</th>
                          <th className="px-4 py-3">E-mail</th>
                          <th className="px-4 py-3 text-center">Perfil</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-center w-24">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {usuariosList.map((user) => (
                          <tr key={user.id_usuario} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-4 py-3 text-sm font-medium text-gray-700">{user.nome_completo}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                            <td className="px-4 py-3 text-sm text-center"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs border border-gray-200">{user.perfis_acesso?.nome_perfil}</span></td>
                            <td className="px-4 py-3 text-sm text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.ativo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border`}>
                                {user.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button type="button" onClick={() => handleEditUsuario(user)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg"><Edit className="h-4 w-4" /></button>
                                <button type="button" onClick={() => handleDeleteUsuario(user.id_usuario)} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização + Alteração de Andamento e Causa da Queima */}
      {isViewModalOpen && selectedOS && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">Painel de Controle da O.S. #{selectedOS.id_os}</h3>
              </div>
              <button type="button" onClick={() => setIsViewModalOpen(false)} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Formulário Interativo */}
            <form onSubmit={handleUpdateOSFields} className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
              
              {/* Seção 1: Status e Data de Entrada */}
              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="text-xs text-gray-500 block font-bold uppercase mb-1">Alterar Status / Andamento</label>
                  <select
                    value={editAndamento}
                    onChange={(e) => setEditAndamento(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg font-semibold text-blue-700 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    {andamentosOptions.map((opt) => (
                      <option key={opt.id_andamento} value={opt.id_andamento}>
                        {opt.descricao_andamento}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:text-right">
                  <span className="text-xs text-gray-400 block font-bold uppercase mb-1">Data de Entrada</span>
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1 sm:justify-end">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    {selectedOS.data_entrada ? new Date(selectedOS.data_entrada).toLocaleDateString('pt-BR') : 'N/D'}
                  </span>
                </div>
              </div>

              {/* Seção 2: Causa da Queima (Editável) */}
              <div className="bg-amber-50/30 p-5 rounded-xl border border-amber-100/70">
                <label className="text-xs text-amber-800 block font-bold uppercase mb-1.5">Diagnóstico: Causa da Queima</label>
                <select
                  value={editCausaQueima}
                  onChange={(e) => setEditCausaQueima(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-200 text-gray-700 rounded-lg font-medium outline-none text-xs focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">Não identificada / Não informada</option>
                  {causasOptions.map((causa) => (
                    <option key={causa.id_causa_queima} value={causa.id_causa_queima}>
                      {causa.descricao_causa}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seção 3: Dados do Proprietário */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dados do Proprietário</h4>
                <div className="bg-white border rounded-xl p-4 space-y-2 bg-gray-50/40">
                  <p><span className="font-semibold text-gray-500">Razão Social / Nome:</span> <span className="text-gray-900 font-medium">{selectedOS.motores?.cliente?.nome_razao_social}</span></p>
                  <p><span className="font-semibold text-gray-500">Telefone:</span> <span className="text-gray-700">{selectedOS.motores?.cliente?.telefone || '-'}</span></p>
                  <p><span className="font-semibold text-gray-500">E-mail:</span> <span className="text-gray-700">{selectedOS.motores?.cliente?.email || '-'}</span></p>
                </div>
              </div>

              {/* Seção 4: Especificação Técnica */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Especificação Técnica do Motor</h4>
                <div className="bg-white border rounded-xl p-4 grid grid-cols-2 gap-3 bg-gray-50/40">
                  <p><span className="font-semibold text-gray-500">Nº Série:</span> <span className="text-gray-900 font-bold">{selectedOS.motores?.num_serie}</span></p>
                  <p><span className="font-semibold text-gray-500">Fabricante:</span> <span className="text-gray-700">{selectedOS.motores?.fabricante || '-'}</span></p>
                  <p><span className="font-semibold text-gray-500">Modelo:</span> <span className="text-gray-700">{selectedOS.motores?.modelo || '-'}</span></p>
                  <p><span className="font-semibold text-gray-500">Potência:</span> <span className="text-blue-600 font-bold">{selectedOS.motores?.potencia_cv_kw} {selectedOS.motores?.unidade_cv_kw}</span></p>
                  <p className="col-span-2"><span className="font-semibold text-gray-500">Aplicação/Ficha:</span> <span className="text-gray-700">{selectedOS.motores?.especificacao || '-'}</span></p>
                </div>
              </div>

              {/* Seção 5: Observações / Defeito (Editável) */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Defeito Relatado / Observações do Painel</h4>
                <textarea
                  value={editObservacoes}
                  onChange={(e) => setEditObservacoes(e.target.value)}
                  rows={3}
                  placeholder="Observações gerais sobre os defeitos ou andamento interno na oficina..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none resize-none text-xs focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              {/* Footer Ações */}
              <div className="pt-4 border-t flex justify-end space-x-2 bg-white">
                <button type="button" onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg transition-colors text-xs">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingOS}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-xs flex items-center space-x-1.5 shadow-sm shadow-blue-500/10 disabled:opacity-50"
                >
                  {isUpdatingOS ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;