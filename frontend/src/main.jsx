import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import App from "./App";
import Login from "./pages/Login";
import Inventario from "./pages/Inventario";
import Ventas from "./pages/Ventas";
import Notificaciones from "./pages/Notificaciones";
import Reportes from "./pages/Reportes";

import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/inicio" replace />, // Redirige a Inicio como pantalla principal
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/inventario",
    element: <Inventario />,
  },
  {
    path: "/ventas",
    element: <Ventas />,
  },
  {
    path: "/notificaciones",
    element: <Notificaciones />,
  },
  {
    path: "/reportes",
    element: <Reportes />,
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />, // Ruta desconocida
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
