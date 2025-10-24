// src/components/DeviceList.tsx
import React, { useState, useEffect } from 'react';
import { Server, Laptop, Printer, Network, Package, Search, Filter } from 'lucide-react';
import { devices } from '../lib/api';

interface Device {
  id: string;
  nombre: string;
  tipo: string;
  estado: string;
  ubicacion: string;
  usuario_actual?: {
    nombre: string;
    email: string;
  };
}

const DeviceList: React.FC = () => {
  const [deviceList, setDeviceList] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  useEffect(() => {
    fetchDevices();
  }, [filterEstado, filterTipo]);

  const fetchDevices = async () => {
    try {
      const params: any = {};
      if (filterEstado) params.estado = filterEstado;
      if (filterTipo) params.tipo = filterTipo;
      
      const response = await devices.list(params);
      setDeviceList(response.data || []);
    } catch (error) {
      console.error('Error al cargar dispositivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (tipo: string) => {
    switch (tipo) {
      case 'PC': return <Server className="w-6 h-6" />;
      case 'LAPTOP': return <Laptop className="w-6 h-6" />;
      case 'IMPRESORA': return <Printer className="w-6 h-6" />;
      case 'RED': return <Network className="w-6 h-6" />;
      default: return <Package className="w-6 h-6" />;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return <span className="badge-success">Activo</span>;
      case 'REPARACIÓN':
        return <span className="badge-warning">En Reparación</span>;
      case 'RETIRADO':
        return <span className="badge-danger">Retirado</span>;
      default:
        return <span className="badge-info">{estado}</span>;
    }
  };

  const filteredDevices = deviceList.filter(device =>
    device.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros y Búsqueda */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Filtro Estado */}
          <div className="w-full md:w-48">
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="input"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="REPARACIÓN">En Reparación</option>
              <option value="RETIRADO">Retirado</option>
            </select>
          </div>

          {/* Filtro Tipo */}
          <div className="w-full md:w-48">
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="input"
            >
              <option value="">Todos los tipos</option>
              <option value="PC">PC</option>
              <option value="LAPTOP">Laptop</option>
              <option value="IMPRESORA">Impresora</option>
              <option value="RED">Red</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Dispositivos */}
      {filteredDevices.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay dispositivos</h3>
          <p className="text-gray-600">No se encontraron dispositivos con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            
              key={device.id}
              href={`/inventory/${device.id}`}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    {getDeviceIcon(device.tipo)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{device.nombre}</h3>
                    <p className="text-sm text-gray-500">{device.tipo}</p>
                  </div>
                </div>
                {getEstadoBadge(device.estado)}
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500">Ubicación</p>
                  <p className="font-medium text-gray-900">{device.ubicacion}</p>
                </div>
                {device.usuario_actual && (
                  <div>
                    <p className="text-gray-500">Usuario</p>
                    <p className="font-medium text-gray-900">{device.usuario_actual.nombre}</p>
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeviceList;
