import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import VideoBackground from './components/VideoBackground'
/* importacion de las paginas */
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Dashboard from './pages/Dashboard'
import ClienteNuevo from './pages/ClienteNuevo'
import ClienteEditar from './pages/ClienteEditar'
import Funeraria from './pages/Funeraria'
import Cementerio from './pages/Cementerio'
/* funcion para retornar el layout de la aplicacion */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(150,0,0,0.5)' } }} />
        <div className="min-h-screen relative">
          <VideoBackground />
          <div className="fixed inset-0 bg-black/40 -z-10 pointer-events-none" aria-hidden />
          <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          /* funcion para retornar el layout de la pagina de cliente nuevo */
          <Route
            path="/clientes/nuevo"
            element={
              <ProtectedRoute>
                <ClienteNuevo />
              </ProtectedRoute>
            }
          />
          /* funcion para retornar el layout de la pagina de cliente editar */
          <Route
            path="/clientes/editar/:id"
            element={
              <ProtectedRoute>
                <ClienteEditar />
              </ProtectedRoute>
            }
          />
          /* funcion para retornar la pagina de funeraria */
          <Route
            path="/funeraria"
            element={
              <ProtectedRoute>
                <Funeraria />
              </ProtectedRoute>
            }
          />
          /* funcion para retornar la pagina de cementerio */
          <Route
            path="/cementerio"
            element={
              <ProtectedRoute>
                <Cementerio />
              </ProtectedRoute>
            }
          />
          /* funcion para retornar la pagina de inicio */
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
