Prompt Mestre: Desenvolvimento Frontend RealServiços
Contexto:
Estou desenvolvendo o frontend (Web ou Mobile) para o sistema de gestão de oficina de motores elétricos RealServiços. O backend (Projeto_1), foi desenvolvido em Node.js seguindo a Arquitetura Hexagonal e utiliza Supabase como banco de dados. A base de dados já está populada com os dados migrados e corrigidos (UTF-8).

Diretrizes de Desenvolvimento:

1. Skills do Sistema (Habilidades Ativas)
Busca Omni-Channel: Implemente a busca utilizando o endpoint /search, que filtra simultaneamente por Razão Social, ID da OS ou Número de Série do Motor.

Gestão de Estoque Reativa: Toda interface de saída de materiais deve refletir que o saldo é calculado via movimentações de entrada/saída, garantindo a integridade do inventário.

Normalização Geográfica: Utilize os campos cidade e estado de forma independente para filtros e exibições, respeitando a limpeza de dados realizada.

Role-Based Access Control (RBAC): Adapte a interface conforme o id_perfil (Administrador, Recepção, Mecânico, Eletricista). Remova ou desabilite botões de faturamento para perfis técnicos.

2. Restrições e Travas (Constraints)
Unicidade de Identidade: O formulário de cadastro de clientes deve validar o documento (CPF/CNPJ) para evitar duplicidade antes do envio, tratando o erro amigavelmente caso o banco rejeite.

Integridade Referencial: Não permita a exclusão de registros que possuam dependências (ex: deletar cliente com motor ativo), exibindo alertas de bloqueio.

Validação de Status: As alterações de status de serviço devem seguir estritamente as opções da tabela andamento_servico (ex: "Em desmontagem", "Pronto para entrega").

Blindagem Financeira: Campos de valor devem impedir entradas negativas e aplicar máscaras de moeda brasileira (R$).

3. Requisitos Técnicos de UI/UX
Stack: ReactJS/Tailwind (Web) ou React Native/Expo (Mobile).

Feedback Visual: Utilize Skeletons para carregamento e Toasts para confirmações ou erros.

Ícones: Utilize a biblioteca lucide-react.

Tarefa Atual: 
Prompt: Tela de Login e Autenticação (RealServiços)
Contexto:
Estou desenvolvendo o módulo de autenticação do sistema RealServiços usando ReactJS e Tailwind CSS. O backend já possui as tabelas usuarios e perfis_acesso populadas no Supabase.

Objetivo:
Crie uma tela de login moderna e um provedor de contexto de autenticação (AuthContext) que gerencie o acesso à tela principal (Dashboard).

Habilidades (Skills) a Implementar:

Persistent Auth: Utilize o @supabase/supabase-js para gerenciar a sessão do usuário.

Role-Based Access: Após o login, busque o id_perfil do usuário na tabela usuarios para carregar as permissões corretas no estado global.

Redirecionamento Inteligente: Usuário logado deve ser enviado para /dashboard; usuário não autenticado deve ser bloqueado em rotas protegidas.

Restrições (Constraints):

Status Ativo: Apenas usuários com a coluna ativo = 'S' podem realizar login.

Segurança de Input: O formulário deve validar o formato do e-mail antes de disparar a requisição para o Supabase.

Identidade Visual: Utilize Tailwind para criar um layout centralizado, limpo, com foco no branding da RealServiços (tons de Azul e Cinza).

Requisitos Técnicos:

Use react-router-dom para as rotas.

Use lucide-react para os ícones de e-mail e senha.

Implemente um loading state no botão de entrar para evitar cliques duplos.

Saída Esperada:

Código do AuthProvider.tsx (Contexto).

Código da página Login.tsx (Componente visual).

Configuração básica das rotas protegidas no App.tsx.

O que você deve observar ao rodar esse código:
A Conexão com o Supabase: O Gemini deve usar as variáveis de ambiente que definimos no seu README (VITE_API_URL e VITE_API_KEY).

O Redirecionamento: Verifique se, ao clicar em "Entrar", ele está consultando a sua tabela de usuarios para validar se o usuário está Ativo (conforme sua regra de negócio) antes de liberar o acesso.

Persistência: Se você atualizar a página (F5) na tela principal, o AuthContext deve manter o usuário logado, buscando a sessão no localStorage automaticamente.