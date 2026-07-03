import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); return; }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error) setProfile(data);
    else setProfile(null);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      setSession(session);
      await loadProfile(session?.user?.id);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      loadProfile(session?.user?.id);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [loadProfile]);

  async function signUp(email, password, pseudo) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // Si la confirmation email est désactivée, data.user + session existent immédiatement.
    // Si elle est activée, l'insert profile suivant échouera (pas de session) — voir note dans le chat.
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id, email, pseudo, role: "pilote",
      });
      if (profileError) throw profileError;
    }
    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  const role               = profile?.role || null;
  const isAdmin             = role === "admin";
  const isCoOrganisateur    = role === "co_organisateur";
  const canViewDashboard    = isAdmin || isCoOrganisateur;

  const value = {
    session, profile, loading,
    signUp, signIn, signOut,
    role, isAdmin, isCoOrganisateur, canViewDashboard,
    isAuthenticated: !!session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext doit être utilisé dans un <AuthProvider>");
  return ctx;
}
