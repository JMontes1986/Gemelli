import React, { useState } from 'react';
import { ArrowLeft, PlusCircle, XCircle } from 'lucide-react';

import { devices } from '../lib/api';

type DeviceType = 'PC' | 'LAPTOP' | 'IMPRESORA' | 'RED' | 'OTRO';
type DeviceStatus = 'ACTIVO' | 'REPARACIÓN' | 'RETIRADO';

interface FormState {
  nombre: string;
  tipo: DeviceType;
  estado: DeviceStatus;
  ubicacion: string;
  imagen: string;
  notas: string;
}

const initialFormState: FormState = {
  nombre: '',
  tipo: 'PC',
  estado: 'ACTIVO',
  ubicacion: '',
  imagen: '',
  notas: '',
};

const NewDeviceForm: React.FC = () => {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const handleChange = (
    field: keyof FormState
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        nombre: formData.nombre,
        tipo: formData.tipo,
        estado: formData.estado,
        ubicacion: formData.ubicacion,
        notas: formData.notas.trim() ? formData.notas : undefined,
        imagen: formData.imagen.trim() ? formData.imagen : undefined,
      };

      await devices.create(payload);

      setSuccessMessage('Dispositivo agregado correctamente al inventario. Redirigiendo...');
      setFormData(initialFormState);

      setTimeout(() => {
        window.location.href = '/inventory';
      }, 1500);
    } catch (submissionError: any) {
      setError(submissionError?.message || 'No se pudo registrar el dispositivo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <a href="/inventory" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        Volver al inventario
      </a>

      <div className="card">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <XCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Nombre del dispositivo *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={handleChange('nombre')}
                className="input"
                placeholder="Ej. Laptop Coordinador Académico"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Tipo *</label>
              <select value={formData.tipo} onChange={handleChange('tipo')} className="input" required>
                <option value="PC">PC</option>
                <option value="LAPTOP">Laptop</option>
                <option value="IMPRESORA">Impresora</option>
                <option value="RED">Equipo de red</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Estado *</label>
              <select value={formData.estado} onChange={handleChange('estado')} className="input" required>
                <option value="ACTIVO">Activo</option>
                <option value="REPARACIÓN">En reparación</option>
                <option value="RETIRADO">Retirado</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Ubicación *</label>
              <input
                type="text"
                value={formData.ubicacion}
                onChange={handleChange('ubicacion')}
                className="input"
                placeholder="Ej. Biblioteca, Aula 203"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">URL de imagen (opcional)</label>
            <input
              type="url"
              value={formData.imagen}
              onChange={handleChange('imagen')}
              className="input"
              placeholder="https://..."
            />
            <p className="mt-1 text-xs text-gray-500">Puedes enlazar una fotografía o imagen de referencia del equipo.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Notas adicionales</label>
            <textarea
              value={formData.notas}
              onChange={handleChange('notas')}
              className="input"
              rows={4}
              placeholder="Descripción, accesorios incluidos, licencias, observaciones, etc."
            />
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
            <a href="/inventory" className="btn-secondary flex w-full items-center justify-center gap-2 md:w-auto">
              Cancelar
            </a>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex w-full items-center justify-center gap-2 md:w-auto"
            >
              <PlusCircle className="h-4 w-4" />
              {saving ? 'Registrando...' : 'Registrar dispositivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDeviceForm;
