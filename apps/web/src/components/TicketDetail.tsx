// src/components/TicketDetail.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Clock, User, Calendar } from 'lucide-react';
import { tickets } from '../lib/api';

interface Comment {
  id: string;
  comentario: string;
  fecha: string;
  usuario?: {
    nombre: string;
  };
  es_sistema: boolean;
}

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

const TicketDetail: React.FC = () => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const ticketId = window.location.pathname.split('/').pop();
    if (ticketId) {
      fetchTicketDetail(ticketId);
    }
  }, []);

  const fetchTicketDetail = async (id: string) => {
    try {
      const response = await tickets.get(id);
      setTicket(response.ticket);
      setComments(response.comments || []);
    } catch (error) {
      console.error('Error al cargar ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !newComment.trim()) return;

    setSubmitting(true);
    try {
      await tickets.addComment(ticket.id, newComment);
      setNewComment('');
      // Recargar comentarios
      await fetchTicketDetail(ticket.id);
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'long',
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

  if (!ticket) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Ticket no encontrado</p>
        <a href="/helpdesk" className="btn-primary mt-4 inline-flex">
          Volver a Tickets
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      
        href="/helpdesk"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a tickets
      </a>

      {/* Información del Ticket */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.titulo}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {ticket.solicitante?.nombre}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(ticket.fecha_creacion)}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span className={`badge ${
              ticket.prioridad === 'CRITICA' ? 'bg-red-600 text-white' :
              ticket.prioridad === 'ALTA' ? 'badge-danger' :
              ticket.prioridad === 'MEDIA' ? 'badge-warning' : 'badge-info'
            }`}>
              {ticket.prioridad}
            </span>
            <span className={`badge ${
              ticket.estado === 'ABIERTO' ? 'bg-blue-100 text-blue-700' :
              ticket.estado === 'EN_PROCESO' ? 'bg-yellow-100 text-yellow-700' :
              ticket.estado === 'RESUELTO' ? 'badge-success' : 'bg-gray-100 text-gray-700'
            }`}>
              {ticket.estado}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.descripcion}</p>
        </div>
      </div>

      {/* Comentarios */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Comentarios ({comments.length})
        </h2>

        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-lg ${
                comment.es_sistema ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-gray-900">
                  {comment.es_sistema ? '🤖 Sistema' : comment.usuario?.nombre || 'Usuario'}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(comment.fecha)}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.comentario}</p>
            </div>
          ))}
        </div>

        {/* Formulario de comentario */}
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Agregar Comentario
            </label>
            <textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="input min-h-[100px]"
              placeholder="Escribe tu comentario o actualización..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex items-center gap-2"
          >
            {submitting ? (
              'Enviando...'
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Comentario
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketDetail;
