Um mundança no frontend: Não vai existir uma tela de Resumo de Manutenção para as duas vamos separar 
Na aba (Serviços) vai ter um Resumo dos serviços
e os dados serao gravados na tabela os_servico e mostrados no Resumo de serviços 
- os_servicos 
  id_osservicos serial not null,
  id_os integer not null,
  preco numeric(10, 2) null,
  id_servico integer not null,
E na aba de peças vai ter um Resumo das peças
e os dados serao gravados na tabela os_pecas e mostrados no Resumo de peças 
- os_pecas 
  id_ospecas serial not null,
  id_os integer not null,
  preco numeric(10, 2) null,
  id_pecas integer not null,
  
qualquer duvida é só perguntar 