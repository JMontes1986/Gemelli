// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { Activity, Mail, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        localStorage.setItem('access_token', data.session.access_token);
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo y Título */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gemelli IT</h1>
        <p className="text-gray-600">Inventario & HelpDesk</p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Iniciar Sesión</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Usuario de prueba */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs font-medium text-blue-900 mb-2">Usuario de Prueba:</p>
          <p className="text-xs text-blue-700">Email: admin@gemelli.edu.co</p>
          <p className="text-xs text-blue-700">Password: Admin123!</p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-gray-600 mt-6">
        Sistema protegido con Hash Chain 🔒
      </p>
    </div>
  );
};

export default LoginForm;
