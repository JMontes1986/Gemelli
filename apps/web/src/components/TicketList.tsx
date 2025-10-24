// src/components/TicketList.tsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { tickets } from '../lib/api';

interface Ticket {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  fecha_creacion: string;
  solicitante?: {
    nombre: string;
    email: string;
  };
}

const TicketList: React.FC = () => {
  const [ticketList, setTicketList] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [filterEstado]);

  const fetchTickets = async () => {
    try {
      const params: any = {};
      if (filterEstado) params.estado = filterEstado;
      
      const response = await tickets.list(params);
      setTicketList(response.data || []);
    } catch (error) {
      console.error('Error al cargar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'CRITICA':
        return <span className="badge bg-red-600 text-white">🔴 Crítica</span>;
      case 'ALTA':
        return <span className="badge-danger">Alta</span>;
      case 'MEDIA':
        return <span className="badge-warning">Media</span>;
      case 'BAJA':
        return <span className="badge-info">Baja</span>;
      default:
        return <span className="badge">{prioridad}</span>;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ABIERTO':
        return (
          <span className="badge bg-blue-100 text-blue-700 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Abierto
          </span>
        );
      case 'EN_PROCESO':
        return (
          <span className="badge bg-yellow-100 text-yellow-700 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            En Proceso
          </span>
        );
      case 'RESUELTO':
        return (
          <span className="badge bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Resuelto
          </span>
        );
      case 'CERRADO':
        return (
          <span className="badge bg-gray-100 text-gray-700 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Cerrado
          </span>
        );
      default:
        return <span className="badge">{estado}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con Filtros */}
      <div className="card">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setFilterEstado('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterEstado === '' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterEstado('ABIERTO')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterEstado === 'ABIERTO' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Abiertos
            </button>
            <button
              onClick={() => setFilterEstado('EN_PROCESO')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterEstado === 'EN_PROCESO' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En Proceso
            </button>
          </div>


          <a
            href="/helpdesk/new"
            className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Nuevo Ticket
          </a>
        </div>
      </div>

      {/* Lista de Tickets */}
      {ticketList.length === 0 ? (
        <div className="card text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay tickets</h3>
          <p className="text-gray-600 mb-4">No se encontraron tickets con los filtros aplicados.</p>
          <a href="/helpdesk/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Crear Primer Ticket
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {ticketList.map((ticket) => (
            <a
              key={ticket.id}
              href={`/helpdesk/${ticket.id}`}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {ticket.titulo}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {ticket.descripcion}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {getPrioridadBadge(ticket.prioridad)}
                    {getEstadoBadge(ticket.estado)}
                    {ticket.solicitante && (
                      <span className="text-gray-500">
                        Por: {ticket.solicitante.nombre}
                      </span>
                    )}
                    <span className="text-gray-400">
                      {formatDate(ticket.fecha_creacion)}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
