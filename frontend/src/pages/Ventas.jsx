import { useState } from 'react';
import { Calendar, BarChart2, PieChart, FileText, ShoppingCart, Package } from 'lucide-react';
import { TopBar, NavBar, Footer } from './Components';

export default function Reportes() {
  const [reportType, setReportType] = useState('ventas');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  // Datos de ejemplo para reportes
  const reportData = {
    ventas: [
      { fecha: '2023-06-01', cantidad: 45, total: 1250.75 },
      { fecha: '2023-06-02', cantidad: 38, total: 980.50 },
      { fecha: '2023-06-03', cantidad: 52, total: 1420.25 },
      { fecha: '2023-06-04', cantidad: 29, total: 790.80 },
      { fecha: '2023-06-05', cantidad: 63, total: 1750.40 },
      { fecha: '2023-06-06', cantidad: 47, total: 1320.60 },
      { fecha: '2023-06-07', cantidad: 41, total: 1150.30 }
    ],
    inventario: [
      { producto: 'Paracetamol 500mg', stock: 150, vendidos: 85, categoria: 'Analgésico' },
      { producto: 'Ibuprofeno 400mg', stock: 63, vendidos: 120, categoria: 'Antiinflamatorio' },
      { producto: 'Amoxicilina 500mg', stock: 42, vendidos: 78, categoria: 'Antibiótico' },
      { producto: 'Omeprazol 20mg', stock: 0, vendidos: 95, categoria: 'Antiácido' },
      { producto: 'Loratadina 10mg', stock: 87, vendidos: 65, categoria: 'Antihistamínico' }
    ],
    clientes: [
      { nombre: 'Juan Pérez', compras: 12, total: 845.50, ultimaCompra: '2023-06-05' },
      { nombre: 'María González', compras: 8, total: 620.75, ultimaCompra: '2023-06-03' },
      { nombre: 'Carlos Rodríguez', compras: 5, total: 320.40, ultimaCompra: '2023-05-28' },
      { nombre: 'Ana Martínez', compras: 3, total: 185.90, ultimaCompra: '2023-05-20' },
      { nombre: 'Pedro Sánchez', compras: 7, total: 510.60, ultimaCompra: '2023-06-02' }
    ]
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderReportContent = () => {
    switch(reportType) {
      case 'ventas':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-blue-600" />
                Tendencia de Ventas Diarias
              </h3>
              <div className="h-64 bg-gray-50 rounded flex items-center justify-center border border-gray-200">
                <p className="text-gray-500">Gráfico de ventas por día</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (Bs.)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.ventas.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.fecha).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.cantidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'inventario':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                Distribución de Productos por Categoría
              </h3>
              <div className="h-64 bg-gray-50 rounded flex items-center justify-center border border-gray-200">
                <p className="text-gray-500">Gráfico circular por categorías</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendidos (30 días)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.inventario.map((item, index) => (
                    <tr key={index} className={item.stock === 0 ? 'bg-red-50' : item.stock < 20 ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.producto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.categoria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.stock} unidades
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.vendidos} unidades
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'clientes':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-blue-600" />
                Clientes con Mayor Frecuencia de Compra
              </h3>
              <div className="h-64 bg-gray-50 rounded flex items-center justify-center border border-gray-200">
                <p className="text-gray-500">Gráfico de barras de clientes</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compras</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Gastado (Bs.)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Compra</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.clientes.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.compras}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {item.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.ultimaCompra).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <NavBar />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 w-full bg-white">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            Reportes del Sistema
          </h1>
          <p className="text-gray-600">Visualiza reportes de tu farmacia</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="ventas">Ventas</option>
                <option value="inventario">Inventario</option>
                <option value="clientes">Clientes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
          </div>
        </div>

        {renderReportContent()}
      </main>

      <Footer />
    </div>
  );
}