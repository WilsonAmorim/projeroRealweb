export interface Cliente {
  id_cliente?: number;
  documento: string;
  nome_razao_social: string;
  nome_fantasia?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  endereco?: string;
  bairro?: string;
  cep?: string;
  complemento?: string;
  cidade?: string;
  estado?: string;
  celular?: string;
  telefone?: string;
  email?: string;
  observacao?: string;
  data_criacao?: string;
  data_atualizacao?: string;
}

export interface ClienteResponse {
  status: string;
  data: Cliente | Cliente[];
}
