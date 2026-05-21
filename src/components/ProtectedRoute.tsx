// import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { Loader2 } from 'lucide-react';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   requiredRole?: number; // Mudamos para number para bater com o banco
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
//   const { profile, loading } = useAuth();
//   const location = useLocation();

//   // 1. Enquanto o AuthContext busca o perfil, mostramos um loading amigável
//   // ISSO EVITA O REDIRECT PRECOCE
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
//       </div>
//     );
//   }

//   // 2. Se não houver perfil após o carregamento, tchau!
//   if (!profile) {
//     console.warn("Acesso negado: Perfil não encontrado.");
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   // 3. Verificação de Role (Garantindo que ambos sejam tratados como números)
//   if (requiredRole !== undefined) {
//     const userRole = Number(profile.id_perfil);
//     const needed = Number(requiredRole);
//     console.log(`[ProtectedRoute] userRole=${userRole} (type: ${typeof profile.id_perfil}, raw: ${profile.id_perfil}), needed=${needed}`);
//     if (userRole !== needed) {
//       console.error("Acesso negado: Role insuficiente.");
//       return <Navigate to="/dashboard" replace />;
//     }
//   }

//   return <>{children}</>;
// };

// export default ProtectedRoute;

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: number; // Alinhado com o id_perfil do banco (ex: 1 para Admin)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  // 1. Enquanto o AuthContext busca a sessão e o perfil no Supabase, segura a tela
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 text-brand-blue animate-spin" />
      </div>
    );
  }

  // 2. Se o loading acabou e não retornou perfil, joga para o Login salvando a rota de origem
  if (!profile) {
    console.warn("[ProtectedRoute] Acesso negado: Usuário não autenticado.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Verificação de Nível de Acesso (Role) baseada no id_perfil numérico
  if (requiredRole !== undefined) {
    const userRole = Number(profile.id_perfil);
    const needed = Number(requiredRole);

    if (userRole !== needed) {
      console.error(`[ProtectedRoute] Acesso negado: Perfil ${userRole} não possui permissão para este módulo (Requerido: ${needed}).`);
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;