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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* HEADER SUPERIOR */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Toggle Mobile */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Abrir Menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <div
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <div className="h-10 px-2 py-1 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <img src={logo} alt="Real Serviços" className="h-8 object-contain" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
                    REAL SERVIÇOS
                  </h1>
                  <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase leading-none mt-0.5">
                    Oficina Eletromecânica
                  </p>
                </div>
              </div>
            </div>

            {/* Breadcrumb Titulo no centro (Desktop) */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-slate-300">
              <span className="text-slate-400">Sistema</span>
              <ChevronRight className="h-4 w-4 text-slate-600" />
              <span className="font-semibold text-white bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/50">
                {getBreadcrumbs()}
              </span>
            </div>

            {/* Perfil & Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
                <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-sm shadow-inner">
                  {profile?.nome ? profile.nome.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-100 truncate max-w-[140px]">
                    {profile?.nome || 'Usuário'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide flex items-center">
                    <ShieldCheck className="h-3 w-3 mr-1 text-emerald-400 inline" />
                    {perfilExibicao}
                  </span>
                </div>
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
        </div>
      </header>

      {/* CONTAINER PRINCIPAL: SIDEBAR + CONTEÚDO */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* SIDEBAR DESKTOP */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-6">
          <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 shadow-lg border border-slate-800 flex flex-col justify-between h-full min-h-[calc(100vh-8rem)]">
            <div className="space-y-6">
              {/* Seção Navegação Principal */}
              <div>
                <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Navegação
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

              {/* Seção Gestão e Configurações (Se Admin ou com ações) */}
              {(onOpenRebobinamentos || (isAdmin && onOpenUsuarios)) && (
                <div className="pt-4 border-t border-slate-800">
                  <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
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

            {/* Rodapé da Sidebar */}
            <div className="pt-4 border-t border-slate-800">
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <div className="text-[11px] leading-tight text-slate-400">
                  <p className="font-semibold text-slate-200">Supabase Online</p>
                  <p className="text-slate-500">v2.1.0 • Produção</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* DRAWER MOBILE */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
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

        {/* CONTEÚDO PRINCIPAL DA PÁGINA */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};
