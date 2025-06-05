import { useState, useEffect } from "react";
import { api } from "../api/apiClient";
import { Info, ArrowLeft } from "lucide-react";

export default function HomePage() {
  const [gestiones, setGestiones] = useState([]);
  const [selectedGestion, setSelectedGestion] = useState("");
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState({
    gestiones: true,
    areas: false,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGestiones = async () => {
      try {
        setLoading((prev) => ({ ...prev, gestiones: true }));
        setError(null);

        const data = await api.get("/olimpiadas");

        const formattedGestiones = data
          .map((olimpiada) => ({
            id: olimpiada.version,
            nombre: olimpiada.nombre,
            fecha_inicio: olimpiada.fecha,
          }))
          .sort((a, b) => b.id - a.id);

        setGestiones(formattedGestiones);

        if (formattedGestiones.length > 0) {
          setSelectedGestion(""); // no seleccionar por defecto
        }
      } catch (err) {
        console.error("Error al cargar olimpiadas:", err);
        setError(`No se pudieron cargar las gestiones: ${err.message}`);
      } finally {
        setLoading((prev) => ({ ...prev, gestiones: false }));
      }
    };

    fetchGestiones();
  }, []);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setLoading((prev) => ({ ...prev, areas: true }));
        setError(null);

        const allAreasData = await api.get("/areas");

        const activeAreas = allAreasData
          .filter((area) => area.estado === "activo")
          .map((area) => ({
            id: area.id,
            area: {
              id: area.id,
              nombre: area.nombre,
              descripcion: area.descripcion,
              costo: area.costo,
              nivel: area.categoria,
              estado: area.estado,
            },
          }))
          .sort((a, b) => a.area.nombre.localeCompare(b.area.nombre));

        setAreas(activeAreas);
      } catch (err) {
        console.error("Error al cargar áreas:", err);
        setError(`No se pudieron cargar las áreas: ${err.message}`);
      } finally {
        setLoading((prev) => ({ ...prev, areas: false }));
      }
    };

    fetchAreas();
  }, []);

  const handleGestionChange = (e) => {
    setSelectedGestion(e.target.value);
  };

  const handleBack = () => {
    setSelectedGestion("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Selector de gestión (Movido arriba) */}
      <div className="max-w-md mx-auto mb-8">
        <h2 className="text-2xl font-bold mb-2">Olimpiada (Gestión)</h2>
        <p className="text-gray-600 mb-4">Seleccione una olimpiada</p>
        {loading.gestiones ? (
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <select
            value={selectedGestion}
            onChange={handleGestionChange}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="">Seleccione una olimpiada</option>
            {gestiones.map((gestion) => (
              <option key={gestion.id} value={gestion.id}>
                {gestion.nombre} ({gestion.id})
              </option>
            ))}
          </select>
        )}
      </div>

      {!selectedGestion ? (
        <>
          {/* Noticias y Presentación */}
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-2xl font-bold mb-4">Noticias</h2>
            <p className="mb-4">
              Descarga la convocatoria:{" "}
              <a
                href="https://ohsansi.umss.edu.bo/convocatoria_OhSansi.pdf"
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                AQUÍ
              </a>
            </p>

            <h2 className="text-xl font-bold mb-4">
              OLIMPIADA CIENTÍFICA NACIONAL SAN SIMÓN 2025
            </h2>

            <h3 className="text-lg font-semibold mt-4 mb-2">Presentación</h3>
            <p className="mb-4">
              El Comité de la Olimpiada Científica Nacional San Simón Oh! SANSI,
              a través de la Facultad de Ciencias y Tecnología de la UMSS,
              convoca a los estudiantes del Sistema de Educación Regular a
              participar en las Olimpiadas O! SANSI 2025.
            </p>

            <h3 className="text-lg font-semibold mb-2">Participantes</h3>
            <ul className="list-disc list-inside mb-4">
              <li>Astronomía y Astrofísica</li>
              <li>Biología</li>
              <li>Física</li>
              <li>Informática</li>
              <li>Matemática</li>
              <li>Química</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">Inscripción</h3>
            <p className="mb-2">
              Pre-inscripción del <strong>15 de abril al 4 de mayo</strong>.
            </p>
            <p className="mb-2">
              Pago en línea: <strong>5 al 12 de mayo</strong>.
            </p>
            <p className="mb-4">
              Costo por estudiante: <strong>15 Bs</strong> por área.
            </p>

            <h3 className="text-lg font-semibold mb-2">Fechas</h3>
            <ul className="list-disc list-inside mb-4">
              <li>Clasificatoria: 31 de mayo</li>
              <li>Final: 11 de julio</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">Premios</h3>
            <ul className="list-disc list-inside mb-4">
              <li>Diplomas, medallas y certificados</li>
              <li>Ingreso libre a la Facultad para ganadores</li>
            </ul>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Noticias
            </button>
            <h1 className="text-2xl font-bold">
              Áreas de la Gestión {selectedGestion}
            </h1>
          </div>
        </>
      )}

      {error && (
        <div className="mb-8 p-4 bg-red-100 text-red-800 rounded-md flex items-start">
          <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Listado de áreas */}
      {selectedGestion && (
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
              <div
                key={id}
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <h3 className="text-xl font-bold">{area.nombre}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Categoría: {area.nivel}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {area.descripcion || "Descripción no disponible"}
                  </p>
                  <div className="text-right text-sm font-medium">
                    Costo: {area.costo} Bs
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-600">
              No hay áreas disponibles para esta gestión.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
