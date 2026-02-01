import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Profile } from '@/types';

interface AuthContextType {
  session: any | null;
  user: any | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
  updateProfileTheme: (theme: string) => Promise<void>;
  assignUnidade: (userId: string, unidadeId: string) => Promise<void>;
  unassignUnidade: (userId: string, unidadeId: string) => Promise<void>;
  setCurrentUnidade: (unidadeId: string | null) => void;
  isProfileLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isLoaded: isClerkLoaded, userId, sessionId, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const sync = async () => {
      if (!isClerkLoaded || !clerkUser || !userId || !mounted) return;

      try {
        const email = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase().trim();

        // Busca unidades e o perfil
        const { data: units } = await supabase.from('unidades').select('*').order('nome');
        const unitsList = units || [];
        const olindaID = "2caba488-fb2f-430c-a774-c016afff04f2";

        const { data: pData } = await supabase
          .from('profiles')
          .upsert({
            email,
            clerk_id: userId,
            first_name: clerkUser.firstName,
            role: email === 'edgareda2015@gmail.com' ? 'admin' : 'user'
          }, { onConflict: 'email' })
          .select()
          .single();

        if (mounted && pData) {
          setProfile({
            ...pData,
            unidades_ids: unitsList.map(u => u.id),
            current_unidade_id: pData.unidade_id || olindaID
          } as Profile);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setIsProfileLoading(false);
      }
    };

    if (isClerkLoaded && clerkUser) sync();
    else if (isClerkLoaded && !userId) {
      setProfile(null);
      setIsProfileLoading(false);
    }

    return () => { mounted = false; };
  }, [isClerkLoaded, clerkUser, userId]);

  const signOut = async () => {
    await clerkSignOut();
    navigate('/', { replace: true });
  };

  const setCurrentUnidade = (id: string | null) => {
    setProfile(p => p ? { ...p, current_unidade_id: id } : null);
  };

  const value = {
    session: sessionId ? { id: sessionId } : null,
    user: clerkUser,
    profile,
    signOut,
    updateProfileTheme: async () => { },
    assignUnidade: async () => { },
    unassignUnidade: async () => { },
    setCurrentUnidade,
    isProfileLoading: isProfileLoading || !isClerkLoaded,
  };

  if (!isClerkLoaded) return <LoadingSpinner message="Iniciando..." />;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};