import React, { useEffect, useState } from 'react';
import { CheckCircle, Mail, ShieldCheck, Trash2, UserPlus, XCircle } from 'lucide-react';

import { inventoryPermissions } from '../lib/api';

interface InventoryPermission {
  id: string;
  email: string;
  notes?: string | null;
  granted_at?: string;
  granted_by?: string | null;
  granted_by_user?: {
    nombre?: string | null;
    email?: string | null;
  } | null;
}

interface MessageState {
  type: 'success' | 'error';
  text: string;
}

const InventoryPermissionManager: React.FC = () => {
  const [permissions, setPermissions] = useState<InventoryPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<MessageState | null>(null);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const response = await inventoryPermissions.list();
      setPermissions(response?.data ?? []);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.message || 'No se pudieron cargar los permisos delegados.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const resetForm = () => {
    setEmail('');
    setNotes('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Ingresa un correo electrónico válido.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await inventoryPermissions.create({ email, notes: notes.trim() ? notes.trim() : undefined });
      setMessage({ type: 'success', text: 'Permiso delegado agregado correctamente.' });
      resetForm();
      await loadPermissions();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.message || 'No se pudo agregar el permiso delegado.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (permissionId: string) => {
    const permission = permissions.find((item) => item.id === permissionId);
    const confirmationMessage = permission
      ? `¿Revocar acceso delegado para ${permission.email}?`
      : '¿Revocar este permiso delegado?';

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setRemovingId(permissionId);
    setMessage(null);

    try {
      await inventoryPermissions.remove(permissionId);
      setMessage({ type: 'success', text: 'Permiso delegado revocado.' });
      await loadPermissions();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.message || 'No se pudo revocar el permiso.',
      });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="card mt-6">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Permisos delegados de inventario
          </h3>
          <p className="text-sm text-gray-600">
            Controla qué correos externos al equipo de TI pueden gestionar el inventario de forma excepcional.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">Correo autorizado *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input pl-9"
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">Notas (opcional)</label>
          <input
            type="text"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="input"
            placeholder="Motivo del acceso delegado"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <UserPlus className="h-4 w-4" />
            {submitting ? 'Guardando...' : 'Agregar permiso'}
          </button>
        </div>
      </form>

      {message && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : permissions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center text-gray-600">
            <ShieldCheck className="h-10 w-10 text-blue-400" />
            <p>No hay accesos delegados activos. Solo el personal de TI puede gestionar el inventario.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {permissions.map((permission) => (
              <li key={permission.id} className="flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{permission.email}</p>
                  <div className="mt-1 text-xs text-gray-600">
                    {permission.notes && <p>{permission.notes}</p>}
                    {permission.granted_at && (
                      <p>
                        Desde: {new Date(permission.granted_at).toLocaleDateString()} · Autorizado por{' '}
                        {permission.granted_by_user?.nombre || 'Equipo TI'}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(permission.id)}
                  disabled={removingId === permission.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Trash2 className="h-4 w-4" />
                  {removingId === permission.id ? 'Revocando...' : 'Revocar acceso'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default InventoryPermissionManager;
