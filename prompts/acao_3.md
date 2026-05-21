Prompt: Desenvolvimento do Módulo de Clientes (Frontend RealServiços)
1. Objetivo
Ajustar a interface de Gestão de Clientes em ReactJS.

2. Lógica de Integração (Frontend -> Backend)
Não permitir excluir um cliente se ele tiver motor cadastrado.
 A tabela de motor já criada no supabase tem relação com a tabela de cliente através do campo id_cliente.
  Exemplo: um cliente tem 1 motor cadastrado, então não pode ser excluído.
  
  create table public.motores (
  id_motor serial not null,
  id_cliente integer null,
  num_serie character varying(50) null,
  classificacao character varying(100) null,
  potencia_cv_kw character varying(50) null,
  rpm character varying null,
  tensao_v character varying(50) null,
  codigo_fconst character varying(10) null,
  rolamento_la character varying(50) null,
  rolamento_loa character varying(50) null,
  especificacao character varying null,
  unidade_cv_kw character varying null,
  numero_polos character varying null,
  fabricante character varying null,
  modelo character varying null,
  tag_cliente character varying null,
  tens_arm character varying null,
  corr_arm character varying null,
  tens_exc character varying null,
  corr_exc character varying null,
  hz character varying null,
  corrente_nominal character varying null,
  tensao_nominal character varying null,
  isolamento character varying null,
  ip character varying null,
  fs character varying null,
  opmed character varying null,
  constraint motores_pkey primary key (id_motor),
  constraint motores_codigo_fconst_fkey foreign KEY (codigo_fconst) references formas_construtivas (codigo_fconst),
  constraint motores_id_cliente_fkey foreign KEY (id_cliente) references cliente (id_cliente)
) TABLESPACE pg_default;

3. Não mude a estrutura do projeto e o layout. Utilize o axios do projeto para fazer as requisições ao backend.

