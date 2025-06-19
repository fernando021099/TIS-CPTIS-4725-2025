import { useState } from 'react';
import { Bell, BellOff, CheckCircle, AlertTriangle, Info, X, Filter, Archive } from 'lucide-react';
import { TopBar, NavBar, Footer, FarmaButton } from './Components';

export default function Notificaciones() {
  const [activeTab, setActiveTab] = useState('todas');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'stock',
      title: 'Stock bajo de Paracetamol',
      message: 'Quedan solo 5 unidades de Paracetamol 500mg',
      date: '2023-06-15T10:30:00',
      read: false,
      archived: false
    },
    {
      id: 2,
      type: 'vencimiento',
      title: 'Producto próximo a vencer',
      message: 'El lote de Amoxicilina 500mg vence en 15 días',
      date: '2023-06-14T16:45:00',
      read: true,
      archived: false
    },
    {
      id: 3,
      type: 'venta',
      title: 'Venta exitosa',
      message: 'Se registró una venta de Bs. 245.50',
      date: '2023-06-14T09:15:00',
      read: true,
      archived: true
    },
    {
      id: 4,
      type: 'sistema',
      title: 'Actualización disponible',
      message: 'Nueva versión 2.3.0 del sistema',
      date: '2023-06-13T14:20:00',
      read: false,
      archived: false
    },
    {
      id: 5,
      type: 'stock',
      title: 'Producto agotado',
      message: 'Omeprazol 20mg se ha agotado',
      date: '2023-06-12T11:10:00',
      read: false,
      archived: false
    }
  ]);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'todas',
    dateFrom: '',
    dateTo: '',
    unreadOnly: false
  });

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? {...notif, read: true} : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => 
      ({...notif, read: true})
    ));
  };

  const archiveNotification = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? {...notif, archived: true} : notif
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const applyFilters = () => {
    setActiveTab(filters.type);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      type: 'todas',
      dateFrom: '',
      dateTo: '',
      unreadOnly: false
    });
    setActiveTab('todas');
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab !== 'todas' && notif.type !== activeTab) return false;
    if (filters.dateFrom && new Date(notif.date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(notif.date) > new Date(filters.dateTo)) return false;
    if (filters.unreadOnly && notif.read) return false;
    if (activeTab === 'archivadas' && !notif.archived) return false;
    if (activeTab !== 'archivadas' && notif.archived) return false;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.read && !notif.archived).length;

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'stock':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'vencimiento':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'venta':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'sistema':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
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
            <Bell className="h-6 w-6 mr-2 text-blue-600" />
            Notificaciones
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-sm font-medium px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-600">Gestiona las alertas y notificaciones del sistema</p>
        </div>
        
        {/* Filtros y acciones */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveTab('todas')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'todas' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setActiveTab('stock')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                  activeTab === 'stock' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                Stock
              </button>
              <button
                onClick={() => setActiveTab('vencimiento')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                  activeTab === 'vencimiento' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                Vencimientos
              </button>
              <button
                onClick={() => setActiveTab('venta')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                  activeTab === 'venta' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                Ventas
              </button>
              <button
                onClick={() => setActiveTab('sistema')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                  activeTab === 'sistema' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Info className="h-4 w-4 mr-1 text-blue-500" />
                Sistema
              </button>
              <button
                onClick={() => setActiveTab('archivadas')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                  activeTab === 'archivadas' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Archive className="h-4 w-4 mr-1 text-gray-500" />
                Archivadas
              </button>
            </div>
            
            <div className="flex space-x-3">
              <FarmaButton 
                type="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center border border-gray-300"
              >
                <Filter className="h-5 w-5 mr-2 text-gray-600" />
                <span className="text-gray-700">Filtros</span>
              </FarmaButton>
              <FarmaButton 
                type="primary" 
                onClick={markAllAsRead}
                className="flex items-center"
              >
                <CheckCircle className="h-5 w-5 mr-2 text-white" />
                Marcar todas como leídas
              </FarmaButton>
            </div>
          </div>
          
          {/* Panel de filtros avanzados */}
          {showFilters && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de notificación</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="todas">Todas</option>
                    <option value="stock">Stock</option>
                    <option value="vencimiento">Vencimientos</option>
                    <option value="venta">Ventas</option>
                    <option value="sistema">Sistema</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="unreadOnly"
                  checked={filters.unreadOnly}
                  onChange={(e) => setFilters({...filters, unreadOnly: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="unreadOnly" className="ml-2 block text-sm text-gray-700">
                  Mostrar solo no leídas
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <FarmaButton 
                  type="outline" 
                  onClick={resetFilters}
                  className="border border-gray-300 text-gray-700"
                >
                  Limpiar
                </FarmaButton>
                <FarmaButton 
                  type="primary" 
                  onClick={applyFilters}
                >
                  Aplicar filtros
                </FarmaButton>
              </div>
            </div>
          )}
        </div>

        {/* Lista de notificaciones */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <BellOff className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No hay notificaciones</h3>
              <p className="mt-1 text-gray-500">
                {activeTab === 'archivadas' 
                  ? "No hay notificaciones archivadas" 
                  : "No hay notificaciones que coincidan con los filtros"}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <li 
                  key={notification.id} 
                  className={`px-6 py-4 ${
                    !notification.read ? 'bg-blue-50' : 'bg-white'
                  } hover:bg-gray-50`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-blue-800' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex space-x-3">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Marcar como leída
                          </button>
                        )}
                        {activeTab !== 'archivadas' && !notification.archived && (
                          <button
                            onClick={() => archiveNotification(notification.id)}
                            className="text-xs text-gray-600 hover:text-gray-800"
                          >
                            Archivar
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}