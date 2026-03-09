import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthProvider'
import VideoBackground from './components/VideoBackground'

/* importacion de las paginas */
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import Registro from './pages/Registro'
import RegistroCliente from './pages/RegistroCliente'
import Dashboard from './pages/Dashboard'
import ClienteNuevo from './pages/ClienteNuevo'
import ClienteEditar from './pages/ClienteEditar'
import Funeraria from './pages/Funeraria'
import Cementerio from './pages/Cementerio'
import MiCementerio from './pages/MiCementerio'
import Admin from './pages/Admin'
import { RoleRoute } from './components/RoleRoute'

/* Retornar el layout de la aplicacion */
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
          <Route
            path="/registro"
            element={
              <RoleRoute allow={[666]}>
                <Registro />
              </RoleRoute>
            }
          />{/* Retornar el layout de la pagina de registro de cliente */}
          <Route path="/registro-cliente" element={<RegistroCliente />} />
          <Route
            path="/dashboard"
            element={
              <RoleRoute allow={[2, 666]}>
                <Dashboard />
              </RoleRoute>
            }
          />
          {/* Layout de la pagina de cliente nuevo */}
          <Route
            path="/clientes/nuevo"
            element={
              <RoleRoute allow={[2, 666]}>
                <ClienteNuevo />
              </RoleRoute>
            }
          />
          {/* Layout de la pagina de cliente editar */}
          <Route
            path="/clientes/editar/:id"
            element={
              <RoleRoute allow={[2, 666]}>
                <ClienteEditar />
              </RoleRoute>
            }
          />
          {/* Retornar la pagina de funeraria */}
          <Route
            path="/funeraria"
            element={
              <RoleRoute allow={[2, 666]}>
                <Funeraria />
              </RoleRoute>
            }
          />
          {/* Retornar la pagina de cementerio */}
          <Route
            path="/cementerio"
            element={
              <RoleRoute allow={[2, 666]}>
                <Cementerio />
              </RoleRoute>
            }
          />
          <Route
            path="/mi-cementerio"
            element={
              <RoleRoute allow={[3]}>
                <MiCementerio />
              </RoleRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <RoleRoute allow={[666]}>
                <Admin />
              </RoleRoute>
            }
          />
          {/* Retornar la pagina de inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
