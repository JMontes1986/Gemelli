// src/components/Navbar.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Menu, X, LogOut, User } from 'lucide-react';
import { tryGetSupabaseClient, logout } from '../lib/supabase';
import { auth } from '../lib/api';
import { normalizeRole } from '../lib/roles';
interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  org_unit_id: string;
  org_unit_nombre: string;
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [supabase, setSupabase] = useState<ReturnType<typeof tryGetSupabaseClient>>();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const client = tryGetSupabaseClient();

    if (!client) {
      return;
    }

    setSupabase(client);
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    
    // Obtener usuario actual
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let isActive = true;
    let token: string | null = null;

    try {
      token = window.localStorage.getItem('access_token');
    } catch (storageError) {
      console.error('No se pudo acceder a localStorage para obtener el token:', storageError);
    }

    if (!token) {
      return () => {
        isActive = false;
      };
    }

    const fetchProfile = async () => {
      try {
        const data = await auth.getProfile();
        if (!isActive) {
          return;
        }
        setProfile(data);
      } catch (error) {
        if (!isActive) {
          return;
        }
        setProfile(null);
      }
    };

    fetchProfile();

    return () => {
      isActive = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      if (!supabase) {
        console.error('Supabase no está configurado. No es posible cerrar sesión.');
        return;
      }
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  
  const normalizedRole = useMemo(() => normalizeRole(profile?.rol), [profile?.rol]);
  const isGlobalAdmin = normalizedRole === 'LIDER_TI';

  const navigation = useMemo(() => {
    const items = [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Inventario', href: '/inventory' },
      { name: 'HelpDesk', href: '/helpdesk' },
      { name: 'Backups', href: '/backups' },
    ];

    if (isGlobalAdmin) {
      items.push({ name: 'Administrador', href: '/admin' });
    }

    return items;
  }, [isGlobalAdmin]);

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Gemelli IT</h1>
                <p className="text-xs text-gray-500">Inventario & HelpDesk</p>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {item.name}
                </a>
              ))}
              
              {user && (
                <>
                  <div className="px-4 py-2 mt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
