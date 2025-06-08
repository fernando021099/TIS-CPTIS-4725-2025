import React from "react";
// import React, { useState } from "react"; // Línea original comentada
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import App from "./App";
import HomePage from "./pages/HomePage";
import AreaRegistration from "./pages/AreaRegistration";
import AreaList from "./pages/AreaList";
import StudentRegistration from "./pages/StudentRegistration";
import StudentGroupRegistration from "./pages/StudentGroupRegistration";
import StudentsApprovedList from "./pages/StudentsApprovedList";
import EditArea from "./pages/EditArea";
import ComprobantePago from "./pages/ComprobantePago";
import AdminLogin from "./pages/AdminLogin";
import StudentDetail from "./pages/StudentDetail";
import ReportesVarios from "./pages/ReportesVarios";
import OlympiadVersionRegistration from "./pages/OlympiadVersionRegistration";

import "./index.css";

// Componente Main comentado - se usaba para el modal de ComprobantePago
// function Main() {
//   const [showComprobante, setShowComprobante] = useState(false);
//
//   const handleShowComprobante = () => {
//     console.log("handleShowComprobante llamado desde Main");
//     setShowComprobante(true);
//   };
//   const handleCloseComprobante = () => setShowComprobante(false);
//
//   return (
//     <>
//       <App onOpenComprobantePago={handleShowComprobante} />
//       {showComprobante && (
//         <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg relative">
//             <button
//               onClick={handleCloseComprobante}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//             >
//               X
//             </button>
//             <ComprobantePago onSuccess={handleCloseComprobante} />
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Antes era <Main />
    children: [
      { index: true, element: <HomePage /> },
      { path: "register", element: <AreaRegistration /> },
      { path: "areas", element: <AreaList /> },
      { path: "student-registration", element: <StudentRegistration /> },
      { path: "group-registration", element: <StudentGroupRegistration /> },
      { path: "student-applications", element: <StudentsApprovedList /> },
      { path: "student-detail/:ci", element: <StudentDetail /> },
      { path: "editar-area/:id", element: <EditArea /> },
      { path: "comprobante-pago", element: <ComprobantePago /> }, // Nueva ruta agregada
      { path: "admin", element: <AdminLogin /> },
      { path: "reportes", element: <ReportesVarios /> },
      { path: "olympiad-version", element: <OlympiadVersionRegistration /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);