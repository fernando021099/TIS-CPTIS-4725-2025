import { useState } from 'react';
import { Search, Download, Filter, ChevronDown, ChevronUp, Plus, Edit, Trash2, Package, Pill, Activity, Database } from 'lucide-react';
import { TopBar, NavBar, Footer, FarmaButton } from './Components';

// Datos de ejemplo para el inventario
const PRODUCTOS_EJEMPLO = [
  {
    id: 1,
    codigo: 'FAR-001',
    nombre: 'Paracetamol 500mg',
    categoria: 'Analgésico',
    stock: 150,
    precio: 5.20,
    proveedor: 'Farmacorp',
    vencimiento: '2024-12-15',
    estado: 'disponible'
  },
  {
    id: 2,
    codigo: 'FAR-002',
    nombre: 'Ibuprofeno 400mg',
    categoria: 'Antiinflamatorio',
    stock: 85,
    precio: 7.50,
    proveedor: 'Bago',
    vencimiento: '2025-03-20',
    estado: 'disponible'
  },
  {
    id: 3,
    codigo: 'FAR-003',
    nombre: 'Amoxicilina 500mg',
    categoria: 'Antibiótico',
    stock: 42,
    precio: 12.80,
    proveedor: 'Sigma',
    vencimiento: '2024-09-30',
    estado: 'disponible'
  },
  {
    id: 4,
    codigo: 'FAR-004',
    nombre: 'Omeprazol 20mg',
    categoria: 'Antiácido',
    stock: 0,
    precio: 8.90,
    proveedor: 'Farmacorp',
    vencimiento: '2025-01-10',
    estado: 'agotado'
  },
  {
    id: 5,
    codigo: 'FAR-005',
    nombre: 'Loratadina 10mg',
    categoria: 'Antihistamínico',
    stock: 63,
    precio: 6.40,
    proveedor: 'Bago',
    vencimiento: '2024-11-25',
    estado: 'disponible'
  }
];

const CATEGORIAS = ['Analgésico', 'Antiinflamatorio', 'Antibiótico', 'Antiácido', 'Antihistamínico', 'Antiséptico'];
const PROVEEDORES = ['Farmacorp', 'Bago', 'Sigma', 'Lafedar', 'Mega Labs'];
const ESTADOS = ['disponible', 'agotado', 'vencido'];

