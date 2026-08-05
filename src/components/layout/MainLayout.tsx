import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Wrench,
  DollarSign,
  LogOut,
  Menu,
  X,
  User,
  ChevronRight,
  ShieldCheck,
  RotateCw,
  Settings,
} from 'lucide-react';
import logo from '../../assets/logo_real_completo.png';

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  onOpenRebobinamentos?: () => void;
  onOpenUsuarios?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  pageTitle,
  onOpenRebobinamentos,
  onOpenUsuarios,
}) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const userRole = profile?.id_perfil ? Number(profile.id_perfil) : 0;
  const isAdmin = userRole === 1;

  let perfilExibicao = 'Usuário';
  if (userRole === 1) perfilExibicao = 'Administrador';
  else if (userRole === 2) perfilExibicao = 'Recepção';
  else if (userRole === 3) perfilExibicao = 'Mecânico';

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: [1, 2, 3],
    },
    {
      name: 'Clientes',
      path: '/clientes',
      icon: Users,
      roles: [1, 2, 3],
    },
    {
      name: 'Motores',
      path: '/motores',
      icon: Wrench,
      roles: [1, 2, 3],
    },
    {
      name: 'Faturamento',
      path: '/faturamento',
      icon: DollarSign,
      roles: [1], // Somente Admin
    },
  ];

  const getBreadcrumbs = () => {
    if (pageTitle) return pageTitle;
    switch (location.pathname) {
      case '/dashboard':
        return 'Visão Geral das OS';
      case '/clientes':
        return 'Gestão de Clientes';
      case '/motores':
        return 'Cadastro de Motores';
      case '/faturamento':
        return 'Relatórios e Faturamento';
      default:
        if (location.pathname.startsWith('/os/abrir')) return 'Nova Ordem de Serviço';
        if (location.pathname.includes('/acompanhamento')) return 'Acompanhamento de Serviço';
        if (location.pathname.includes('/orcamento')) return 'Orçamento da OS';
        if (location.pathname.includes('/laudo-mecanico')) return 'Laudo Mecânico';
        if (location.pathname.includes('/laudo-eletrico')) return 'Laudo Elétrico';
        if (location.pathname.startsWith('/os/')) return 'Detalhes da OS';
        return 'Painel de Controle';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* SIDEBAR FIXA À ESQUERDA (DESKTOP) */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-slate-900 text-slate-200 border-r border-slate-800 z-40 flex-col justify-between p-4 shadow-xl">
        <div className="space-y-6">
          {/* Logo & Marca da Empresa */}
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-3 cursor-pointer p-2 rounded-xl hover:bg-slate-800/60 transition-colors"
          >
            <div className="h-10 px-2 py-1 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <img src={logo} alt="Real Serviços" className="h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-white leading-none">
                REAL SERVIÇOS
              </h1>
              <p className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase leading-none mt-1">
                Oficina Eletromecânica
              </p>
            </div>
          </div>

          {/* Navegação Principal */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Menu Principal
            </p>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isAllowed = item.roles.includes(userRole);
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                if (!isAllowed) return null;

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Seção Gestão e Configurações */}
          {(onOpenRebobinamentos || (isAdmin && onOpenUsuarios)) && (
            <div className="pt-4 border-t border-slate-800">
              <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Configurações & Tabelas
              </p>
              <div className="space-y-1.5">
                {onOpenRebobinamentos && (
                  <button
                    onClick={onOpenRebobinamentos}
                    className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <RotateCw className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Tabela Rebobinamentos</span>
                  </button>
                )}

                {isAdmin && onOpenUsuarios && (
                  <button
                    onClick={onOpenUsuarios}
                    className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <Settings className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Gerenciar Usuários</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé da Sidebar Fixa */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50 flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
              {profile?.nome ? profile.nome.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-xs font-bold text-slate-100 truncate">
                {profile?.nome || 'Usuário'}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1 inline shrink-0" />
                {perfilExibicao}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-700/50 hover:border-red-800/50 text-xs font-bold transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO À DIREITA (DESKTOP: pl-64) */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        {/* HEADER SUPERIOR NO TOPO DO CONTEÚDO */}
        <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md border-b border-slate-800">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between h-16">
            {/* Esquerda: Logo Mobile + Breadcrumb */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Abrir Menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {/* Logo visível apenas no Mobile */}
              <div
                onClick={() => navigate('/dashboard')}
                className="lg:hidden flex items-center space-x-2 cursor-pointer"
              >
                <img src={logo} alt="Real Serviços" className="h-7 bg-white p-1 rounded" />
                <span className="font-bold text-white text-sm">Real Serviços</span>
              </div>

              {/* Breadcrumb em Desktop */}
              <div className="hidden lg:flex items-center space-x-2 text-sm text-slate-300">
                <span className="text-slate-400 font-medium">Sistema</span>
                <ChevronRight className="h-4 w-4 text-slate-600" />
                <span className="font-semibold text-white bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  {getBreadcrumbs()}
                </span>
              </div>
            </div>

            {/* Direita: Perfil Mobile & Botão Sair */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700/60">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-300">Supabase Conectado</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                title="Sair da Conta"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* DRAWER MOBILE */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-slate-900 text-white p-6 shadow-2xl z-50 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <img src={logo} alt="Real Serviços" className="h-8 bg-white p-1 rounded" />
                    <span className="font-bold text-white text-sm">Real Serviços</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const isAllowed = item.roles.includes(userRole);
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    if (!isAllowed) return null;

                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </nav>

                {(onOpenRebobinamentos || (isAdmin && onOpenUsuarios)) && (
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Administração
                    </p>
                    {onOpenRebobinamentos && (
                      <button
                        onClick={() => {
                          onOpenRebobinamentos();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800"
                      >
                        <RotateCw className="h-5 w-5 text-emerald-400" />
                        <span>Tabela Rebobinamentos</span>
                      </button>
                    )}
                    {isAdmin && onOpenUsuarios && (
                      <button
                        onClick={() => {
                          onOpenUsuarios();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800"
                      >
                        <Settings className="h-5 w-5 text-emerald-400" />
                        <span>Gerenciar Usuários</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-red-950/60 text-red-300 border border-red-800/50 rounded-xl font-bold"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sair do Sistema</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CORPO DA PÁGINA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full">{children}</main>
      </div>
    </div>
  );
};
