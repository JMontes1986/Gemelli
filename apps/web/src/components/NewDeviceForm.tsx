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
  serial: string;
  marca: string;
  modelo: string;
  procesador: string;
  procesadorVelocidad: string;
  memoriaTipo: string;
  memoriaCapacidad: string;
  discoTipo: string;
  discoCapacidad: string;
  tecladoNombre: string;
  tecladoSerial: string;
  mouseNombre: string;
  mouseSerial: string;
}

const initialFormState: FormState = {
  nombre: '',
  tipo: 'PC',
  estado: 'ACTIVO',
  ubicacion: '',
  imagen: '',
  notas: '',
  serial: 'N.A.',
  marca: 'N.A.',
  modelo: 'N.A.',
  procesador: 'N.A.',
  procesadorVelocidad: 'N.A.',
  memoriaTipo: 'N.A.',
  memoriaCapacidad: 'N.A.',
  discoTipo: 'N.A.',
  discoCapacidad: 'N.A.',
  tecladoNombre: 'N.A.',
  tecladoSerial: 'N.A.',
  mouseNombre: 'N.A.',
  mouseSerial: 'N.A.',
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

  const sanitizeOrNA = (value: string) => value.trim() || 'N.A.';
  
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
        serial: sanitizeOrNA(formData.serial),
        marca: sanitizeOrNA(formData.marca),
        modelo: sanitizeOrNA(formData.modelo),
        notas: formData.notas.trim() ? formData.notas : undefined,
        imagen: formData.imagen.trim() ? formData.imagen : undefined,
        specs: {
          procesador: sanitizeOrNA(formData.procesador),
          procesador_velocidad: sanitizeOrNA(formData.procesadorVelocidad),
          memoria_tipo: sanitizeOrNA(formData.memoriaTipo),
          memoria_capacidad: sanitizeOrNA(formData.memoriaCapacidad),
          disco_tipo: sanitizeOrNA(formData.discoTipo),
          disco_capacidad: sanitizeOrNA(formData.discoCapacidad),
          teclado: {
            nombre: sanitizeOrNA(formData.tecladoNombre),
            serial: sanitizeOrNA(formData.tecladoSerial),
          },
          mouse: {
            nombre: sanitizeOrNA(formData.mouseNombre),
            serial: sanitizeOrNA(formData.mouseSerial),
          },
        },
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
          <p className="text-sm text-gray-500">
            Completa los campos con la información disponible. Si algún dato no aplica, mantén el valor "N.A.".
          </p>
          
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Serial del equipo</label>
              <input
                type="text"
                value={formData.serial}
                onChange={handleChange('serial')}
                className="input"
                placeholder="Ej. SN-ABC123456"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Marca</label>
              <input
                type="text"
                value={formData.marca}
                onChange={handleChange('marca')}
                className="input"
                placeholder="Ej. Lenovo"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Modelo</label>
              <input
                type="text"
                value={formData.modelo}
                onChange={handleChange('modelo')}
                className="input"
                placeholder="Ej. ThinkPad L14"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Especificaciones técnicas</h2>
              <p className="text-sm text-gray-500">Describe el hardware principal del equipo.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Procesador</label>
                <input
                  type="text"
                  value={formData.procesador}
                  onChange={handleChange('procesador')}
                  className="input"
                  placeholder="Ej. Intel Core i5"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Velocidad del procesador (GHz)</label>
                <input
                  type="text"
                  value={formData.procesadorVelocidad}
                  onChange={handleChange('procesadorVelocidad')}
                  className="input"
                  placeholder="Ej. 2.6 GHz"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Memoria RAM (tipo)</label>
                <input
                  type="text"
                  value={formData.memoriaTipo}
                  onChange={handleChange('memoriaTipo')}
                  className="input"
                  placeholder="Ej. DDR4"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Capacidad memoria RAM</label>
                <input
                  type="text"
                  value={formData.memoriaCapacidad}
                  onChange={handleChange('memoriaCapacidad')}
                  className="input"
                  placeholder="Ej. 16GB"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Disco duro (tipo)</label>
                <input
                  type="text"
                  value={formData.discoTipo}
                  onChange={handleChange('discoTipo')}
                  className="input"
                  placeholder="Ej. SSD NVMe"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Capacidad disco duro</label>
                <input
                  type="text"
                  value={formData.discoCapacidad}
                  onChange={handleChange('discoCapacidad')}
                  className="input"
                  placeholder="Ej. 512GB"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Periféricos asignados</h2>
              <p className="text-sm text-gray-500">Registra teclado y mouse asociados al equipo.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700">Teclado</h3>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Descripción</label>
                  <input
                    type="text"
                    value={formData.tecladoNombre}
                    onChange={handleChange('tecladoNombre')}
                    className="input"
                    placeholder="Ej. Logitech K120"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Serial</label>
                  <input
                    type="text"
                    value={formData.tecladoSerial}
                    onChange={handleChange('tecladoSerial')}
                    className="input"
                    placeholder="Ej. KB-00123"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700">Mouse</h3>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Descripción</label>
                  <input
                    type="text"
                    value={formData.mouseNombre}
                    onChange={handleChange('mouseNombre')}
                    className="input"
                    placeholder="Ej. Logitech B100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Serial</label>
                  <input
                    type="text"
                    value={formData.mouseSerial}
                    onChange={handleChange('mouseSerial')}
                    className="input"
                    placeholder="Ej. MS-00987"
                  />
                </div>
              </div>
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
