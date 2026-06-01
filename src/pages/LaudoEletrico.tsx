import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LaudoEletricoForm from '../components/os/LaudoEletricoForm';
import LaudoEletricoView from '../components/os/LaudoEletricoView';

export default function LaudoEletricoPage() {
  // Example: in a real integration, `idOs` would come from route params or context
  const [idOs, setIdOs] = useState<number>(1);
  const [correnteNominal, setCorrenteNominal] = useState<number | null>(null);
  const [tab, setTab] = useState<'cadastro'|'visualizacao'>('cadastro');
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <label>OS ID:</label>
        <input type="number" value={idOs} onChange={(e)=>setIdOs(Number(e.target.value))} className="input" />
        <div className="ml-auto">
          <button className={`px-4 py-2 ${tab==='cadastro'?'btn-primary':''}`} onClick={()=>setTab('cadastro')}>Cadastro</button>
          <button className={`px-4 py-2 ml-2 ${tab==='visualizacao'?'btn-primary':''}`} onClick={()=>setTab('visualizacao')}>Visualização</button>
          <button className="px-4 py-2 ml-4 bg-brand-blue text-white rounded" onClick={()=> navigate(`/os/${idOs}/laudo-eletrico`)}>Gerar PDF</button>
        </div>
      </div>

      {tab === 'cadastro' ? (
        <LaudoEletricoForm idOs={idOs} onSaved={(r)=>{ setCorrenteNominal(Number(r.corrente_saida_r ?? 0)); }} />
      ) : (
        <LaudoEletricoView idOs={idOs} correnteNominal={correnteNominal} />
      )}
    </div>
  );
}
