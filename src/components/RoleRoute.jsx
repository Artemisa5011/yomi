import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
/* Proteger las rutas por rol */
export function RoleRoute({ allow = [], children }) {
  const { user, loading, rol } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/90">
        <p className="text-red-500 text-xl animate-pulse">⸸ Cargando... ⸸</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allow.length > 0 && !allow.includes(rol)) {
    return <Navigate to="/" replace />
  }

  return children
}

