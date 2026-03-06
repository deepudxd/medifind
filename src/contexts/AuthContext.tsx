import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Profile, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<any>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Mock users for demo until Supabase is fully connected (using DB tables)
const MOCK_USERS: (Profile & { password: string })[] = [
  { id: '1', name: 'John Patient', email: 'patient@demo.com', password: 'demo123', role: 'patient' },
  { id: '2', name: 'Dr. Sarah Smith', email: 'doctor@demo.com', password: 'demo123', role: 'doctor' },
  { id: '3', name: 'Admin User', email: 'admin@demo.com', password: 'demo123', role: 'admin' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Safety fallback: if Supabase hangs, force loading to false after 2s
    const fallbackTimeout = setTimeout(() => {
      if (isMounted) {
        console.log("AuthContext: forcing loading=false via timeout");
        setLoading(false);
      }
    }, 2000);

    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(fallbackTimeout);
      try {
        if (session?.user) {
          // Optimistic UI update: instantly set user using session metadata so Navbar unblocks
          if (isMounted) {
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: (session.user.user_metadata?.role as UserRole) || 'patient'
            });
          }

          // Background fetch to get absolute profile row
          supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data: profile, error }) => {
            if (error) console.warn("Initial profile fetch error:", error);
            if (profile && isMounted) setUser(profile as Profile);
          });
        } else {
          if (isMounted) setUser(null);
        }
      } catch (error) {
        console.error("Error setting session profile:", error);
      } finally {
        console.log("Session restore complete. User state:", isMounted ? "mounted" : "unmounted");
        if (isMounted) setLoading(false);
      }
    }).catch(err => {
      console.error("Supabase auth error:", err);
      clearTimeout(fallbackTimeout);
      if (isMounted) setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed! Event:", _event, "Session exists?", !!session);
      if (session?.user) {
        // Optimistic UI update
        if (isMounted) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: (session.user.user_metadata?.role as UserRole) || 'patient'
          });
        }

        // Background fetch for absolute database row
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data: profile, error }) => {
          if (error) console.warn("Background profile fetch:", error.message);
          if (profile && isMounted) {
            console.log("Background profile fetched:", profile);
            setUser(profile as Profile);
          }
        });
      } else {
        if (isMounted) setUser(null);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      // Setup a 2.5-second fallback timer. If Gotrue browser lock hangs, resolve anyway.
      // onAuthStateChange already handles updating the React user context successfully in the background.
      const timer = setTimeout(() => {
        console.warn("Gotrue lock timed out, resolving login early");
        resolve();
      }, 2500);

      supabase.auth.signInWithPassword({
        email,
        password,
      }).then(({ error }) => {
        clearTimeout(timer);
        if (error) {
          // Fallback to mock for testing if Supabase isn't fully set up yet
          const found = MOCK_USERS.find(u => u.email === email && u.password === password);
          if (!found) {
            reject(error);
            return;
          } else {
            const { password: _, ...profile } = found;
            setUser(profile);
          }
        }
        resolve();
      }).catch(err => {
        clearTimeout(timer);
        reject(err);
      });
    });
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        }
      }
    });

    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
