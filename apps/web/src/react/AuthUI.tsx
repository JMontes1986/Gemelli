import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import { useAuth } from './AuthContext';
export default function AuthUI(){
  const { user } = useAuth();
  useEffect(()=>{ if(user) window.location.href = '/'; }, [user]);
  return (<div className="bg-white p-4 rounded-2xl shadow"><Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={[]} /></div>);
}
