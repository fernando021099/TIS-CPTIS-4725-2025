import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import App from './App'
import HomePage from './pages/HomePage'
import AreaRegistration from './pages/AreaRegistration'
import AreaList from './pages/AreaList'
import StudentRegistration from './pages/StudentRegistration'
import StudentGroupRegistration from './pages/StudentGroupRegistration'
import StudentsApprovedList from './pages/StudentsApprovedList'
import './index.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
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
      // Redirección para cualquier ruta no definida
      {
        path: "*",
        element: <Navigate to="/" replace />,
      }
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)