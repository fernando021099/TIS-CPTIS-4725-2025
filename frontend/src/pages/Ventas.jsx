import { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Plus, ShoppingCart, Receipt, User, Clock, DollarSign, Calendar } from 'lucide-react';
import { TopBar, NavBar, Footer, FarmaButton } from './Components';

// Datos de ejemplo para ventas
const VENTAS_EJEMPLO = [
  {
    id: 1,
    codigo: 'VEN-001',
    fecha: '2023-06-15T10:30:00',
    cliente: 'Juan Pérez',
    total: 125.50,
    items: [
      { producto: 'Paracetamol 500mg', cantidad: 2, precio: 5.20 },
      { producto: 'Ibuprofeno 400mg', cantidad: 1, precio: 7.50 },
      { producto: 'Amoxicilina 500mg', cantidad: 3, precio: 12.80 }
    ],
    estado: 'completada'
  },
  {
    id: 2,
    codigo: 'VEN-002',
    fecha: '2023-06-16T15:45:00',
    cliente: 'María González',
    total: 64.30,
    items: [
      { producto: 'Omeprazol 20mg', cantidad: 1, precio: 8.90 },
      { producto: 'Loratadina 10mg', cantidad: 4, precio: 6.40 }
    ],
    estado: 'completada'
  },
  {
    id: 3,
    codigo: 'VEN-003',
    fecha: '2023-06-17T11:20:00',
    cliente: 'Carlos Rodríguez',
    total: 38.70,
    items: [
      { producto: 'Ibuprofeno 400mg', cantidad: 3, precio: 7.50 },
      { producto: 'Amoxicilina 500mg', cantidad: 1, precio: 12.80 }
    ],
    estado: 'cancelada'
  },
  {
    id: 4,
    codigo: 'VEN-004',
    fecha: '2023-06-18T09:15:00',
    cliente: 'Ana Martínez',
    total: 22.40,
    items: [
      { producto: 'Paracetamol 500mg', cantidad: 4, precio: 5.20 }
    ],
    estado: 'completada'
  },
  {
    id: 5,
    codigo: 'VEN-005',
    fecha: '2023-06-18T16:30:00',
    cliente: 'Pedro Sánchez',
    total: 0,
    items: [],
    estado: 'pendiente'
  }
];

const ESTADOS_VENTA = ['completada', 'pendiente', 'cancelada'];
const CLIENTES = ['Juan Pérez', 'María González', 'Carlos Rodríguez', 'Ana Martínez', 'Pedro Sánchez'];

