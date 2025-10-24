// src/components/NewTicketForm.tsx
import React, { useState } from 'react';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { tickets } from '../lib/api';

const NewTicketForm: React.FC = () => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'>('MEDIA');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await tickets.create({
        titulo,
        descripcion,
        prioridad,
      });

      // Redirigir a la lista de tickets
      window.location.href = '/helpdesk';
    } catch (err: any) {
      setError(err.message || 'Error al crear el ticket');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Botón Volver */}
      <a
        href="/helpdesk"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a tickets
      </a>

      {/* Formulario */}
      <div className="card">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
              Título del Problema *
            </label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="input"
              placeholder="Ej: Internet lento en sala 302"
              required
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">
              {titulo.length}/300 caracteres
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Detallada *
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="input min-h-[120px] resize-y"
              placeholder="Describe el problema con el mayor detalle posible..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Incluye: qué sucede, desde cuándo, ubicación, usuarios afectados
            </p>
          </div>

          {/* Prioridad */}
          <div>
            <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad *
            </label>
            <select
              id="prioridad"
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as any)}
              className="input"
              required
            >
              <option value="BAJA">Baja - No urgente</option>
              <option value="MEDIA">Media - Normal</option>
              <option value="ALTA">Alta - Requiere atención pronto</option>
              <option value="CRITICA">Crítica - Urgente</option>
            </select>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Creando...'
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Crear Ticket
                </>
              )}
            </button>
            <a href="/helpdesk" className="btn-secondary">
              Cancelar
            </a>
          </div>
        </form>
      </div>

      {/* Información */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Consejos para un ticket efectivo:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Sé específico sobre el problema</li>
          <li>• Incluye pasos para reproducir el error</li>
          <li>• Menciona cuándo comenzó el problema</li>
          <li>• Indica si afecta a otros usuarios</li>
        </ul>
      </div>
    </div>
  );
};

export default NewTicketForm;
