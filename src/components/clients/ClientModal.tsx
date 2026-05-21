// import React, { useState, useEffect } from 'react';
// import type { Cliente } from '../../types/client';
// import { X, Save, AlertCircle, Eye } from 'lucide-react';

// interface ClientModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (client: Cliente) => Promise<void>;
//   client?: Cliente | null;
//   isReadOnly?: boolean;
// }

// const EMPTY_FORM: Partial<Cliente> = {
//   documento: '',
//   nome_razao_social: '',
//   nome_fantasia: '',
//   inscricao_estadual: '',
//   endereco: '',
//   bairro: '',
//   cep: '',
//   cidade: '',
//   estado: '',
//   telefone: '',
//   email: '',
//   observacao: '',
// };

// const ClientModal: React.FC<ClientModalProps> = ({
//   isOpen,
//   onClose,
//   onSave,
//   client,
//   isReadOnly = false,
// }) => {
//   const [formData, setFormData] = useState<Partial<Cliente>>(EMPTY_FORM);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     setFormData(client ?? EMPTY_FORM);
//     setError(null);
//   }, [client, isOpen]);

//   if (!isOpen) return null;

//   // Funções de Máscara (Úteis para manter o banco limpo)
//   const maskDocument = (val: string) => {
//     const v = val.replace(/\D/g, '').substring(0, 14);
//     if (v.length <= 11) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "$1.$2.$3-$4");
//     return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "$1.$2.$3/$4-$5");
//   };

//   const maskCEP = (val: string) => val.replace(/\D/g, '').substring(0, 8).replace(/(\d{5})(\d{3})/g, "$1-$2");

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     if (isReadOnly) return;
//     const { name, value } = e.target;

//     let finalValue = value;
//     if (name === 'documento') finalValue = maskDocument(value);
//     if (name === 'cep') finalValue = maskCEP(value);
//     if (name === 'estado') finalValue = value.toUpperCase().substring(0, 2);

//     setFormData((prev) => ({ ...prev, [name]: finalValue }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (isReadOnly) return;
//     setError(null);

//     // Validação de campos obrigatórios
//     if (!formData.documento || !formData.nome_razao_social) {
//       setError('Documento e Nome/Razão Social são obrigatórios.');
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       await onSave(formData as Cliente);
//       onClose();
//     } catch (err: any) {
//       setError(err.response?.data?.message || err.message || 'Erro ao salvar cliente.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const inputClass = (extra = '') =>
//     `w-full px-4 py-2 border rounded-lg outline-none transition-all ${extra} ${isReadOnly
//       ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-default'
//       : 'border-gray-300 focus:ring-2 focus:ring-brand-blue'
//     }`;

//   const title = isReadOnly ? 'Visualizar Cliente' : client ? 'Editar Cliente' : 'Novo Cliente';

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
//         {/* Header */}
//         <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
//           <h2 className="text-xl font-bold text-brand-blue flex items-center gap-2">
//             {isReadOnly && <Eye className="h-5 w-5 text-gray-400" />}
//             {title}
//           </h2>
//           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
//             <X className="h-5 w-5 text-gray-500" />
//           </button>
//         </div>

//         {/* Body */}
//         <form id="client-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
//           {error && (
//             <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start space-x-3">
//               <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
//               <p className="text-sm text-red-700 font-medium">{error}</p>
//             </div>
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Coluna Esquerda */}
//             <div className="space-y-4">
//               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Informações Principais</h3>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Documento (CPF/CNPJ) <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   name="documento"
//                   value={formData.documento || ''}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   required
//                   placeholder="000.000.000-00"
//                   className={inputClass()}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Razão Social / Nome Completo <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   name="nome_razao_social"
//                   value={formData.nome_razao_social || ''}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   required
//                   placeholder="Ex: Real Serviços Ltda"
//                   className={inputClass()}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
//                 <input
//                   name="nome_fantasia"
//                   value={formData.nome_fantasia || ''}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   className={inputClass()}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual</label>
//                 <input
//                   name="inscricao_estadual"
//                   value={formData.inscricao_estadual || ''}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   className={inputClass()}
//                 />
//               </div>
//             </div>