export default function RegistroVentas() {
  const [ventas, setVentas] = useState(VENTAS_EJEMPLO);
  const [filters, setFilters] = useState({
    searchTerm: '',
    cliente: 'all',
    estado: 'all',
    fechaDesde: '',
    fechaHasta: '',
    montoMin: '',
    montoMax: '',
    sortBy: 'fecha',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentVenta, setCurrentVenta] = useState(null);
  const [showDetalle, setShowDetalle] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredVentas = ventas.filter(venta => {
    const fechaVenta = new Date(venta.fecha);
    const fechaDesde = filters.fechaDesde ? new Date(filters.fechaDesde) : null;
    const fechaHasta = filters.fechaHasta ? new Date(filters.fechaHasta + 'T23:59:59') : null;
    
    return (
      (filters.searchTerm === '' || 
       venta.codigo.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
       venta.cliente.toLowerCase().includes(filters.searchTerm.toLowerCase())) &&
      (filters.cliente === 'all' || venta.cliente === filters.cliente) &&
      (filters.estado === 'all' || venta.estado === filters.estado) &&
      (filters.montoMin === '' || venta.total >= parseFloat(filters.montoMin)) &&
      (filters.montoMax === '' || venta.total <= parseFloat(filters.montoMax)) &&
      (!fechaDesde || fechaVenta >= fechaDesde) &&
      (!fechaHasta || fechaVenta <= fechaHasta)
    );
  }).sort((a, b) => {
    const order = filters.sortOrder === 'asc' ? 1 : -1;
    
    if (filters.sortBy === 'cliente') {
      return a.cliente.localeCompare(b.cliente) * order;
    }
    
    if (a[filters.sortBy] < b[filters.sortBy]) return -1 * order;
    if (a[filters.sortBy] > b[filters.sortBy]) return 1 * order;
    return 0;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'completada': 'bg-green-100 text-green-800',
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'cancelada': 'bg-red-100 text-red-800'
    };
    
    const texts = {
      'completada': 'Completada',
      'pendiente': 'Pendiente',
      'cancelada': 'Cancelada'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {texts[status] || status}
      </span>
    );
  };

  const handleNuevaVenta = () => {
    setCurrentVenta(null);
    setShowModal(true);
  };

  const formatFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      cliente: 'all',
      estado: 'all',
      fechaDesde: '',
      fechaHasta: '',
      montoMin: '',
      montoMax: '',
      sortBy: 'fecha',
      sortOrder: 'desc'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Componentes reutilizables */}
      <TopBar />
      <NavBar />

      {/* Contenido principal */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 w-full bg-white">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <ShoppingCart className="h-6 w-6 mr-2 text-blue-600" />
            Registro de Ventas
          </h1>
          <p className="text-gray-600">Gestión y seguimiento de transacciones de venta</p>
        </div>
        
        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por código o cliente..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange({ target: { name: 'searchTerm', value: e.target.value } })}
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-gray-700"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filtros
                {showFilters ? <ChevronUp className="h-5 w-5 ml-1" /> : <ChevronDown className="h-5 w-5 ml-1" />}
              </button>

              <FarmaButton 
                type="primary" 
                onClick={handleNuevaVenta}
                className="flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nueva Venta
              </FarmaButton>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select
                  name="cliente"
                  value={filters.cliente}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">Todos los clientes</option>
                  {CLIENTES.map(cliente => (
                    <option key={cliente} value={cliente}>{cliente}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  name="estado"
                  value={filters.estado}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">Todos los estados</option>
                  {ESTADOS_VENTA.map(estado => (
                    <option key={estado} value={estado}>{estado.charAt(0).toUpperCase() + estado.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto mínimo</label>
                  <input
                    type="number"
                    name="montoMin"
                    value={filters.montoMin}
                    onChange={handleFilterChange}
                    placeholder="Mínimo"
                    step="0.01"
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto máximo</label>
                  <input
                    type="number"
                    name="montoMax"
                    value={filters.montoMax}
                    onChange={handleFilterChange}
                    placeholder="Máximo"
                    step="0.01"
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                  <input
                    type="date"
                    name="fechaDesde"
                    value={filters.fechaDesde}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                  <input
                    type="date"
                    name="fechaHasta"
                    value={filters.fechaHasta}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="fecha">Fecha</option>
                  <option value="cliente">Cliente</option>
                  <option value="total">Monto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                <select
                  name="sortOrder"
                  value={filters.sortOrder}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="desc">Descendente</option>
                  <option value="asc">Ascendente</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-end">
                <FarmaButton 
                  type="secondary" 
                  onClick={clearFilters}
                  className="w-full"
                >
                  Limpiar filtros
                </FarmaButton>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Ventas</h3>
                <p className="text-2xl font-bold text-blue-600">{ventas.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Ventas Hoy</h3>
                <p className="text-2xl font-bold text-green-600">
                  {ventas.filter(v => new Date(v.fecha).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <User className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Clientes Únicos</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {[...new Set(ventas.map(v => v.cliente))].length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Pendientes</h3>
                <p className="text-2xl font-bold text-red-600">
                  {ventas.filter(v => v.estado === 'pendiente').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Mostrando {filteredVentas.length} de {ventas.length} ventas
          </p>
          <div className="flex items-center space-x-4">
            <p className="text-sm font-medium">
              Total filtrado: <span className="text-blue-600">Bs. {filteredVentas.reduce((sum, v) => sum + v.total, 0).toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Tabla de ventas */}
        {filteredVentas.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No se encontraron ventas con los filtros aplicados</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto (Bs.)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVentas.map((venta) => (
                    <>
                      <tr key={venta.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600 font-medium">
                          {venta.codigo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatFecha(venta.fecha)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {venta.cliente}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                          {venta.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(venta.estado)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => setShowDetalle(showDetalle === venta.id ? null : venta.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver detalle"
                            >
                              {showDetalle === venta.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {showDetalle === venta.id && (
                        <tr className="bg-blue-50">
                          <td colSpan="6" className="px-6 py-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                <Receipt className="h-5 w-5 mr-2 text-blue-600" />
                                Detalle de la Venta
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Información de la Venta</h5>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Código:</span> {venta.codigo}</p>
                                    <p><span className="font-medium">Fecha:</span> {formatFecha(venta.fecha)}</p>
                                    <p><span className="font-medium">Estado:</span> {getStatusBadge(venta.estado)}</p>
                                  </div>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Información del Cliente</h5>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Nombre:</span> {venta.cliente}</p>
                                    <p><span className="font-medium">Tipo:</span> Cliente general</p>
                                  </div>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Resumen de Pago</h5>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Subtotal:</span> Bs. {(venta.total * 0.87).toFixed(2)}</p>
                                    <p><span className="font-medium">IVA (13%):</span> Bs. {(venta.total * 0.13).toFixed(2)}</p>
                                    <p className="font-medium"><span className="font-medium">Total:</span> Bs. {venta.total.toFixed(2)}</p>
                                  </div>
                                </div>
                              </div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Productos Vendidos</h5>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unitario</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {venta.items.length > 0 ? (
                                      venta.items.map((item, index) => (
                                        <tr key={index}>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.producto}</td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.cantidad}</td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">Bs. {item.precio.toFixed(2)}</td>
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">Bs. {(item.cantidad * item.precio).toFixed(2)}</td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500">
                                          No hay productos en esta venta
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modal para nueva venta (simplificado) */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-gray-200 w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Nueva Venta
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">Funcionalidad no implementada</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <FarmaButton 
                type="outline" 
                onClick={() => setShowModal(false)}
              >
                Cerrar
              </FarmaButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}