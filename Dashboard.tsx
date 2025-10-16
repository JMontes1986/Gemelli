// apps/web/src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Server, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  Database,
  Clock,
  Activity,
  Users,
  Package
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  userId: string;
  userRole: string;
}

interface Metrics {
  dispositivos: {
    total: number;
    activos: number;
    reparacion: number;
  };
  tickets: {
    total: number;
    abiertos: number;
    en_proceso: number;
  };
  backups: {
    total: number;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ userId, userRole }) => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/dashboard/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Datos de ejemplo para gráficos
  const ticketsTrendData = [
    { mes: 'Jun', abiertos: 12, cerrados: 8 },
    { mes: 'Jul', abiertos: 15, cerrados: 14 },
    { mes: 'Ago', abiertos: 10, cerrados: 11 },
    { mes: 'Sep', abiertos: 18, cerrados: 15 },
    { mes: 'Oct', abiertos: 8, cerrados: 12 }
  ];

  const deviceTypeData = [
    { name: 'PCs', value: 45 },
    { name: 'Laptops', value: 32 },
    { name: 'Impresoras', value: 12 },
    { name: 'Red', value: 8 },
    { name: 'Otros', value: 5 }
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Resumen general del sistema Gemelli IT</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Server className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">
              {metrics?.dispositivos.activos || 0}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Dispositivos Activos</h3>
          <p className="text-xs text-gray-500 mt-1">
            De {metrics?.dispositivos.total || 0} totales
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">
              {metrics?.tickets.abiertos || 0}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Tickets Abiertos</h3>
          <p className="text-xs text-gray-500 mt-1">
            Requieren atención
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">
              {metrics?.tickets.en_proceso || 0}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">En Proceso</h3>
          <p className="text-xs text-gray-500 mt-1">
            Siendo atendidos
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">
              {metrics?.backups.total || 0}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Backups</h3>
          <p className="text-xs text-gray-500 mt-1">
            Realizados este mes
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de Tickets */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Tendencia de Tickets
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={ticketsTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="abiertos" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Abiertos"
              />
              <Line 
                type="monotone" 
                dataKey="cerrados" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Cerrados"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución de Dispositivos */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Distribución de Dispositivos
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={deviceTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Actividad Reciente
        </h3>
        <div className="space-y-3">
          {[
            { type: 'ticket', action: 'Nuevo ticket creado', desc: 'Internet lento en sala 302', time: 'Hace 5 min', color: 'orange' },
            { type: 'device', action: 'Dispositivo actualizado', desc: 'PC-ADM-001 mantenimiento completado', time: 'Hace 1 hora', color: 'blue' },
            { type: 'backup', action: 'Backup completado', desc: 'LPT-DOC-005 backup incremental', time: 'Hace 2 horas', color: 'green' },
            { type: 'ticket', action: 'Ticket resuelto', desc: 'Problema de contraseña', time: 'Hace 3 horas', color: 'green' }
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className={`w-2 h-2 mt-2 rounded-full bg-${item.color}-500`}></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.action}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
              <span className="text-xs text-gray-500">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-1">156</p>
          <p className="text-blue-100 text-sm">Usuarios Activos</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-1">94%</p>
          <p className="text-green-100 text-sm">Satisfacción del Usuario</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold mb-1">2.5h</p>
          <p className="text-purple-100 text-sm">Tiempo Promedio de Respuesta</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
