import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [selectedGestion, setSelectedGestion] = useState('');
  
  // Datos de ejemplo para las áreas por gestión
  const areasPorGestion = {
    "2023": [
      { id: 1, nombre: "Matemáticas", ruta: "/areas/matematicas-2023" },
      { id: 2, nombre: "Ciencias", ruta: "/areas/ciencias-2023" },
      { id: 3, nombre: "Programación", ruta: "/areas/programacion-2023" }
    ],
    "2024": [
      { id: 1, nombre: "Matemáticas", ruta: "/areas/matematicas-2024" },
      { id: 2, nombre: "Ciencias", ruta: "/areas/ciencias-2024" },
      { id: 3, nombre: "Programación", ruta: "/areas/programacion-2024" },
      { id: 4, nombre: "Robótica", ruta: "/areas/robotica-2024" }
    ],
    "2025": [
      { id: 1, nombre: "Matemáticas", ruta: "/areas/matematicas-2025" },
      { id: 2, nombre: "Ciencias", ruta: "/areas/ciencias-2025" },
      { id: 3, nombre: "Inteligencia Artificial", ruta: "/areas/ia-2025" }
    ]
  };

  const handleGestionChange = (e) => {
    setSelectedGestion(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 flex flex-col items-center">
      {/* Mensaje de bienvenida */}
      <section className="max-w-3xl w-full bg-white shadow-md rounded-2xl p-8 text-center space-y-6 mb-12 border border-gray-200">
        <h1 className="text-4xl font-bold text-gray-800">
          Bienvenido al Sistema de Competencias
        </h1>
        <p className="text-lg text-gray-600">
          Este sistema permite gestionar eficientemente las áreas de competencia, participantes y evaluaciones.
        </p>
        
        {/* Selector de gestión */}
        <div className="max-w-md mx-auto">
          <label htmlFor="gestion" className="block mb-2 text-base font-semibold text-gray-700">
            Seleccione una gestión para ver las áreas disponibles
          </label>
          <select
            id="gestion"
            value={selectedGestion}
            onChange={handleGestionChange}
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow hover:bg-blue-700 transition duration-300 w-full"
          >
            <option value="">-- Seleccione una gestión --</option>
            <option value="2023">Olimpiada 2023</option>
            <option value="2024">Olimpiada 2024</option>
            <option value="2025">Olimpiada 2025</option>
          </select>
          <div className="text-sm mt-1 font-normal text-gray-600">(Olimpiada - Gestión)</div>
        </div>

        {/* Áreas correspondientes */}
        {selectedGestion && (
          <div className="mt-8 w-full">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Áreas disponibles - Olimpiada {selectedGestion}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areasPorGestion[selectedGestion].map((area) => (
                <Link
                  key={area.id}
                  to={area.ruta}
                  className="bg-white hover:bg-blue-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <h3 className="text-lg font-medium text-blue-600">{area.nombre}</h3>
                  <p className="text-sm text-gray-500 mt-1">Ver detalles</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Noticias e información */}
      <section className="max-w-5xl w-full space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Noticias</h2>
          <p className="text-gray-700">
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
        </div>

        <div className="bg-white shadow rounded-2xl p-6 space-y-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            OLIMPIADA CIENTÍFICA NACIONAL SAN SIMÓN 2025
          </h2>

          <div>
            <h3 className="text-lg font-semibold text-gray-800">Presentación</h3>
            <p className="text-gray-700">
              El Comité de la Olimpiada Científica Nacional San Simón O! SANSI, a través de la Facultad de Ciencias y Tecnología de la Universidad Mayor de San Simón, convoca a los estudiantes del Sistema de Educación Regular a participar en las Olimpiadas O! SANSI 2025.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800">Participantes</h3>
            <p className="text-gray-700">Estudiantes del Subsistema de Educación Regular del Estado Plurinacional de Bolivia; en las áreas de:</p>
            <ul className="list-disc list-inside text-gray-700">
              <li>Astronomía y Astrofísica – De tercero de primaria a 6to de secundaria</li>
              <li>Biología – De segundo de secundaria a sexto de secundaria</li>
              <li>Física – De cuarto a sexto de secundaria</li>
              <li>Informática – De quinto de primaria a sexto de secundaria</li>
              <li>Matemática – De primero a sexto de secundaria</li>
              <li>Química – De segundo a sexto de secundaria</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800">Requisitos</h3>
            <ul className="list-disc list-inside text-gray-700">
              <li>Ser estudiante de nivel primaria o secundaria en el sistema de Educación Regular del Estado Plurinacional de Bolivia.</li>
              <li>Registrar un tutor o profesor.</li>
              <li>Registrarse en el formulario de inscripción para el(las) área(s) que se postula.</li>
              <li>Cumplir los requisitos específicos de la categoría de competencia en la que se inscribe.</li>
              <li>Tener su documento de identificación personal vigente (cédula de identidad).</li>
              <li>Contar con correo electrónico personal o del tutor.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800">Inscripción</h3>
            <p className="text-gray-700">Las pre-inscripciones se realizarán del <strong>15 de abril al 4 de mayo</strong>.</p>
            <p className="text-gray-700">El costo de la inscripción por estudiante es de <strong>16 bolivianos (bs)</strong> por área y curso/categoría.</p>
            <p className="text-gray-700">El <strong>5 de mayo hasta el 12 de mayo</strong> se abrirá el proceso de pago en línea para finalizar la inscripción.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800">Fechas importantes</h3>
            <ul className="list-disc list-inside text-gray-700">
              <li><strong>Etapa Clasificatoria:</strong> 31 de Mayo – Presencial en el Campus de la UMSS.</li>
              <li><strong>Etapa Final:</strong> 11 de Julio – Presencial en el Campus de la UMSS.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800">Premios</h3>
            <p className="text-gray-700">
              Los resultados se publicarán el <strong>11 de Julio</strong> en{" "}
              <a href="http://ohsansi.umss.edu.bo/" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                la página web de O!SanSi
              </a>.
            </p>
            <p className="text-gray-700">La premiación se realizará el mismo día a horas 15:00.</p>
            <ul className="list-disc list-inside text-gray-700">
              <li>Los 5 primeros puestos nacionales recibirán diplomas de honor.</li>
              <li>Los 3 primeros puestos de cada nivel recibirán medallas de Oro, Plata y Bronce.</li>
              <li>Los profesores tutores de ganadores recibirán certificados.</li>
              <li>Los ganadores de medallas de 6to de secundaria tendrán ingreso libre a la Facultad de Ciencias y Tecnología.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;