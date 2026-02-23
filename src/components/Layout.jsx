import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

export default function Layout({ children, title = 'YOMI NO HANA' }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-50 border-b-4 border-red-900/60 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Yomi No Hana" className="h-20 w-20 object-contain mix-blend-screen" />
            <span className="text-xl font-bold text-red-400 hover:text-red-300">
              ⸸ {title} ⸸
              
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-white hover:text-red-400 transition-colors">INICIO</Link>
            <Link to="/funeraria" className="text-white hover:text-red-400 transition-colors">FUNERARIA</Link>
            <Link to="/cementerio" className="text-white hover:text-red-400 transition-colors">CEMENTERIO</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-red-400 transition-colors">DASHBOARD</Link>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 font-bold">
                  CERRAR SESIÓN
                </button>
              </>
            ) : (
              <Link to="/login" className="text-red-400 hover:text-red-300 font-bold">INICIAR SESIÓN</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t-4 border-red-900/60 mt-12 py-6 text-center text-gray-400 text-xl">
        <p> 👺 © 2026 – ♰ Templo Yomi No Hana 💀</p>
      </footer>
    </div>
  )
}
