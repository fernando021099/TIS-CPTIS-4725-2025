import { useState, useEffect } from "react";
// import { supabase } from "../supabaseClient"; // Comentado: No se usa Supabase
import { api } from '../api/apiClient'; // Importar apiClient
import { Info } from "lucide-react";

export default function HomePage() {
  const [gestiones, setGestiones] = useState([]); // Olimpiadas
  const [selectedGestion, setSelectedGestion] = useState(""); // selectedOlimpiadaVersion
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState({
    gestiones: true,
    areas: false
  });
  const [error, setError] = useState(null);

  // Obtener olimpiadas (gestiones) al cargar el componente
  useEffect(() => {
    const fetchGestiones = async () => {
      try {
        setLoading(prev => ({ ...prev, gestiones: true }));
        setError(null);
        
        // Llamada con apiClient
        const data = await api.get('/olimpiadas'); // Endpoint de olimpiadas
        
        // Supabase original (comentado)
        /*
        const { data, error: supabaseError } = await supabase
          .from('gestion')
          .select('id, nombre, fecha_inicio, fecha_fin')
          .order('fecha_inicio', { ascending: false });
        
        if (supabaseError) throw supabaseError;
        */

        // Mapear datos de la API (version, nombre, fecha, estado)
        const formattedGestiones = data.map(olimpiada => ({
          id: olimpiada.version, // Usar 'version' como 'id'
          nombre: olimpiada.nombre,
          fecha_inicio: olimpiada.fecha, // Usar 'fecha' como 'fecha_inicio'
          // fecha_fin no existe en la API, se puede omitir o calcular si es necesario
        })).sort((a, b) => b.id - a.id); // Ordenar por versión descendente (más reciente primero)
        
        setGestiones(formattedGestiones);
        
        // Seleccionar automáticamente la última gestión (mayor versión)
        if (formattedGestiones.length > 0) {
          setSelectedGestion(formattedGestiones[0].id); // Seleccionar por 'version'
        }
      } catch (err) {
        console.error("Error al cargar olimpiadas (gestiones) desde API:", err);
        setError(`No se pudieron cargar las gestiones: ${err.message}`);
      } finally {
        setLoading(prev => ({ ...prev, gestiones: false }));
      }
    };

    fetchGestiones();
  }, []);

  // Obtener áreas (por ahora, todas las activas, sin filtrar por gestión/olimpiada)
  useEffect(() => {
    // Originalmente dependía de selectedGestion, ahora no para áreas
    // if (!selectedGestion) return; 

    const fetchAreas = async () => {
      try {
        setLoading(prev => ({ ...prev, areas: true }));
        setError(null);

        // Llamada con apiClient para obtener todas las áreas
        const allAreasData = await api.get('/areas');
        
        // Supabase original (comentado)
        /*
        const { data, error: supabaseError } = await supabase
          .from('area_gestion')
          .select(`
            id,
            area:area_id (id, nombre, descripcion, costo, nivel, estado),
            gestion:gestion_id (id, nombre)
          `)
          .eq('gestion_id', selectedGestion)
          .eq('area.estado', 'ACTIVO') // Supabase usaba 'ACTIVO'
          .order('area.nombre');
        
        if (supabaseError) throw supabaseError;
        
        setAreas(data); // Supabase devolvía la estructura anidada
        */

        // Filtrar localmente las áreas activas y mapear a la estructura esperada
        const activeAreas = allAreasData
          .filter(area => area.estado === 'activo') // API usa 'activo'
          .map(area => ({
            // El componente espera una estructura anidada como la de Supabase
            id: area.id, // ID del registro (podría ser el mismo que area.id si no hay tabla intermedia)
            area: {
              id: area.id,
              nombre: area.nombre,
              descripcion: area.descripcion,
              costo: area.costo,
              nivel: area.categoria, // API usa 'categoria', componente espera 'nivel'
              estado: area.estado
            }
            // gestion no se incluye ya que no filtramos por ella
          }))
          .sort((a, b) => a.area.nombre.localeCompare(b.area.nombre)); // Ordenar por nombre

        setAreas(activeAreas);

      } catch (err) {
        console.error("Error al cargar áreas desde API:", err);
        setError(`No se pudieron cargar las áreas: ${err.message}`);
      } finally {
        setLoading(prev => ({ ...prev, areas: false }));
      }
    };

    fetchAreas();
    // Quitar selectedGestion de las dependencias ya que no se usa para filtrar áreas
  }, []); 

  const handleGestionChange = (e) => {
    setSelectedGestion(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto mb-12">
  <h2 className="text-2xl font-bold mb-4">Noticias</h2>
  <p className="mb-4">
    Formulario de pre-inscripción abierto: <a href="#" className="text-blue-600 underline">AQUÍ</a>
  </p>

  <h2 className="text-xl font-bold mb-4">OLIMPIADA CIENTÍFICA NACIONAL SAN SIMÓN 2025</h2>

  <h3 className="text-lg font-semibold mt-4 mb-2">Presentación</h3>
  <p className="mb-4">
    El Comité de la Olimpiadas Científica Nacional San Simón O! SANSI, a través de la Facultad de Ciencias y Tecnología de la Universidad Mayor de San Simón, convoca a los estudiantes del Sistema de Educación Regular a participar en las Olimpiadas O! SANSI 2025.
  </p>

  <h3 className="text-lg font-semibold mb-2">Participantes</h3>
  <p className="mb-2">Estudiantes del Subsistema de Educación Regular del Estado Plurinacional de Bolivia; en las áreas de:</p>
  <ul className="list-disc list-inside mb-4">
    <li>Astronomía y Astrofísica – De tercero de primaria a 6to de secundaria</li>
    <li>Biología – De segundo de secundaria a sexto de secundaria</li>
    <li>Física – De cuarto a sexto de secundaria</li>
    <li>Informática – De quinto de primaria a sexto de secundaria</li>
    <li>Matemática – De primero a sexto de secundaria</li>
    <li>Química – De segundo a sexto de secundaria</li>
  </ul>

  <h3 className="text-lg font-semibold mb-2">Requisitos</h3>
  <ul className="list-disc list-inside mb-4">
    <li>Ser estudiante de nivel primaria o secundaria en el sistema de Educación Regular del Estado Plurinacional de Bolivia.</li>
    <li>Registrar un tutor o profesor.</li>
    <li>Registrarse en el formulario de inscripción para el(las) área(s) que se postula.</li>
    <li>Cumplir los requisitos específicos de la categoría de competencia en la que se inscribe.</li>
    <li>Tener su documento de identificación personal vigente (cédula de identidad).</li>
    <li>Contar con correo electrónico personal o del tutor.</li>
  </ul>

  <h3 className="text-lg font-semibold mb-2">Inscripción</h3>
  <p className="mb-2">
    Las pre-inscripciones se realizarán del <strong>15 de abril al 4 de mayo</strong>.
  </p>
  <p className="mb-2">
    El costo de la inscripción por estudiante es de <strong>16 bolivianos (bs)</strong> por área y curso/categoría.
  </p>
  <p className="mb-4">
    El <strong>5 de mayo hasta el 12 de mayo</strong> se abrirá el proceso de pago en línea para finalizar la inscripción.
  </p>

  <h3 className="text-lg font-semibold mb-2">Fechas importantes</h3>
  <ul className="list-disc list-inside mb-4">
    <li><strong>Etapa Clasificatoria:</strong> 31 de Mayo – Presencial en el Campus de la UMSS.</li>
    <li><strong>Etapa Final:</strong> 11 de Julio – Presencial en el Campus de la UMSS.</li>
  </ul>

  <h3 className="text-lg font-semibold mb-2">Premios</h3>
  <p className="mb-2">
    Los resultados se publicarán el <strong>11 de Julio</strong> en <a href="http://ohsansi.umss.edu.bo/" className="text-blue-600 underline" target="_blank">la página web de O!SanSi</a>.
  </p>
  <p className="mb-2">
    La premiación se realizará el mismo día a horas 15:00.
  </p>
  <ul className="list-disc list-inside mb-4">
    <li>Los 5 primeros puestos nacionales recibirán diplomas de honor.</li>
    <li>Los 3 primeros puestos de cada nivel recibirán medallas de Oro, Plata y Bronce.</li>
    <li>Los profesores tutores de ganadores recibirán certificados.</li>
    <li>Los ganadores de medallas de 6to de secundaria tendrán ingreso libre a la Facultad de Ciencias y Tecnología.</li>
  </ul>
</div>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Áreas de Competencia</h1>
        <p className="text-gray-600">
          Seleccione una gestión para ver las áreas disponibles
        </p>
      </div>
      {/* Noticias y Presentación */}


      {/* Selector de Gestión (Olimpiada) */}
      <div className="max-w-md mx-auto mb-8">
        <label className="block text-sm font-medium mb-2">
          Olimpiada (Gestión) {/* Texto actualizado */}
        </label>
        {loading.gestiones ? (
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <select
            value={selectedGestion}
            onChange={handleGestionChange}
            className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione una olimpiada</option> {/* Texto actualizado */}
            {gestiones.map((gestion) => (
              <option key={gestion.id} value={gestion.id}>
                {gestion.nombre} ({gestion.id}) {/* Mostrar versión */}
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
                <p className="text-sm text-gray-500 mb-2">Categoría: {area.nivel}</p>
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
              No hay áreas activas disponibles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}