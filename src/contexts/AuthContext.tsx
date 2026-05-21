// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { supabase } from '../lib/supabase';

// // Entidade de Domínio
// export interface UserProfile {
//   id: string;
//   email: string;
//   nome: string;
//   id_perfil: number;
//   nome_perfil: string;
//   ativo: boolean;
// }

// interface AuthContextType {
//   profile: UserProfile | null;
//   loading: boolean;
//   signIn: (email: string, password: string) => Promise<{ error: string | null }>;
//   signOut: () => Promise<void>;
// }

// export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [profile, setProfile] = useState<UserProfile | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Adaptador de Infraestrutura: Carrega perfil do banco ou Fallback
//   const loadProfile = async (userId: string) => {
//     try {
//       const { data, error } = await supabase
//         .from('usuarios')
//         .select('*, perfis_acesso(nome_perfil)')
//         .eq('id_usuario', userId)
//         .maybeSingle();

//       if (data && !error) {
//         const p = data as any;
//         const infoPerfil = Array.isArray(p.perfis_acesso)
//           ? p.perfis_acesso[0]
//           : p.perfis_acesso;

//         setProfile({
//           id: p.id_usuario,
//           nome: p.nome_completo,
//           email: p.email,
//           id_perfil: p.id_perfil,
//           nome_perfil: infoPerfil?.nome_perfil || 'Usuário',
//           ativo: p.ativo
//         });
//       } else if (userId === '987b663b-b1e5-44c5-a873-6ee4e52eec0f') {
//         // MODO EMERGÊNCIA PARA WILSON
//         console.warn('⚠️ Perfil não lido do banco. Aplicando Fallback Admin.');
//         setProfile({
//           id: userId,
//           nome: 'Wilson Amorim',
//           email: 'wilamsa@gmail.com',
//           id_perfil: 1,
//           nome_perfil: 'Administrador',
//           ativo: true
//         });
//       } else {
//         setProfile(null);
//       }
//     } catch (err) {
//       console.error('Erro ao carregar perfil:', err);
//       setProfile(null);
//     } finally {
//       // Importante: Só libera o loading aqui
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     // Valida sessão ao recarregar a página
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       if (session?.user) {
//         loadProfile(session.user.id);
//       } else {
//         setLoading(false);
//       }
//     });

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       if (session?.user) {
//         loadProfile(session.user.id);
//       } else {
//         setProfile(null);
//         setLoading(false);
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   const signIn = async (email: string, password: string) => {
//     setLoading(true); // Trava o dashboard até o perfil carregar
//     try {
//       const { data, error } = await supabase.auth.signInWithPassword({ email, password });

//       if (error) {
//         setLoading(false);
//         return { error: 'E-mail ou senha incorretos.' };
//       }

//       if (data.user) {
//         await loadProfile(data.user.id);
//         return { error: null };
//       }

//       setLoading(false);
//       return { error: 'Usuário inválido.' };
//     } catch (err) {
//       setLoading(false);
//       return { error: 'Erro de conexão.' };
//     }
//   };

//   const signOut = async () => {
//     setLoading(true);
//     await supabase.auth.signOut();
//     setProfile(null);
//     setLoading(false);
//   };

//   return (
//     <AuthContext.Provider value={{ profile, loading, signIn, signOut }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Hook exportado separadamente para evitar conflitos no Vite
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
//   return context;
// };

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase'; // Ajustado para a pasta correta de configuração

// Entidade de Domínio
export interface UserProfile {
  id: string;
  email: string;
  nome: string;
  id_perfil: number;
  nome_perfil: string;
  ativo: boolean;
}

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Adaptador de Infraestrutura: Carrega perfil do banco ou Fallback
  const loadProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*, perfis_acesso(nome_perfil)')
        .eq('id_usuario', userId)
        .maybeSingle();

      if (data && !error) {
        const p = data as any;
        const infoPerfil = Array.isArray(p.perfis_acesso)
          ? p.perfis_acesso[0]
          : p.perfis_acesso;

        const userProfileData: UserProfile = {
          id: p.id_usuario,
          nome: p.nome_completo,
          email: p.email,
          id_perfil: p.id_perfil,
          nome_perfil: infoPerfil?.nome_perfil || 'Usuário',
          ativo: p.ativo
        };

        setProfile(userProfileData);
        return userProfileData;
      } else if (userId === '987b663b-b1e5-44c5-a873-6ee4e52eec0f') {
        // MODO EMERGÊNCIA PARA WILSON
        console.warn('⚠️ Perfil não lido do banco. Aplicando Fallback Admin.');
        const fallbackProfile: UserProfile = {
          id: userId,
          nome: 'Wilson Amorim',
          email: 'wilamsa@gmail.com',
          id_perfil: 1,
          nome_perfil: 'Administrador',
          ativo: true
        };
        setProfile(fallbackProfile);
        return fallbackProfile;
      } else {
        setProfile(null);
        return null;
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Valida sessão ao recarregar a página
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true); // Trava a interface até o perfil carregar por segurança
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setLoading(false);
        return { error: 'E-mail ou senha incorretos.' };
      }

      if (data.user) {
        const loadedProfile = await loadProfile(data.user.id);
        
        // Bloqueio de segurança: Se o usuário estiver desativado no banco da oficina
        if (loadedProfile && !loadedProfile.ativo) {
          await supabase.auth.signOut();
          setProfile(null);
          setLoading(false);
          return { error: 'Sua conta está inativa. Entre em contato com o administrador.' };
        }

        return { error: null };
      }

      setLoading(false);
      return { error: 'Usuário inválido.' };
    } catch (err) {
      setLoading(false);
      return { error: 'Erro de conexão interna.' };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Erro ao deslogar do Supabase Auth:', err);
    } finally {
      setProfile(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};