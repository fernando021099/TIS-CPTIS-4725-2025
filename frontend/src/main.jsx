import React, { useState } from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import App from "./App"
import HomePage from "./pages/HomePage"
import AreaRegistration from "./pages/AreaRegistration"
import AreaList from "./pages/AreaList"
import StudentRegistration from "./pages/StudentRegistration"
import StudentGroupRegistration from "./pages/StudentGroupRegistration"
import StudentsApprovedList from "./pages/StudentsApprovedList"
import EditArea from "./pages/EditArea"
import ComprobantePago from "./pages/ComprobantePago" // Asegúrate de importar ComprobantePago
import "./index.css"

function Main() {
  const [showComprobante, setShowComprobante] = useState(false) // Estado para mostrar/ocultar el modal de ComprobantePago

  // Función para mostrar el modal de ComprobantePago
  const handleShowComprobante = () => {
    setShowComprobante(true)
  }

  // Función para cerrar el modal de ComprobantePago
  const handleCloseComprobante = () => {
    setShowComprobante(false)
  }

  return (
    <div>
      <App onOpenComprobantePago={handleShowComprobante} />

      {/* Mostrar el componente ComprobantePago cuando el estado showComprobante sea true */}
      {showComprobante && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
            <button
              onClick={handleCloseComprobante} // Cierra el modal
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              X
            </button>
            <ComprobantePago /> {/* Renderiza el componente ComprobantePago */}
          </div>
        </div>
      )}
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />, // Cambiar el enrutamiento para que use Main
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "register",
        element: <AreaRegistration />,
      },
      {
        path: "areas",
        element: <AreaList />,
      },
      {
        path: "student-registration",
        element: <StudentRegistration />,
      },
      {
        path: "group-registration",
        element: <StudentGroupRegistration />,
      },
      {
        path: "student-applications",
        element: <StudentsApprovedList />,
      },
      {
        path: "editar-area/:id", // Ruta dinámica para EditArea
        element: <EditArea />,
      },
      {
        path: "comprobante-pago", // Ruta para el formulario de ComprobantePago (opcional si se usa en una ruta directa)
        element: <ComprobantePago />,
      },
      // Redirección para cualquier ruta no definida
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
