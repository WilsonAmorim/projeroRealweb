import { supabase } from '../lib/supabase';

export type LaudoEletricoRow = {
  id_laudo_eletrico?: number;
  id_os: number;
  corrente_saida_r?: number | null;
  corrente_saida_s?: number | null;
  corrente_saida_t?: number | null;
  resistencia_entrada_r?: number | null;
  resistencia_entrada_s?: number | null;
  resistencia_entrada_t?: number | null;
  resistencia_saida_r?: number | null;
  resistencia_saida_s?: number | null;
  resistencia_saida_t?: number | null;
  isolacao_entrada_r?: number | null;
  isolacao_entrada_s?: number | null;
  isolacao_entrada_t?: number | null;
  isolacao_saida_r?: number | null;
  isolacao_saida_s?: number | null;
  isolacao_saida_t?: number | null;
  observacoes?: string | null;
  id_usuario?: string | null;
};

export async function getLaudoByOS(id_os: number) {
  const { data, error } = await supabase
    .from('os_laudo_eletrico')
    .select('*')
    .eq('id_os', id_os)
    .limit(1)
    .single();

  if (error && (error as any).code !== 'PGRST116') throw error;
  return data as LaudoEletricoRow | null;
}

export async function upsertLaudo(row: LaudoEletricoRow) {
  if (row.id_laudo_eletrico) {
    const { data, error } = await supabase
      .from('os_laudo_eletrico')
      .update(row)
      .eq('id_laudo_eletrico', row.id_laudo_eletrico)
      .select()
      .single();

    if (error) throw error;
    return data as LaudoEletricoRow;
  } else {
    const { data, error } = await supabase
      .from('os_laudo_eletrico')
      .insert(row)
      .select()
      .single();

    if (error) throw error;
    return data as LaudoEletricoRow;
  }
}
