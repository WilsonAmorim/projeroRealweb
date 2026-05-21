import React, { useEffect, useState } from 'react';
import { X, Loader2, Settings, Zap, Cpu, Tag, Info } from 'lucide-react';
import type { Motor } from '../../types/motor';
import { supabase } from '../../config/supabase';

// ── Componente auxiliar de input (FORA do MotorModal para evitar perda de foco) ──
const InputField = ({
  label, value, onChange, type = 'text', required = false, placeholder = '', disabled = false, className = ''
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string; disabled?: boolean; className?: string;
}) => (
  <div className={className}>
    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
    <input
      type={type}
      required={required}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
    />
  </div>
);

// ── Componente auxiliar de seção (FORA do MotorModal para evitar perda de foco) ──
const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center space-x-2 pt-3 pb-1 border-b border-gray-100">
    <Icon className="h-4 w-4 text-brand-blue" />
    <h4 className="text-xs font-bold text-brand-blue uppercase tracking-wider">{title}</h4>
  </div>
);

interface MotorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (motorData: Motor) => Promise<void>;
  motor: Motor | null;
  isReadOnly: boolean;
}

const MotorModal: React.FC<MotorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  motor,
  isReadOnly
}) => {
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);

  // ── Estados de todos os campos do formulário ──
  const [numSerie, setNumSerie] = useState('');
  const [idCliente, setIdCliente] = useState('');
  const [tagCliente, setTagCliente] = useState('');
  const [classificacao, setClassificacao] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [modelo, setModelo] = useState('');
  const [potencia, setPotencia] = useState('');
  const [unidade, setUnidade] = useState('CV');
  const [rpm, setRpm] = useState('');
  const [numeroPolos, setNumeroPolos] = useState('');
  const [hz, setHz] = useState('');

  // Dados elétricos CA
  const [tensaoV, setTensaoV] = useState('');
  const [correnteNominal, setCorrenteNominal] = useState('');
  const [tensaoNominal, setTensaoNominal] = useState('');
  const [isolamento, setIsolamento] = useState('');
  const [ip, setIp] = useState('');
  const [fs, setFs] = useState('');

  // Dados motor CC
  const [tensArm, setTensArm] = useState('');
  const [corrArm, setCorrArm] = useState('');
  const [tensExc, setTensExc] = useState('');
  const [corrExc, setCorrExc] = useState('');

  // Dados mecânicos / adicionais
  const [rolamentoLa, setRolamentoLa] = useState('');
  const [rolamentoLoa, setRolamentoLoa] = useState('');
  const [codigoFconst, setCodigoFconst] = useState('');
  const [opmed, setOpmed] = useState('');
  const [especificacao, setEspecificacao] = useState('');

  // Carrega a lista de clientes para vincular ao motor
  useEffect(() => {
    if (isOpen) {
      const fetchClientes = async () => {
        const { data, error } = await supabase
          .from('cliente')
          .select('id_cliente, nome_razao_social')
          .order('nome_razao_social');

        if (!error) {
          setClientes(data || []);
        }
      };
      fetchClientes();
    }
  }, [isOpen]);

  // Sincroniza os campos quando o modal abre
  useEffect(() => {
    if (isOpen && motor) {
      setNumSerie(motor.num_serie || '');
      setIdCliente(motor.id_cliente ? String(motor.id_cliente) : '');
      setTagCliente(motor.tag_cliente ?? '');
      setClassificacao(motor.classificacao ?? '');
      setFabricante(motor.fabricante ?? '');
      setModelo(motor.modelo ?? '');
      setPotencia(motor.potencia_cv_kw !== null && motor.potencia_cv_kw !== undefined ? String(motor.potencia_cv_kw) : '');
      setUnidade(motor.unidade_cv_kw || 'CV');
      setRpm(motor.rpm !== null && motor.rpm !== undefined ? String(motor.rpm) : '');
      setNumeroPolos(motor.numero_polos ?? '');
      setHz(motor.hz ?? '');
      setTensaoV(motor.tensao_v ?? '');
      setCorrenteNominal(motor.corrente_nominal ?? '');
      setTensaoNominal(motor.tensao_nominal ?? '');
      setIsolamento(motor.isolamento ?? '');
      setIp(motor.ip ?? '');
      setFs(motor.fs ?? '');
      setTensArm(motor.tens_arm ?? '');
      setCorrArm(motor.corr_arm ?? '');
      setTensExc(motor.tens_exc ?? '');
      setCorrExc(motor.corr_exc ?? '');
      setRolamentoLa(motor.rolamento_la ?? '');
      setRolamentoLoa(motor.rolamento_loa ?? '');
      setCodigoFconst(motor.codigo_fconst !== null && motor.codigo_fconst !== undefined ? String(motor.codigo_fconst) : '');
      setOpmed(motor.opmed ?? '');
      setEspecificacao(motor.especificacao ?? '');
    } else if (isOpen) {
      // Limpa formulário para novo motor
      setNumSerie(''); setIdCliente(''); setTagCliente(''); setClassificacao('');
      setFabricante(''); setModelo(''); setPotencia(''); setUnidade('CV');
      setRpm(''); setNumeroPolos(''); setHz('');
      setTensaoV(''); setCorrenteNominal(''); setTensaoNominal('');
      setIsolamento(''); setIp(''); setFs('');
      setTensArm(''); setCorrArm(''); setTensExc(''); setCorrExc('');
      setRolamentoLa(''); setRolamentoLoa(''); setCodigoFconst('');
      setOpmed(''); setEspecificacao('');
    }
  }, [isOpen, motor]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    setLoading(true);
    try {
      await onSave({
        ...motor,
        num_serie: numSerie.trim(),
        id_cliente: idCliente ? Number(idCliente) : undefined,
        tag_cliente: tagCliente.trim() || undefined,
        classificacao: classificacao.trim() || undefined,
        fabricante: fabricante.trim() || undefined,
        modelo: modelo.trim() || undefined,
        potencia_cv_kw: potencia.trim(),
        unidade_cv_kw: unidade,
        rpm: rpm.trim() || undefined,
        numero_polos: numeroPolos.trim() || undefined,
        hz: hz.trim() || undefined,
        tensao_v: tensaoV.trim() || undefined,
        corrente_nominal: correnteNominal.trim() || undefined,
        tensao_nominal: tensaoNominal.trim() || undefined,
        isolamento: isolamento.trim() || undefined,
        ip: ip.trim() || undefined,
        fs: fs.trim() || undefined,
        tens_arm: tensArm.trim() || undefined,
        corr_arm: corrArm.trim() || undefined,
        tens_exc: tensExc.trim() || undefined,
        corr_exc: corrExc.trim() || undefined,
        rolamento_la: rolamentoLa.trim() || undefined,
        rolamento_loa: rolamentoLoa.trim() || undefined,
        codigo_fconst: codigoFconst.trim() ? Number(codigoFconst) : undefined,
        opmed: opmed.trim() || undefined,
        especificacao: especificacao.trim() || undefined,
      } as Motor);

      onClose();
    } catch (err) {
      console.error('Erro interno no envio do formulário do motor:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between bg-gradient-to-r from-gray-50 to-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Settings className="h-5 w-5 text-brand-blue" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              {isReadOnly ? 'Visualizar Equipamento' : motor ? 'Editar Motor' : 'Cadastrar Novo Motor'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulário com scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ═══ SEÇÃO 1: Identificação ═══ */}
          <SectionHeader icon={Tag} title="Identificação" />

          <div className="grid grid-cols-2 gap-3">
            <InputField label="Nº de Série / Identificação" value={numSerie} onChange={setNumSerie} required disabled={isReadOnly || loading} />
            <InputField label="TAG do Cliente" value={tagCliente} onChange={setTagCliente} placeholder="Ex: BOMBA-01" disabled={isReadOnly || loading} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Proprietário / Cliente</label>
            <select
              required
              disabled={isReadOnly || loading}
              value={idCliente}
              onChange={(e) => setIdCliente(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
            >
              <option value="">Selecione o proprietário</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>{c.nome_razao_social}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField label="Fabricante" value={fabricante} onChange={setFabricante} disabled={isReadOnly || loading} />
            <InputField label="Modelo" value={modelo} onChange={setModelo} disabled={isReadOnly || loading} />
          </div>

          <InputField label="Classificação" value={classificacao} onChange={setClassificacao} placeholder="Ex: Motor de Indução Trifásico" disabled={isReadOnly || loading} />

          {/* ═══ SEÇÃO 2: Dados Técnicos ═══ */}
          <SectionHeader icon={Cpu} title="Dados Técnicos" />

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Potência</label>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-brand-blue/20 focus-within:border-brand-blue transition-colors">
                <input
                  type="number"
                  step="any"
                  disabled={isReadOnly || loading}
                  value={potencia}
                  onChange={(e) => setPotencia(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none disabled:bg-gray-50 disabled:text-gray-500"
                />
                <select
                  disabled={isReadOnly || loading}
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                  className="bg-gray-50 border-l border-gray-200 px-2 text-xs font-bold text-gray-600 outline-none"
                >
                  <option value="CV">CV</option>
                  <option value="KW">KW</option>
                  <option value="HP">HP</option>
                </select>
              </div>
            </div>
            <InputField label="RPM" value={rpm} onChange={setRpm} type="number" disabled={isReadOnly || loading} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <InputField label="Nº de Polos" value={numeroPolos} onChange={setNumeroPolos} type="number" disabled={isReadOnly || loading} />
            <InputField label="Frequência (Hz)" value={hz} onChange={setHz} placeholder="Ex: 60" disabled={isReadOnly || loading} />
            <InputField label="Fator de Serviço (FS)" value={fs} onChange={setFs} placeholder="Ex: 1.15" disabled={isReadOnly || loading} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField label="Rolamento L.A." value={rolamentoLa} onChange={setRolamentoLa} placeholder="Ex: 6308 ZZ" disabled={isReadOnly || loading} />
            <InputField label="Rolamento L.O.A." value={rolamentoLoa} onChange={setRolamentoLoa} placeholder="Ex: 6207 ZZ" disabled={isReadOnly || loading} />
          </div>

          {/* ═══ SEÇÃO 3: Dados Elétricos (CA) ═══ */}
          <SectionHeader icon={Zap} title="Dados Elétricos" />

          <div className="grid grid-cols-3 gap-3">
            <InputField label="Tensão (V)" value={tensaoV} onChange={setTensaoV} placeholder="Ex: 220/380" disabled={isReadOnly || loading} />
            <InputField label="Corrente Nominal (A)" value={correnteNominal} onChange={setCorrenteNominal} placeholder="Ex: 12.5" disabled={isReadOnly || loading} />
            <InputField label="Tensão Nominal (V)" value={tensaoNominal} onChange={setTensaoNominal} placeholder="Ex: 380" disabled={isReadOnly || loading} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <InputField label="Classe de Isolamento" value={isolamento} onChange={setIsolamento} placeholder="Ex: F" disabled={isReadOnly || loading} />
            <InputField label="Grau de Proteção (IP)" value={ip} onChange={setIp} placeholder="Ex: IP55" disabled={isReadOnly || loading} />
            <InputField label="Cód. F.Const." value={codigoFconst} onChange={setCodigoFconst} type="number" disabled={isReadOnly || loading} />
          </div>

          {/* ═══ SEÇÃO 4: Dados Motor CC ═══ */}
          <SectionHeader icon={Zap} title="Dados Motor CC (se aplicável)" />

          <div className="grid grid-cols-2 gap-3">
            <InputField label="Tensão Armadura (V)" value={tensArm} onChange={setTensArm} placeholder="Ex: 180" disabled={isReadOnly || loading} />
            <InputField label="Corrente Armadura (A)" value={corrArm} onChange={setCorrArm} placeholder="Ex: 25" disabled={isReadOnly || loading} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField label="Tensão Excitação (V)" value={tensExc} onChange={setTensExc} placeholder="Ex: 190" disabled={isReadOnly || loading} />
            <InputField label="Corrente Excitação (A)" value={corrExc} onChange={setCorrExc} placeholder="Ex: 2.5" disabled={isReadOnly || loading} />
          </div>

          {/* ═══ SEÇÃO 5: Informações Adicionais ═══ */}
          <SectionHeader icon={Info} title="Informações Adicionais" />

          <InputField label="OP/MED" value={opmed} onChange={setOpmed} placeholder="Código interno ou referência" disabled={isReadOnly || loading} />

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Ficha Técnica / Aplicação</label>
            <textarea
              disabled={isReadOnly || loading}
              value={especificacao}
              onChange={(e) => setEspecificacao(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none disabled:bg-gray-50 disabled:text-gray-500 resize-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-colors"
              placeholder="Ex: Motor acoplado à bomba d'água principal, carcaça 90S..."
            />
          </div>
        </form>

        {/* Footer Ações (fixo) */}
        <div className="p-4 border-t bg-gray-50 flex justify-end space-x-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            {isReadOnly ? 'Fechar' : 'Cancelar'}
          </button>
          {!isReadOnly && (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="px-5 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-blue-dark flex items-center space-x-2 shadow-md transition-all active:scale-95 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{motor ? 'Atualizar' : 'Cadastrar'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MotorModal;