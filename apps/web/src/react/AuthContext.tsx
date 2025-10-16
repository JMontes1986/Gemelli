import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
type UserCtx = { user: any | null; role: string | null; signIn: (email: string, password: string) => Promise<void>; signOut: () => Promise<void>; refreshRole: () => Promise<void>; };
const Ctx = createContext<UserCtx>({ user: null, role: null, signIn: async ()=>{}, signOut: async()=>{}, refreshRole: async()=>{} });
export const useAuth = () => useContext(Ctx);
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  useEffect(()=>{ supabase.auth.getUser().then(({data})=>setUser(data.user||null)); const { data: sub } = supabase.auth.onAuthStateChange((_e, session)=> setUser(session?.user || null)); return ()=> sub?.subscription.unsubscribe(); },[]);
  const refreshRole = async ()=>{ if(!user){ setRole(null); return; } const { data } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle(); setRole(data?.role || null); };
  useEffect(()=>{ refreshRole(); }, [user]);
  const signIn = async (email:string, password:string)=>{ const { error } = await supabase.auth.signInWithPassword({ email, password }); if(error) throw error; };
  const signOut = async ()=>{ await supabase.auth.signOut(); };
  return <Ctx.Provider value={{ user, role, signIn, signOut, refreshRole }}>{children}</Ctx.Provider>;
};
export const RequireRole: React.FC<{ role: string, fallback?: React.ReactNode, children: React.ReactNode }> = ({ role: need, fallback=null, children }) => {
  const { role } = useAuth(); if (role !== need) return <>{fallback || null}</>; return <>{children}</>;
};
