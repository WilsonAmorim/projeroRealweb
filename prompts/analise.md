Esta aplicação é um Sistema de Gestão Integrado para Oficinas Eletromecânicas e Manutenção de Motores Elétricos.

O sistema automatiza todo o fluxo operacional de uma oficina especializada — desde a entrada do cliente e do equipamento (motor) até a abertura de Ordens de Serviço (OS), realização de laudos técnicos detalhados (mecânico e elétrico), geração de orçamentos, emissão de laudos em PDF e acompanhamento financeiro/faturamento.

1. Stack Tecnológica
Camada	Tecnologia / Biblioteca
Frontend Base	React 19 + TypeScript + Vite (Build super rápido com plugin @vitejs/plugin-react-swc)
Estilização	Tailwind CSS v4 + Icons via 
lucide-react
Roteamento	
react-router-dom
 (configurado com HashRouter)
Backend & Banco de Dados	Supabase (@supabase/supabase-js) para PostgreSQL, autenticação e storage
Gráficos & Dashboards	
recharts
 para métricas e indicadores de faturamento
Testes	Playwright (playwright) para automação e testes end-to-end
2. Estrutura do Projeto
O código-fonte em 
src/
 está organizado em camadas bem definidas:



src/
├── assets/         # Imagens técnicas de apoio (ex: tampa.png, eixo.png para laudos)
├── components/     # Componentes reutilizáveis de UI, ordenados por domínio (os, clients, motors, common)
├── config/         # Configurações globais
├── contexts/       # Gerenciamento de estado global (ex: AuthContext.tsx para login e controle de acesso)
├── hooks/          # Custom Hooks React
├── lib/            # Clientes de integração (ex: supabase.ts)
├── pages/          # Páginas e fluxos principais do sistema
├── services/       # Camada de comunicação com serviços externos / API
└── types/          # Interfaces e tipos TypeScript (client.ts, motor.tsx, etc.)
3. Principais Módulos & Funcionalidades
Autenticação e Controle de Acesso
Login.tsx
: Autenticação via Supabase Auth.
AuthContext.tsx
 & 
ProtectedRoute.tsx
: Proteção de rotas com controle por perfil/função (requiredRole), restringindo páginas sensíveis como o Faturamento apenas a administradores.
Gestão de Clientes e Equipamentos (Motores)
Clients.tsx
: Cadastro completo de clientes (CNPJ/CPF, razão social, contatos, histórico).
Motors.tsx
: Ficha técnica do motor elétrico (fabricante, potência em cv/kW, rotação RPM, tensão V, corrente A, carcaça, número de série).
Gestão de Ordens de Serviço (OS)
Abertura & Edição: 
CreateOSForm.tsx
 e 
UpdateOSForm.tsx
 para registrar defeitos relatos, inspeções visuais e peças recebidas.
Acompanhamento (Tracking): 
OSServiceTracking.tsx
 para monitorar o status do serviço em tempo real (em análise, aguardando orçamento, em execução, concluído).
Orçamentação: 
OSOrcamento.tsx
 para detalhamento de serviços prestados, peças substituídas e valores finais.
🛠️ Laudos Técnicos Especializados
Laudo Mecânico (
LaudoMecanico.tsx
):
Registro de medições de alta precisão (3 casas decimais: Especificado, Encontrado, Deixado).
Coleta medidas para alojamentos das tampas (LA - Lado Acoplamento / LOA - Lado Oposto ao Acoplamento), pistas de rolamento do eixo, acoplamento e ventoinha.
Guia visual integrado com imagens auxiliares da carcaça/eixo.
Laudo Elétrico (
LaudoEletricoForm.tsx
):
Registros de testes de resistência de isolamento (Megômetro), bobinagem, conexões e testes de carga.
PDFs Técnicos (
OSLaudoMecanicoPDF.tsx
, 
OSLaudoEletricoPDF.tsx
):
Páginas formatadas para impressão ou exportação de relatórios técnicos profissionais para entrega ao cliente final.
Dashboard & Módulo Financeiro
Dashboard.tsx
: Painel executivo com resumos de ordens abertas, atalhos rápidos e status da oficina.
Faturamento.tsx
: Gráficos de desempenho financeiro por período, faturamento acumulado e controle de serviços finalizados.
4. Pontos Fortes da Aplicação
Conhecimento de Domínio: O formulário de Laudo Mecânico e Elétrico reflete fielmente as normas e necessidades do mercado de rebobinagem e manutenção industrial de motores.
Arquitetura Limpa: O código é modularizado e reutiliza componentes e hooks de maneira organizada.
Backend Serverless Robusto: O uso do Supabase reduz a necessidade de infraestrutura pesada, garantindo autenticação pronta, banco de dados PostgreSQL com RLS e queries performáticas.
UX Responsiva: Telas pensadas tanto para o técnico na bancada de trabalho quanto para o gestor na administração.