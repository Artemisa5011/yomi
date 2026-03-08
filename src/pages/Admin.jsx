import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

/* Retornar el layout de la pagina de admin */
export default function Admin() {
  return (
    <Layout title="Admin">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-red-400">⸸ Panel de administración ⸸</h1>
        <p className="text-gray-300">
          Como administrador puedes gestionar vendedores y acceder a todas las funciones del sistema.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/registro"
            className="inline-block rounded-lg px-6 py-3 bg-red-900/80 hover:bg-red-800 text-white font-bold transition-colors"
          >
            Registrar vendedor
          </Link>
          <Link
            to="/dashboard"
            className="inline-block rounded-lg px-6 py-3 border border-red-900/60 hover:bg-red-900/30 text-white font-bold transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </Layout>
  )
}