//             {/* Coluna Direita */}
//             <div className="space-y-4">
//               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contato e Localização</h3>

//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
//                   <input
//                     name="cidade"
//                     value={formData.cidade || ''}
//                     onChange={handleChange}
//                     readOnly={isReadOnly}
//                     className={inputClass()}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Estado (UF)</label>
//                   <input
//                     name="estado"
//                     value={formData.estado || ''}
//                     onChange={handleChange}
//                     readOnly={isReadOnly}
//                     maxLength={2}
//                     placeholder="BA"
//                     className={inputClass('uppercase')}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
//                 <input
//                   name="endereco"
//                   value={formData.endereco || ''}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   className={inputClass()}
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
//                   <input
//                     name="bairro"
//                     value={formData.bairro || ''}
//                     onChange={handleChange}
//                     readOnly={isReadOnly}
//                     className={inputClass()}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
//                   <input
//                     name="cep"
//                     value={formData.cep || ''}
//                     onChange={handleChange}
//                     readOnly={isReadOnly}
//                     placeholder="00000-000"
//                     className={inputClass()}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
//                 <input
//                   name="telefone"
//                   value={formData.telefone || ''}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   placeholder="(71) 9999-9999"
//                   className={inputClass()}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
//                 <input
//                   name="email"
//                   type={isReadOnly ? 'text' : 'email'}
//                   value={formData.email || ''}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   className={inputClass()}
//                 />
//               </div>
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
//             <textarea
//               name="observacao"
//               value={formData.observacao || ''}
//               onChange={handleChange}
//               readOnly={isReadOnly}
//               rows={3}
//               className={`${inputClass()} resize-none`}
//             />
//           </div>
//         </form>

//         {/* Footer */}
//         <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
//           >
//             {isReadOnly ? 'Fechar' : 'Cancelar'}
//           </button>

//           {!isReadOnly && (
//             <button
//               form="client-form"
//               type="submit"
//               disabled={isSubmitting}
//               className="flex items-center px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-dark-blue transition-colors disabled:opacity-50"
//             >
//               {isSubmitting ? (
//                 <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
//               ) : (
//                 <Save className="h-4 w-4 mr-2" />
//               )}
//               {client ? 'Salvar Alterações' : 'Cadastrar Cliente'}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClientModal;

import React, { useState, useEffect } from 'react';
import type { Cliente } from '../../types/client';
import { X, Save, AlertCircle, Eye } from 'lucide-react';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Cliente) => Promise<void>;
  client?: Cliente | null;
  isReadOnly?: boolean;
}

const EMPTY_FORM: Partial<Cliente> = {
  documento: '',
  nome_razao_social: '',
  nome_fantasia: '',
  inscricao_estadual: '',
  endereco: '',
  bairro: '',
  cep: '',
  cidade: '',
  estado: '',
  telefone: '',
  email: '',
  observacao: '',
};

