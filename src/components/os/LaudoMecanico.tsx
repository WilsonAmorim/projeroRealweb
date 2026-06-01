import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Save, Loader2, ClipboardList, Layers, Settings, 
  FileText, CheckCircle, AlertCircle, Printer 
} from 'lucide-react';

import tampaImg from '../../assets/tampa.png';
import eixoImg from '../../assets/eixo.png';

interface LaudoMecanicoProps {
  id_os: number;
}

interface LaudoFormData {
  tampa_la_especificado: string;
  tampa_la_encontrado: string;
  tampa_la_deixado: string;
  tampa_loa_especificado: string;
  tampa_loa_encontrado: string;
  tampa_loa_deixado: string;
  eixo_la_especificado: string;
  eixo_la_encontrado: string;
  eixo_la_deixado: string;
  eixo_loa_especificado: string;
  eixo_loa_encontrado: string;
  eixo_loa_deixado: string;
  acoplamento_encontrado: string;
  acoplamento_deixado: string;
  acoplamento_diam_interno: string;
  ventoinha_encontrado: string;
  ventoinha_deixado: string;
  ventoinha_diam_interno: string;
  dist_acop_polia_ponta_eixo: string;
  observacoes: string;
}

const initialFormData: LaudoFormData = {
  tampa_la_especificado: '',
  tampa_la_encontrado: '',
  tampa_la_deixado: '',
  tampa_loa_especificado: '',
  tampa_loa_encontrado: '',
  tampa_loa_deixado: '',
  eixo_la_especificado: '',
  eixo_la_encontrado: '',
  eixo_la_deixado: '',
  eixo_loa_especificado: '',
  eixo_loa_encontrado: '',
  eixo_loa_deixado: '',
  acoplamento_encontrado: '',
  acoplamento_deixado: '',
  acoplamento_diam_interno: '',
  ventoinha_encontrado: '',
  ventoinha_deixado: '',
  ventoinha_diam_interno: '',
  dist_acop_polia_ponta_eixo: '',
  observacoes: '',
};

const LaudoMecanico: React.FC<LaudoMecanicoProps> = ({ id_os }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState<'tampas' | 'eixo' | 'acoplamento' | 'observacoes'>('tampas');
  const [formData, setFormData] = useState<LaudoFormData>(initialFormData);
  const [laudoId, setLaudoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Carregar dados existentes
  useEffect(() => {
    const fetchLaudo = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('os_laudo_mecanico')
          .select('*')
          .eq('id_os', id_os)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setLaudoId(data.id_laudo_mecanico);
          
          // Helper para converter números do DB em strings (mantendo 3 decimais se presente)
          const formatValue = (val: any) => {
            if (val === null || val === undefined) return '';
            const num = parseFloat(val);
            return isNaN(num) ? '' : num.toFixed(3);
          };

          setFormData({
            tampa_la_especificado: formatValue(data.tampa_la_especificado),
            tampa_la_encontrado: formatValue(data.tampa_la_encontrado),
            tampa_la_deixado: formatValue(data.tampa_la_deixado),
            tampa_loa_especificado: formatValue(data.tampa_loa_especificado),
            tampa_loa_encontrado: formatValue(data.tampa_loa_encontrado),
            tampa_loa_deixado: formatValue(data.tampa_loa_deixado),
            eixo_la_especificado: formatValue(data.eixo_la_especificado),
            eixo_la_encontrado: formatValue(data.eixo_la_encontrado),
            eixo_la_deixado: formatValue(data.eixo_la_deixado),
            eixo_loa_especificado: formatValue(data.eixo_loa_especificado),
            eixo_loa_encontrado: formatValue(data.eixo_loa_encontrado),
            eixo_loa_deixado: formatValue(data.eixo_loa_deixado),
            acoplamento_encontrado: formatValue(data.acoplamento_encontrado),
            acoplamento_deixado: formatValue(data.acoplamento_deixado),
            acoplamento_diam_interno: formatValue(data.acoplamento_diam_interno),
            ventoinha_encontrado: formatValue(data.ventoinha_encontrado),
            ventoinha_deixado: formatValue(data.ventoinha_deixado),
            ventoinha_diam_interno: formatValue(data.ventoinha_diam_interno),
            dist_acop_polia_ponta_eixo: formatValue(data.dist_acop_polia_ponta_eixo),
            observacoes: data.observacoes || '',
          });
        } else {
          setFormData(initialFormData);
          setLaudoId(null);
        }
      } catch (err: any) {
        console.error('Erro ao carregar laudo mecânico:', err.message);
        setStatusMessage({ type: 'error', text: 'Não foi possível carregar os dados anteriores do laudo.' });
      } finally {
        setLoading(false);
      }
    };

    if (id_os) fetchLaudo();
  }, [id_os]);

  // Formatar valores ao sair do campo (blur) para 3 casas decimais
  const handleBlur = (field: keyof LaudoFormData) => {
    const value = formData[field];
    if (value.trim() === '' || field === 'observacoes') return;
    const num = parseFloat(value.replace(',', '.'));
    if (!isNaN(num)) {
      setFormData(prev => ({
        ...prev,
        [field]: num.toFixed(3),
      }));
    }
  };

  const handleInputChange = (field: keyof LaudoFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Salvar laudo no banco
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    // Mapear strings de volta para floats de forma robusta
    const parseNumber = (val: any) => {
      if (val === null || val === undefined) return null;
      const strVal = String(val).trim();
      if (strVal === '') return null;
      const num = parseFloat(strVal.replace(',', '.'));
      return isNaN(num) ? null : num;
    };

    try {
      // Buscar o ID do usuário atualmente autenticado diretamente do Supabase Auth para satisfazer RLS
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id || profile?.id || '987b663b-b1e5-44c5-a873-6ee4e52eec0f';

      const payload = {
        id_os: id_os,
        tampa_la_especificado: parseNumber(formData.tampa_la_especificado),
        tampa_la_encontrado: parseNumber(formData.tampa_la_encontrado),
        tampa_la_deixado: parseNumber(formData.tampa_la_deixado),
        tampa_loa_especificado: parseNumber(formData.tampa_loa_especificado),
        tampa_loa_encontrado: parseNumber(formData.tampa_loa_encontrado),
        tampa_loa_deixado: parseNumber(formData.tampa_loa_deixado),
        eixo_la_especificado: parseNumber(formData.eixo_la_especificado),
        eixo_la_encontrado: parseNumber(formData.eixo_la_encontrado),
        eixo_la_deixado: parseNumber(formData.eixo_la_deixado),
        eixo_loa_especificado: parseNumber(formData.eixo_loa_especificado),
        eixo_loa_encontrado: parseNumber(formData.eixo_loa_encontrado),
        eixo_loa_deixado: parseNumber(formData.eixo_loa_deixado),
        acoplamento_encontrado: parseNumber(formData.acoplamento_encontrado),
        acoplamento_deixado: parseNumber(formData.acoplamento_deixado),
        acoplamento_diam_interno: parseNumber(formData.acoplamento_diam_interno),
        ventoinha_encontrado: parseNumber(formData.ventoinha_encontrado),
        ventoinha_deixado: parseNumber(formData.ventoinha_deixado),
        ventoinha_diam_interno: parseNumber(formData.ventoinha_diam_interno),
        dist_acop_polia_ponta_eixo: parseNumber(formData.dist_acop_polia_ponta_eixo),
        observacoes: formData.observacoes ? formData.observacoes.trim() || null : null,
        id_usuario: currentUserId,
      };
      if (laudoId) {
        // Atualizar laudo existente
        const { error } = await supabase
          .from('os_laudo_mecanico')
          .update(payload)
          .eq('id_laudo_mecanico', laudoId);

        if (error) throw error;
        setStatusMessage({ type: 'success', text: 'Laudo Mecânico atualizado com sucesso!' });
      } else {
        // Criar novo laudo
        const { data, error } = await supabase
          .from('os_laudo_mecanico')
          .insert([payload])
          .select('id_laudo_mecanico')
          .single();

        if (error) throw error;
        if (data) setLaudoId(data.id_laudo_mecanico);
        setStatusMessage({ type: 'success', text: 'Laudo Mecânico cadastrado com sucesso!' });
      }
    } catch (err: any) {
      console.error('Erro detalhado ao gravar laudo no Supabase:', err);
      const errMsg = err?.message || err?.details || err?.hint || JSON.stringify(err);
      setStatusMessage({ 
        type: 'error', 
        text: `Erro ao gravar os dados no banco de dados: ${errMsg}. Tente novamente.` 
      });
    } finally {
      setSaving(false);
      // Rolar suavemente para o topo do formulário para ver o status
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 bg-white rounded-2xl border border-gray-100 min-h-[400px]">
        <Loader2 className="h-10 w-10 text-brand-blue animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-500">Buscando Laudo Mecânico da OS...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Sub-Abas de Navegação Interna */}
      <div className="flex flex-wrap border-b border-gray-200 bg-gray-50/70 p-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('tampas')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'tampas'
              ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/15'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>TAMPAS (Alojamento)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('eixo')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'eixo'
              ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/15'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>EIXO (Pista Rolamento)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('acoplamento')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'acoplamento'
              ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/15'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>ACOPLAMENTO & VENTOINHA</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('observacoes')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'observacoes'
              ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/15'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>OBSERVAÇÕES</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
        
        {/* Status Alerts */}
        {statusMessage && (
          <div className={`p-4 rounded-xl border flex items-start space-x-3 animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-red-50 border-red-100 text-red-800'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-sm">{statusMessage.text}</p>
            </div>
          </div>
        )}

        {/* 1. SEÇÃO: TAMPAS */}
        {activeSubTab === 'tampas' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-800 flex items-center mb-1">
                  <span className="w-1.5 h-4 bg-brand-blue rounded-full mr-2"></span>
                  Tampa - Alojamento do Rolamento
                </h3>
                <p className="text-xs text-gray-400">Preencha as medições com até 3 casas decimais (ex: 0.000).</p>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      <th className="px-4 py-3 text-left w-1/4">Posição</th>
                      <th className="px-4 py-3 text-center">Especificado</th>
                      <th className="px-4 py-3 text-center">Encontrado</th>
                      <th className="px-4 py-3 text-center">Deixado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-4 py-4 text-xs font-bold text-gray-700">LA (Lado Acoplamento)</td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          value={formData.tampa_la_especificado}
                          onChange={(e) => handleInputChange('tampa_la_especificado', e.target.value)}
                          onBlur={() => handleBlur('tampa_la_especificado')}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none text-center"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          value={formData.tampa_la_encontrado}
                          onChange={(e) => handleInputChange('tampa_la_encontrado', e.target.value)}
                          onBlur={() => handleBlur('tampa_la_encontrado')}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none text-center"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          value={formData.tampa_la_deixado}
                          onChange={(e) => handleInputChange('tampa_la_deixado', e.target.value)}
                          onBlur={() => handleBlur('tampa_la_deixado')}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none text-center"
                        />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-4 py-4 text-xs font-bold text-gray-700">LOA (Lado Oposto)</td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          value={formData.tampa_loa_especificado}
                          onChange={(e) => handleInputChange('tampa_loa_especificado', e.target.value)}
                          onBlur={() => handleBlur('tampa_loa_especificado')}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none text-center"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          value={formData.tampa_loa_encontrado}
                          onChange={(e) => handleInputChange('tampa_loa_encontrado', e.target.value)}
                          onBlur={() => handleBlur('tampa_loa_encontrado')}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none text-center"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          value={formData.tampa_loa_deixado}
                          onChange={(e) => handleInputChange('tampa_loa_deixado', e.target.value)}
                          onBlur={() => handleBlur('tampa_loa_deixado')}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none text-center"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Imagem de Apoio */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Guia de Apoio: Tampa</span>
              <div className="relative group overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white p-4">
                <img 
                  src={tampaImg} 
                  alt="Tampa do Motor" 
                  className="max-h-[220px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-4 text-center max-w-xs">Representação visual do alojamento do rolamento na tampa.</p>
            </div>
          </div>
        )}

        {/* 2. SEÇÃO: EIXO */}
        {activeSubTab === 'eixo' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-800 flex items-center mb-1">
                  <span className="w-1.5 h-4 bg-brand-blue rounded-full mr-2"></span>
                  Eixo - Pista do Rolamento
                </h3>
                <p className="text-xs text-gray-400">Preencha as medições com até 3 casas decimais (ex: 0.000).</p>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      <th className="px-4 py-3 text-left w-1/4">Posição</th>
                      <th className="px-4 py-3 text-center">Especificado</th>
                      <th className="px-4 py-3 text-center">Encontrado</th>
                      <th className="px-4 py-3 text-center">Deixado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-4 py-4 text-xs font-bold text-gray-700">LA (Lado Acoplamento)</td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          value={formData.eixo_la_especificado}
                          onChange={(e) => handleInputChange('eixo_la_especificado', e.target.value)}
                          onBlur={() => handleBlur('eixo_la_especificado')}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none text-center"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          value={formData.eixo_la_encontrado}
                          onChange={(e) => handleInputChange('eixo_la_encontrado', e.target.value)}
                          onBlur={() => handleBlur('eixo_la_encontrado')}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none text-center"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          value={formData.eixo_la_deixado}
                          onChange={(e) => handleInputChange('eixo_la_deixado', e.target.value)}
                          onBlur={() => handleBlur('eixo_la_deixado')}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none text-center"
                        />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-4 py-4 text-xs font-bold text-gray-700">LOA (Lado Oposto)</td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          value={formData.eixo_loa_especificado}
                          onChange={(e) => handleInputChange('eixo_loa_especificado', e.target.value)}
                          onBlur={() => handleBlur('eixo_loa_especificado')}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none text-center"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          value={formData.eixo_loa_encontrado}
                          onChange={(e) => handleInputChange('eixo_loa_encontrado', e.target.value)}
                          onBlur={() => handleBlur('eixo_loa_encontrado')}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none text-center"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          value={formData.eixo_loa_deixado}
                          onChange={(e) => handleInputChange('eixo_loa_deixado', e.target.value)}
                          onBlur={() => handleBlur('eixo_loa_deixado')}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none text-center"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Imagem de Apoio */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Guia de Apoio: Eixo</span>
              <div className="relative group overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white p-4">
                <img 
                  src={eixoImg} 
                  alt="Eixo do Motor" 
                  className="max-h-[220px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-4 text-center max-w-xs">Representação visual do eixo e do diâmetro das pistas de rolamento.</p>
            </div>
          </div>
        )}

        {/* 3. SEÇÃO: ACOPLAMENTO & VENTOINHA */}
        {activeSubTab === 'acoplamento' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-800 flex items-center mb-1">
                <span className="w-1.5 h-4 bg-brand-blue rounded-full mr-2"></span>
                Acoplamento, Ventoinha e Distância de Polia
              </h3>
              <p className="text-xs text-gray-400">Parâmetros adicionais de mecânica do motor.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card Acoplamento */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                <span className="inline-flex px-2.5 py-0.5 bg-blue-50 text-brand-blue text-[10px] font-bold uppercase rounded border border-blue-100">
                  Acoplamento
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Encontrado</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={formData.acoplamento_encontrado}
                      onChange={(e) => handleInputChange('acoplamento_encontrado', e.target.value)}
                      onBlur={() => handleBlur('acoplamento_encontrado')}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Deixado</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={formData.acoplamento_deixado}
                      onChange={(e) => handleInputChange('acoplamento_deixado', e.target.value)}
                      onBlur={() => handleBlur('acoplamento_deixado')}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Diâm. Interno</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={formData.acoplamento_diam_interno}
                      onChange={(e) => handleInputChange('acoplamento_diam_interno', e.target.value)}
                      onBlur={() => handleBlur('acoplamento_diam_interno')}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Card Ventoinha */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                <span className="inline-flex px-2.5 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-bold uppercase rounded border border-orange-100">
                  Ventoinha
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Encontrado</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={formData.ventoinha_encontrado}
                      onChange={(e) => handleInputChange('ventoinha_encontrado', e.target.value)}
                      onBlur={() => handleBlur('ventoinha_encontrado')}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Deixado</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={formData.ventoinha_deixado}
                      onChange={(e) => handleInputChange('ventoinha_deixado', e.target.value)}
                      onBlur={() => handleBlur('ventoinha_deixado')}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Diâm. Interno</label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={formData.ventoinha_diam_interno}
                      onChange={(e) => handleInputChange('ventoinha_diam_interno', e.target.value)}
                      onBlur={() => handleBlur('ventoinha_diam_interno')}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Distância Acoplamento/Polia à Ponta do Eixo */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 max-w-md">
              <label className="block text-xs font-bold text-gray-600 mb-2">
                Distância do Acoplamento/Polia à ponta do eixo (mm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  value={formData.dist_acop_polia_ponta_eixo}
                  onChange={(e) => handleInputChange('dist_acop_polia_ponta_eixo', e.target.value)}
                  onBlur={() => handleBlur('dist_acop_polia_ponta_eixo')}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. SEÇÃO: TEXTO (Observações) */}
        {activeSubTab === 'observacoes' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-800 flex items-center mb-1">
                <span className="w-1.5 h-4 bg-brand-blue rounded-full mr-2"></span>
                Observações Mecânicas do Laudo
              </h3>
              <p className="text-xs text-gray-400">Registre detalhes relevantes e conclusões sobre as tampas, eixo ou alinhamento do motor.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-blue/10 focus-within:border-brand-blue transition-all">
              <textarea
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Descreva observações de desgaste, folga excessiva, recuperação de alojamento, solda, bucha ou balanceamento feito..."
                rows={6}
                className="w-full p-4 text-xs font-semibold text-gray-700 placeholder-gray-400 border-none outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* Botão de Gravação no Rodapé */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="text-xs text-gray-400 flex items-center">
            {laudoId ? (
              <span className="flex items-center text-emerald-600 font-bold">
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Laudo salvo anteriormente (ID #{laudoId})
              </span>
            ) : (
              <span className="flex items-center text-amber-500 font-bold">
                <AlertCircle className="h-4 w-4 mr-1.5" />
                Nenhum laudo mecânico registrado para esta OS.
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/15 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Salvar Laudo Mecânico</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/os/${id_os}/laudo-mecanico`)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl font-bold text-xs shadow-md shadow-brand-blue/15 active:scale-95 transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Gerar PDF</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default LaudoMecanico;
