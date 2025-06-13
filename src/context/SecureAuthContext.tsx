
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface SecureAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const SecureAuthContext = createContext<SecureAuthContextType | undefined>(undefined);

export const SecureAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔄 Initializing Supabase auth...');

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email || 'no user');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'INITIAL_SESSION') {
          setLoading(false);
        } else if (event === 'SIGNED_IN' && session) {
          console.log('✅ User signed in successfully');
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setLoading(false);
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
        } else {
          console.log('📄 Initial session retrieved:', session?.user?.email || 'no session');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('💥 Error in getSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      console.log('🚀 Starting signup process for:', email);
      
      const redirectUrl = window.location.origin + '/home';
      console.log('🔗 Using redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: username
          }
        }
      });

      if (error) {
        console.error('❌ Supabase signup error:', error);
        throw error;
      }

      console.log('📊 Registration response:', data);

      toast({
        title: 'Registrierung erfolgreich',
        description: data.session ? 'Sie sind jetzt angemeldet!' : 'Registrierung abgeschlossen',
      });

      if (data.session) {
        console.log('🏠 Redirecting to home...');
        navigate('/home');
      }

    } catch (error) {
      console.error('💥 Registration failed:', error);
      
      let message = 'Ein unbekannter Fehler ist aufgetreten';
      if (error instanceof Error) {
        if (error.message.includes('User already registered')) {
          message = 'Ein Benutzer mit dieser E-Mail ist bereits registriert';
        } else if (error.message.includes('Invalid email')) {
          message = 'Ungültige E-Mail-Adresse';
        } else {
          message = error.message;
        }
      }
      
      toast({
        title: 'Registrierung fehlgeschlagen',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('🔐 Starting signin process for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Signin error:', error);
        throw error;
      }

      console.log('✅ Sign in successful for:', data.user?.email);

      toast({
        title: 'Erfolgreich angemeldet',
        description: 'Willkommen zurück!',
      });

      navigate('/home');
    } catch (error) {
      console.error('💥 Anmeldung fehlgeschlagen:', error);
      
      let message = 'Ungültige Anmeldedaten';
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          message = 'Ungültige E-Mail oder Passwort';
        } else {
          message = error.message;
        }
      }
      
      toast({
        title: 'Anmeldung fehlgeschlagen',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('👋 Starting signout process...');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Signout error:', error);
        throw error;
      }

      console.log('✅ Signout successful');

      setSession(null);
      setUser(null);

      toast({
        title: 'Abgemeldet',
        description: 'Sie wurden erfolgreich abgemeldet',
      });

      navigate('/secure-login');
    } catch (error) {
      console.error('💥 Abmeldung fehlgeschlagen:', error);
      toast({
        title: 'Fehler bei der Abmeldung',
        description: 'Es gab ein Problem bei der Abmeldung',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SecureAuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </SecureAuthContext.Provider>
  );
};

export const useSecureAuth = () => {
  const context = useContext(SecureAuthContext);
  if (context === undefined) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider');
  }
  return context;
};
