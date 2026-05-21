// src/types/motor.ts

export interface Cliente {
    id_cliente?: number;
    documento: string; // UNIQUE, validated CPF/CNPJ
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
    data_criacao?: string | Date;
    data_atualizacao?: string | Date;
}

export interface Motor {
    id_motor?: number;
    id_cliente?: number;
    num_serie: string;
    classificacao?: string;
    potencia_cv_kw: string;
    rpm?: string;
    tensao_v?: string;
    codigo_fconst?: number;
    rolamento_la?: string;
    rolamento_loa?: string;
    especificacao?: string;
    unidade_cv_kw?: string;
    numero_polos?: string;
    fabricante?: string;
    modelo?: string;
    tag_cliente?: string;
    tens_arm?: string;
    corr_arm?: string;
    tens_exc?: string;
    corr_exc?: string;
    hz?: string;
    corrente_nominal?: string;
    tensao_nominal?: string;
    isolamento?: string;
    ip?: string;
    fs?: string;
    opmed?: string;

    // Relações que vêm do banco (Supabase Joins)
    cliente?: Cliente;
}

export interface OrdemServico {
    id_os?: number;
    id_motor: number;
    data_entrada: string | Date;
    observacoes_gerais?: string;
    id_causa_queima?: number;
    id_andamento: number;
    data_criacao?: string | Date;
    data_saida?: string | Date;
}