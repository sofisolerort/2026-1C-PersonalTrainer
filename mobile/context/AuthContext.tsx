import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/utils/Supabase";

type Role = "cliente" | "entrenador";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  role: Role | null;
  isLoading: boolean;

  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const lastRoleUserIdRef = useRef<string | null>(null);

  const fetchRole = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.log("ERROR FETCH ROLE:", error.message);
      setRole(null);
      return;
    }

    setRole((data?.role as Role) ?? null);
    lastRoleUserIdRef.current = userId;
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("AUTH EVENT:", event);

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (!currentSession?.user) {
          setRole(null);
          lastRoleUserIdRef.current = null;
          setIsLoading(false);
          return;
        }

        const currentUserId = currentSession.user.id;

        // Evita volver a consultar profiles.role cuando solo se refresca el token.
        if (
          event === "TOKEN_REFRESHED" &&
          lastRoleUserIdRef.current === currentUserId
        ) {
          setIsLoading(false);
          return;
        }

        await fetchRole(currentUserId);
        setIsLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [fetchRole]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    setIsLoading(true);

    await supabase.auth.signOut();

    setUser(null);
    setSession(null);
    setRole(null);
    lastRoleUserIdRef.current = null;

    setIsLoading(false);
  };

  const refreshRole = async () => {
    if (!user?.id) return;

    await fetchRole(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isLoading,
        signUp,
        signIn,
        signOut,
        refreshRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);