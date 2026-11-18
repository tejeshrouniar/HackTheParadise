import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, phoneNumber: string, schoolName: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setNewPassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not connected yet. Add your project URL and publishable key.');
  return supabase;
}

// Supabase Auth owns session lifetime; profile onboarding stays in the profile feature.
export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    const startupTimer = setTimeout(() => { if (active) setLoading(false); }, 20_000);
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) console.error('Unable to restore Hack The Paradise session:', error.message);
      setSession(data.session);
    }).catch((error) => {
      if (active) console.error('Unable to restore Hack The Paradise session:', error);
    }).finally(() => {
      clearTimeout(startupTimer);
      if (active) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true);
      if (event === 'SIGNED_OUT') setIsPasswordRecovery(false);
      setLoading(false);
    });

    return () => {
      active = false;
      clearTimeout(startupTimer);
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    session,
    loading,
    configured: isSupabaseConfigured,
    isPasswordRecovery,
    signIn: async (email, password) => {
      const { error } = await requireSupabase().auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    signUp: async (name, email, password, phoneNumber, schoolName) => {
      const { data, error } = await requireSupabase().auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name.trim(),
            signup_phone_number: phoneNumber,
            signup_school_name: schoolName,
          },
          emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
        },
      });
      if (error?.name === 'AuthRetryableFetchError') {
        throw new Error('Account creation could not be confirmed. Try signing in with your email and password before creating another account.');
      }
      if (error) throw error;
      return { needsEmailConfirmation: !data.session };
    },
    signInWithGoogle: async () => {
      const { error } = await requireSupabase().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}${window.location.pathname}` },
      });
      if (error) throw error;
    },
    resetPassword: async (email) => {
      const { error } = await requireSupabase().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${window.location.pathname}`,
      });
      if (error) throw error;
    },
    setNewPassword: async (password) => {
      const { error } = await requireSupabase().auth.updateUser({ password });
      if (error) throw error;
      setIsPasswordRecovery(false);
    },
    signOut: async () => {
      const { error } = await requireSupabase().auth.signOut({ scope: 'local' });
      if (error) throw error;
    },
  }), [session, loading, isPasswordRecovery]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