export default function Inventario() {
  const [productos, setProductos] = useState(PRODUCTOS_EJEMPLO);
  const [filters, setFilters] = useState({
    searchTerm: '',
    categoria: 'all',
    proveedor: 'all',
    estado: 'all',
    stockMin: '',
    stockMax: '',
    sortBy: 'nombre',
    sortOrder: 'asc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredProducts = productos.filter(producto => {
    return (
      (filters.searchTerm === '' || 
       producto.nombre.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
       producto.codigo.toLowerCase().includes(filters.searchTerm.toLowerCase())) &&
      (filters.categoria === 'all' || producto.categoria === filters.categoria) &&
      (filters.proveedor === 'all' || producto.proveedor === filters.proveedor) &&
      (filters.estado === 'all' || producto.estado === filters.estado) &&
      (filters.stockMin === '' || producto.stock >= parseInt(filters.stockMin)) &&
      (filters.stockMax === '' || producto.stock <= parseInt(filters.stockMax))
    );
  }).sort((a, b) => {
    const order = filters.sortOrder === 'asc' ? 1 : -1;
    
    if (a[filters.sortBy] < b[filters.sortBy]) return -1 * order;
    if (a[filters.sortBy] > b[filters.sortBy]) return 1 * order;
    return 0;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'disponible': 'bg-green-100 text-green-800',
      'agotado': 'bg-yellow-100 text-yellow-800',
      'vencido': 'bg-red-100 text-red-800'
    };
    
    const texts = {
      'disponible': 'Disponible',
      'agotado': 'Agotado',
      'vencido': 'Vencido'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {texts[status] || status}
      </span>
    );
  };

  const handleEditProduct = (producto) => {
    setCurrentProduct(producto);
    setShowModal(true);
  };

  const handleDeleteProduct = (id) => {
    setProductos(productos.filter(p => p.id !== id));
  };

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setShowModal(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newProduct = {
      id: currentProduct ? currentProduct.id : productos.length + 1,
      codigo: formData.get('codigo'),
      nombre: formData.get('nombre'),
      categoria: formData.get('categoria'),
      stock: parseInt(formData.get('stock')),
      precio: parseFloat(formData.get('precio')),
      proveedor: formData.get('proveedor'),
      vencimiento: formData.get('vencimiento'),
      estado: formData.get('estado')
    };

    if (currentProduct) {
      setProductos(productos.map(p => p.id === currentProduct.id ? newProduct : p));
    } else {
      setProductos([...productos, newProduct]);
    }

    setShowModal(false);
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      categoria: 'all',
      proveedor: 'all',
      estado: 'all',
      stockMin: '',
      stockMax: '',
      sortBy: 'nombre',
      sortOrder: 'asc'
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
            <Package className="h-6 w-6 mr-2 text-blue-600" />
            Gestión de Inventario
          </h1>
          <p className="text-gray-600">Administra los productos farmacéuticos en stock</p>
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
                placeholder="Buscar por nombre o código..."
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
                onClick={handleAddProduct}
                className="flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Producto
              </FarmaButton>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  name="categoria"
                  value={filters.categoria}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">Todas las categorías</option>
                  {CATEGORIAS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                <select
                  name="proveedor"
                  value={filters.proveedor}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">Todos los proveedores</option>
                  {PROVEEDORES.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
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
                  {ESTADOS.map(est => (
                    <option key={est} value={est}>{est.charAt(0).toUpperCase() + est.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
                  <input
                    type="number"
                    name="stockMin"
                    value={filters.stockMin}
                    onChange={handleFilterChange}
                    placeholder="Mínimo"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock máximo</label>
                  <input
                    type="number"
                    name="stockMax"
                    value={filters.stockMax}
                    onChange={handleFilterChange}
                    placeholder="Máximo"
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
                  <option value="nombre">Nombre</option>
                  <option value="codigo">Código</option>
                  <option value="stock">Stock</option>
                  <option value="precio">Precio</option>
                  <option value="vencimiento">Vencimiento</option>
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
                  <option value="asc">Ascendente</option>
                  <option value="desc">Descendente</option>
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
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Productos</h3>
                <p className="text-2xl font-bold text-blue-600">{productos.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Pill className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Disponibles</h3>
                <p className="text-2xl font-bold text-green-600">
                  {productos.filter(p => p.estado === 'disponible').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Por agotarse</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {productos.filter(p => p.stock < 50 && p.stock > 0).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Agotados</h3>
                <p className="text-2xl font-bold text-red-600">
                  {productos.filter(p => p.estado === 'agotado').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Mostrando {filteredProducts.length} de {productos.length} productos
          </p>
          <button
            onClick={() => window.print()}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <Download className="h-4 w-4 mr-1" />
            Exportar reporte
          </button>
        </div>

        {/* Tabla de productos */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No se encontraron productos con los filtros aplicados</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio (Bs.)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((producto) => (
                    <tr key={producto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600 font-medium">
                        {producto.codigo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {producto.nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {producto.categoria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className={`font-medium ${producto.stock < 20 ? 'text-yellow-600' : 'text-gray-900'}`}>
                          {producto.stock} unidades
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {producto.precio.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {producto.proveedor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(producto.vencimiento).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(producto.estado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => handleEditProduct(producto)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar producto"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(producto.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar producto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modal para agregar/editar producto */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-gray-200 w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {currentProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h3>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                  <input
                    type="text"
                    name="codigo"
                    defaultValue={currentProduct?.codigo || ''}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    defaultValue={currentProduct?.nombre || ''}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    name="categoria"
                    defaultValue={currentProduct?.categoria || ''}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    {CATEGORIAS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      name="stock"
                      defaultValue={currentProduct?.stock || ''}
                      required
                      min="0"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio (Bs.)</label>
                    <input
                      type="number"
                      name="precio"
                      step="0.01"
                      defaultValue={currentProduct?.precio || ''}
                      required
                      min="0"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                  <select
                    name="proveedor"
                    defaultValue={currentProduct?.proveedor || ''}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    {PROVEEDORES.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento</label>
                  <input
                    type="date"
                    name="vencimiento"
                    defaultValue={currentProduct?.vencimiento || ''}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    name="estado"
                    defaultValue={currentProduct?.estado || 'disponible'}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    {ESTADOS.map(est => (
                      <option key={est} value={est}>{est.charAt(0).toUpperCase() + est.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <FarmaButton 
                  type="outline" 
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </FarmaButton>
                <FarmaButton 
                  type="primary" 
                >
                  Guardar
                </FarmaButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}