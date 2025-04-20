import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Info } from "lucide-react";

export default function HomePage() {
  const [gestiones, setGestiones] = useState([]);
  const [selectedGestion, setSelectedGestion] = useState("");
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState({
    gestiones: true,
    areas: false
  });
  const [error, setError] = useState(null);

  // Obtener gestiones al cargar el componente
  useEffect(() => {
    const fetchGestiones = async () => {
      try {
        setLoading(prev => ({ ...prev, gestiones: true }));
        setError(null);
        
        const { data, error: supabaseError } = await supabase
          .from('gestion')
          .select('id, nombre, fecha_inicio, fecha_fin')
          .order('fecha_inicio', { ascending: false });
        
        if (supabaseError) throw supabaseError;
        
        setGestiones(data);
        
        // Seleccionar automáticamente la última gestión
        if (data.length > 0) {
          setSelectedGestion(data[0].id);
        }
      } catch (err) {
        console.error("Error al cargar gestiones:", err);
        setError("No se pudieron cargar las gestiones. Intente nuevamente.");
      } finally {
        setLoading(prev => ({ ...prev, gestiones: false }));
      }
    };

    fetchGestiones();
  }, []);

  // Obtener áreas cuando cambia la gestión seleccionada
  useEffect(() => {
    if (!selectedGestion) return;

    const fetchAreas = async () => {
      try {
        setLoading(prev => ({ ...prev, areas: true }));
        setError(null);
        
        const { data, error: supabaseError } = await supabase
          .from('area_gestion')
          .select(`
            id,
            area:area_id (id, nombre, descripcion, costo, nivel, estado),
            gestion:gestion_id (id, nombre)
          `)
          .eq('gestion_id', selectedGestion)
          .eq('area.estado', 'ACTIVO')
          .order('area.nombre');
        
        if (supabaseError) throw supabaseError;
        
        setAreas(data);
      } catch (err) {
        console.error("Error al cargar áreas:", err);
        setError("No se pudieron cargar las áreas. Intente nuevamente.");
      } finally {
        setLoading(prev => ({ ...prev, areas: false }));
      }
    };

    fetchAreas();
  }, [selectedGestion]);

  const handleGestionChange = (e) => {
    setSelectedGestion(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Áreas de Competencia</h1>
        <p className="text-gray-600">
          Seleccione una gestión para ver las áreas disponibles
        </p>
      </div>

      {/* Selector de Gestión */}
      <div className="max-w-md mx-auto mb-8">
        <label className="block text-sm font-medium mb-2">
          Gestión Académica
        </label>
        {loading.gestiones ? (
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <select
            value={selectedGestion}
            onChange={handleGestionChange}
            className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione una gestión</option>
            {gestiones.map((gestion) => (
              <option key={gestion.id} value={gestion.id}>
                {gestion.nombre} ({new Date(gestion.fecha_inicio).getFullYear()})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="mb-8 p-4 bg-red-100 text-red-800 rounded-md flex items-start">
          <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Listado de Áreas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading.areas ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))
        ) : areas.length > 0 ? (
          areas.map(({ id, area }) => (
            <div key={id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <h3 className="text-xl font-bold">{area.nombre}</h3>
                <p className="text-sm text-gray-500 mb-2">Nivel: {area.nivel}</p>
                <p className="text-sm text-gray-600 mb-4">
                  {area.descripcion || "Descripción no disponible"}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {new Intl.NumberFormat('es-BO', {
                      style: 'currency',
                      currency: 'BOB'
                    }).format(area.costo)}
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Activo
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">
              No hay áreas disponibles para esta gestión
            </p>
          </div>
        )}
      </div>
    </div>
  );
}