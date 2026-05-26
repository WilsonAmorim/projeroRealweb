Por favor, acione um agente e forneça as seguintes instruções técnicas e de design para desenvolver o componente de 'Laudo Elétrico' do sistema de OS de oficina.

As imagens anexadas (image_1.png e image_2.png) são cópias do relatório físico de saída que este componente de software deve ser capaz de produzir. Este componente deve ter dois modos: um modo de 'Cadastro' e um modo de 'Visualização'.

### Requisitos Técnicos e Framework
- Linguagem/Framework de UI: ReactJS + Tailwind. 
- Biblioteca de Gráficos Sugerida: que seja compatível com seu framework.
- BackEnd é Supabase.

---

### 1. Requisitos de UI/UX (Modo Cadastro)

Desenvolva um formulário de cadastro técnico com o layout organizado em seções e colunas, similar à lógica tabular das imagens anexadas. O objetivo é cadastrar as medições que mudam para cada OS.

### Campos do Formulário (Todos numéricos com 2 ou 4 casas decimais conforme o exemplo físico):

1. **SEÇÃO: DADOS DE TENSÃO E CORRENTE**
   - Tensão Nominal (V): Campo numérico (Ex: 380).
   - Corrente Nominal (A): Campo numérico (Ex: 30.50).

2. **SEÇÃO: MEDIÇÕES DE CORRENTE DE SAÍDA (A)**
   - Criar 3 campos de entrada de dados (colunas) para as fases R, S, e T:
     - 'Corrente_R', 'Corrente_S', 'Corrente_T'.
     - O layout deve ser horizontal para simular a tabela física.

3. **SEÇÃO: MEDIÇÕES DE RESISTÊNCIA ÔHMICA (Ohm)**
   - Criar 6 campos de entrada de dados organizados em uma grade 2x3 (como na tabela 'RESISTÊNCIA' física):
     - Linha de 'Entrada': Campos 'Resistencia_Entrada_R', 'Resistencia_Entrada_S', 'Resistencia_Entrada_T'.
     - Linha de 'Saída': Campos 'Resistencia_Saida_R', 'Resistencia_Saida_S', 'Resistencia_Saida_T'.

4. **SEÇÃO: MEDIÇÕES DE ISOLAÇÃO (MOhm)**
   - Criar 6 campos de entrada de dados organizados em uma grade 2x3 (como na tabela 'ISOLAÇÃO' física):
     - Linha de 'Entrada': Campos 'Isolacao_Entrada_R', 'Isolacao_Entrada_S', 'Isolacao_Entrada_T'.
     - Linha de 'Saída': Campos 'Isolacao_Saida_R', 'Isolacao_Saida_S', 'Isolacao_Saida_T'.

5. **SEÇÃO: TEXTO**
   - Observações Elétricas: Um campo de texto longo (textarea).

6. Ata bela no Supabase:(Tabela já criada no supabase)

create table public.os_laudo_eletrico (
  id_laudo_eletrico serial not null,
  id_os integer not null,
  corrente_saida_r numeric(6, 2) null,
  corrente_saida_s numeric(6, 2) null,
  corrente_saida_t numeric(6, 2) null,
  resistencia_entrada_r numeric(8, 4) null,
  resistencia_entrada_s numeric(8, 4) null,
  resistencia_entrada_t numeric(8, 4) null,
  resistencia_saida_r numeric(8, 4) null,
  resistencia_saida_s numeric(8, 4) null,
  resistencia_saida_t numeric(8, 4) null,
  isolacao_entrada_r numeric(10, 2) null,
  isolacao_entrada_s numeric(10, 2) null,
  isolacao_entrada_t numeric(10, 2) null,
  isolacao_saida_r numeric(10, 2) null,
  isolacao_saida_s numeric(10, 2) null,
  isolacao_saida_t numeric(10, 2) null,
  observacoes text null,
  id_usuario uuid not null default '987b663b-b1e5-44c5-a873-6ee4e52eec0f'::uuid,
  constraint os_laudo_eletrico_pkey primary key (id_laudo_eletrico),
  constraint fk_laudo_eletrico_os foreign KEY (id_os) references ordens_servico (id_os) on delete CASCADE
) TABLESPACE pg_default;
---

### 2. Requisitos de Visualização de Dados (Modo Dashboard da OS)

Em uma seção separada ou aba, desenvolva três painéis gráficos que devem ser populados com os dados dos campos acima. Use as imagens anexadas como a referência exata para o tipo de gráfico e a aparência.

1. **PAINEL GRÁFICO: CORRENTE DE SAÍDA (A)**
   - Tipo de Gráfico: Gráfico de Barras Agrupadas.
   - Eixos: Eixo X com as categorias 'Nominal', 'R', 'S', 'T'. Eixo Y com os valores de Amperagem.
   - Legenda: Use uma cor (Ex: Vermelho, como na imagem) para os valores medidos. O valor de 'Nominal' deve ser uma barra fixa ou uma linha de referência.

2. **PAINEL GRÁFICO: RESISTÊNCIA (Ohm)**
   - Tipo de Gráfico: Gráfico de Barras Agrupadas.
   - Eixos: Eixo X com as categorias de fases 'R', 'S', 'T'. Eixo Y com os valores de Ohm.
   - Legenda: Use cores distintas para as categorias 'Entrada' e 'Saída' (como na imagem: cores para entrada/saída) para permitir comparação visual imediata.

3. **PAINEL GRÁFICO: ISOLAÇÃO (MOhm)**
   - Tipo de Gráfico: Gráfico de Barras Agrupadas (Similar ao gráfico de resistência, mas com eixos ajustados para a escala de mega-ohms).
   - Eixos: Eixo X com 'R', 'S', 'T'. Eixo Y com MOhm.
   - Legenda: Use as mesmas cores distintas para 'Entrada' e 'Saída'.

Gere o código completo, componentizado e estruturado para o framework de UI e a biblioteca de gráficos escolhida.