const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  client,
  isReadOnly = false,
}) => {
  const [formData, setFormData] = useState<Partial<Cliente>>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // CORREÇÃO: Trata valores nulos vindos do banco de dados para evitar inputs descontrolados
      if (client) {
        setFormData({
          id_cliente: client.id_cliente,
          documento: client.documento || '',
          nome_razao_social: client.nome_razao_social || '',
          nome_fantasia: client.nome_fantasia || '',
          inscricao_estadual: client.inscricao_estadual || '',
          endereco: client.endereco || '',
          bairro: client.bairro || '',
          cep: client.cep || '',
          cidade: client.cidade || '',
          estado: client.estado || '',
          telefone: client.telefone || '',
          email: client.email || '',
          observacao: client.observacao || '',
        });
      } else {
        setFormData(EMPTY_FORM);
      }
      setError(null);
    }
  }, [client, isOpen]);

  if (!isOpen) return null;

  // CORREÇÃO: Expressões regulares seguras para máscaras sem risco de travamento do bundle
  const maskDocument = (val: string) => {
    const v = val.replace(/\D/g, '').substring(0, 14);
    if (v.length <= 11) {
      return v.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
    }
    return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})$/, "$1.$2.$3/$4-$5");
  };

  const maskCEP = (val: string) => {
    return val.replace(/\D/g, '').substring(0, 8).replace(/^(\d{5})(\d{1,3})$/, "$1-$2");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isReadOnly) return;
    const { name, value } = e.target;

    let finalValue = value;
    if (name === 'documento') finalValue = maskDocument(value);
    if (name === 'cep') finalValue = maskCEP(value);
    if (name === 'estado') finalValue = value.toUpperCase().substring(0, 2);

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setError(null);

    // Validação estrita de campos obrigatórios do domínio da oficina
    if (!formData.documento?.trim() || !formData.nome_razao_social?.trim()) {
      setError('Documento e Nome/Razão Social são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData as Cliente);
      onClose();
    } catch (err: any) {
      console.error('Erro ao processar salvamento do cliente:', err);
      setError(err.message || 'Erro ao salvar cliente. Verifique as restrições do banco.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (extra = '') =>
    `w-full px-4 py-2 border rounded-lg outline-none transition-all text-sm ${extra} ${isReadOnly
      ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-default select-none'
      : 'border-gray-300 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue'
    }`;

  const title = isReadOnly ? 'Visualizar Cliente' : client ? 'Editar Cliente' : 'Novo Cliente';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-brand-blue flex items-center gap-2">
            {isReadOnly && <Eye className="h-5 w-5 text-gray-400" />}
            {title}
          </h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form id="client-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Informações Principais</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documento (CPF/CNPJ) <span className="text-red-500">*</span>
                </label>
                <input
                  name="documento"
                  value={formData.documento || ''}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  required
                  placeholder="000.000.000-00"
                  className={inputClass()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razão Social / Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  name="nome_razao_social"
                  value={formData.nome_razao_social || ''}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  required
                  placeholder="Ex: Real Serviços Ltda"
                  className={inputClass()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
                <input
                  name="nome_fantasia"
                  value={formData.nome_fantasia || ''}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  className={inputClass()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual</label>
                <input
                  name="inscricao_estadual"
                  value={formData.inscricao_estadual || ''}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  className={inputClass()}
                />
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contato e Localização</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  <input
                    name="cidade"
                    value={formData.cidade || ''}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    className={inputClass()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado (UF)</label>
                  <input
                    name="estado"
                    value={formData.estado || ''}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    maxLength={2}
                    placeholder="BA"
                    className={inputClass('uppercase')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input
                  name="endereco"
                  value={formData.endereco || ''}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  className={inputClass()}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                  <input
                    name="bairro"
                    value={formData.bairro || ''}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    className={inputClass()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                  <input
                    name="cep"
                    value={formData.cep || ''}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    placeholder="00000-000"
                    className={inputClass()}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  name="telefone"
                  value={formData.telefone || ''}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  placeholder="(71) 99999-9999"
                  className={inputClass()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  name="email"
                  type={isReadOnly ? 'text' : 'email'}
                  value={formData.email || ''}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  className={inputClass()}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              name="observacao"
              value={formData.observacao || ''}
              onChange={handleChange}
              readOnly={isReadOnly}
              rows={3}
              className={`${inputClass()} resize-none`}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            {isReadOnly ? 'Fechar' : 'Cancelar'}
          </button>

          {!isReadOnly && (
            <button
              form="client-form"
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-dark-blue transition-colors disabled:opacity-50 font-bold shadow-sm"
            >
              {isSubmitting ? (
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {client ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientModal;