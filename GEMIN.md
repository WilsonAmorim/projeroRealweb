Atue como um Engenheiro de Software Full-Stack especialista em UX/UI. Preciso que você desenvolva o frontend de um formulário/card de cadastro técnico para um sistema de oficina eletromecânica. 

Este card será o "Laudo Mecânico" de uma Ordem de Serviço (OS) e deve coletar os dados de medição de tampas e eixos de motores elétricos.

### Diretrizes de UI/UX:
1. Organização: Use um layout limpo (ex: usando abas/tabs ou seções expansíveis) para separar "Tampas", "Eixo", "Acoplamento/Ventoinha" e "Observações".
2. Responsividade: Os campos de medição devem ficar dispostos em colunas alinhadas (Especificado, Encontrado, Deixado) para facilitar a comparação visual pelo mecânico, simulando a tabela do relatório físico.
3. Imagens de Apoio: 
   - Na seção de "Tampas", inclua a imagem localizada em: `\assets\tampa.png`
   - Na seção de "Eixo", inclua a imagem localizada em: `\assets\eixo.png`
   As imagens devem ficar posicionadas ao lado ou abaixo dos campos de input correspondentes para servirem de guia visual para o técnico.

### Campos do Formulário (Todos os numéricos devem aceitar 3 casas decimais, ex: 0.000):

1. SEÇÃO: TAMPAS (Alojamento do Rolamento)
   - LA (Lado Acoplamento): Campos para 'Especificado', 'Encontrado' e 'Deixado'.
   - LOA (Lado Oposto ao Acoplamento): Campos para 'Especificado', 'Encontrado' e 'Deixado'.
   - Exibir imagem: `\assets\tampa.png`

2. SEÇÃO: EIXO (Pista do Rolamento)
   - LA (Lado Acoplamento): Campos para 'Especificado', 'Encontrado' e 'Deixado'.
   - LOA (Lado Oposto ao Acoplamento): Campos para 'Especificado', 'Encontrado' e 'Deixado'.
   - Exibir imagem: `\assets\eixo.png`

3. SEÇÃO: ACOPLAMENTO & VENTOINHA
   - Acoplamento: Campos para 'Encontrado', 'Deixado' e 'Diâmetro Interno'.
   - Ventoinha: Campos para 'Encontrado', 'Deixado' e 'Diâmetro Interno'.
   - Distância Acoplamento/Polia à ponta do eixo: Campo numérico simples.

4. SEÇÃO: TEXTO
   - Observações Mecânicas: Campo de texto longo (textarea).

5. Ata bela no Supabase:(Yabela já criada no supabase)
  create table public.os_laudo_mecanico (
  id_laudo_mecanico serial not null,
  id_os integer not null,
  tampa_la_especificado numeric(8, 3) null,
  tampa_la_encontrado numeric(8, 3) null,
  tampa_la_deixado numeric(8, 3) null,
  tampa_loa_especificado numeric(8, 3) null,
  tampa_loa_encontrado numeric(8, 3) null,
  tampa_loa_deixado numeric(8, 3) null,
  eixo_la_especificado numeric(8, 3) null,
  eixo_la_encontrado numeric(8, 3) null,
  eixo_la_deixado numeric(8, 3) null,
  eixo_loa_especificado numeric(8, 3) null,
  eixo_loa_encontrado numeric(8, 3) null,
  eixo_loa_deixado numeric(8, 3) null,
  acoplamento_encontrado numeric(8, 3) null,
  acoplamento_deixado numeric(8, 3) null,
  acoplamento_diam_interno numeric(8, 3) null,
  ventoinha_encontrado numeric(8, 3) null,
  ventoinha_deixado numeric(8, 3) null,
  ventoinha_diam_interno numeric(8, 3) null,
  dist_acop_polia_ponta_eixo numeric(8, 3) null,
  observacoes text null,
  id_usuario uuid not null default '987b663b-b1e5-44c5-a873-6ee4e52eec0f'::uuid,
  constraint os_laudo_mecanico_pkey primary key (id_laudo_mecanico),
  constraint fk_laudo_mecanico_os foreign KEY (id_os) references ordens_servico (id_os) on delete CASCADE
) TABLESPACE pg_default;

### Requisitos Técnicos:
- Crie o componente utilizando: ReactJS + Tailwind. 
- o BackEnd é Supabase
- Os nomes dos campos devem ser amigáveis para salvar no banco de dados posteriormente (siga a nomenclatura padrão do mercado ou sugira o mapeamento de state).
- Adicione um botão de "Salvar Laudo Mecânico" no rodapé do card.

Gere o código completo, estruturado e componentizado.