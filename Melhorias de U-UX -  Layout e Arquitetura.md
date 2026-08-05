# Plano de Implementação - Melhorias de UI/UX, Layout e Arquitetura

Este plano descreve a reformulação do layout principal da aplicação (com foco na navegação e menu lateral/superior) e a implementação das melhorias de código e arquitetura.

## User Review Required

> [!IMPORTANT]
> A reformulação da navegação introduzirá um componente de **Layout Unificado (`MainLayout`)** que envolverá as páginas principais (`Dashboard`, `Clients`, `Motors`, `Faturamento`). As páginas continuarão com suas funcionalidades atuais intactas, mas ganharão um menu lateral (Sidebar) expansível/retrátil, header moderno com breadcrumbs e perfil do usuário logado.

> [!TIP]
> Também será implementado um sistema de **Toast Notifications** para substituir alertas nativos do navegador (`alert()`), trazendo feedback visual moderno.

## Open Questions

Nenhuma no momento. As melhorias seguem a stack existente (React + TypeScript + Tailwind CSS + Lucide Icons + Supabase).

## Proposed Changes

---

### Componente de Layout & Navegação

#### [NEW] [MainLayout.tsx](file:///c:/Users/wilson.amorim/Documents/Projeto-web/src/components/layout/MainLayout.tsx)
- Sidebar lateral retrátil e responsiva com visual moderno (efeito glassmorphism em tons Slate/Dark, marca Real Serviços, links de navegação com indicação visual de página ativa e perfil do usuário).
- Header superior unificado com breadcrumbs, saudações dinâmicas, badge de perfil e botão de Logout de fácil acesso.
- Suporte completo a telas pequenas (Menu Hambúrguer responsivo para smartphones/tablets de bancada).

#### [NEW] [ToastContext.tsx](file:///c:/Users/wilson.amorim/Documents/Projeto-web/src/contexts/ToastContext.tsx)
- Sistema global de notificações animadas (Sucesso, Erro, Informação) com timer de fechamento automático e suporte a ações.

---

### Refatoração de Modais do Dashboard

#### [NEW] [EditOSModal.tsx](file:///c:/Users/wilson.amorim/Documents/Projeto-web/src/components/os/EditOSModal.tsx)
- Modal isolado para edição rápida de status, causa de queima e observações de OS.

#### [NEW] [RebobinamentosModal.tsx](file:///c:/Users/wilson.amorim/Documents/Projeto-web/src/components/admin/RebobinamentosModal.tsx)
- Modal isolado para gerenciamento da tabela técnica de preços/especificações de rebobinamentos.

#### [NEW] [UserManagementModal.tsx](file:///c:/Users/wilson.amorim/Documents/Projeto-web/src/components/admin/UserManagementModal.tsx)
- Modal isolado para gestão de usuários da plataforma e atribuição de perfis de acesso.

---

### Páginas Principais (Integração do Novo Layout e Refatoração)

#### [MODIFY] [App.tsx](file:///c:/Users/wilson.amorim/Documents/Projeto-web/src/App.tsx)
- Envolver rotas protegidas no `ToastProvider`.

#### [MODIFY] [Dashboard.tsx](file:///c:/Users/wilson.amorim/Documents/Projeto-web/src/pages/Dashboard.tsx)
- Envolver com `MainLayout`.
- Substituir modais inline pelos novos componentes modularizados, reduzindo o arquivo e melhorando a performance.

#### [MODIFY] [Clients.tsx](file:///c:/Users/wilson.amorim/Documents/Projeto-web/src/pages/Clients.tsx)
- Envolver com `MainLayout` e padronizar botão de criação e filtros.

#### [MODIFY] [Motors.tsx](file:///c:/Users/wilson.amorim/Documents/Projeto-web/src/pages/Motors.tsx)
- Envolver com `MainLayout` e padronizar visual de listagem.

#### [MODIFY] [Faturamento.tsx](file:///c:/Users/wilson.amorim/Documents/Projeto-web/src/pages/Faturamento.tsx)
- Envolver com `MainLayout` mantendo os gráficos do Recharts e filtro por datas.

---

## Verification Plan

### Automated Tests
- Executar `npm run build` para garantir que não há erros de tipagem TypeScript ou de compilação do Vite.

### Manual Verification
- Navegar entre todas as rotas (Dashboard, Clientes, Motores, Faturamento) verificando o destaque do menu e o comportamento da Sidebar.
- Testar o menu responsivo em telas menores (Mobile / Tablet).
- Testar modais de edição de OS, cadastro de usuários e rebobinamentos.
- Verificar o envio de notificações Toast ao salvar ou realizar ações no sistema.
