import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Seccion from '../components/Seccion'
import { useAuth } from '../contexts/useAuth'
import * as solicitudesApi from '../api/solicitudesApi'
import toast from 'react-hot-toast'

export default function Inicio() {
  const [form, setForm] = useState({ nombre: '', cedula: '', telefono: '', correo: '', mensaje: '' })
  const [enviando, setEnviando] = useState(false)
  const [modalServicio, setModalServicio] = useState(null)
  const navigate = useNavigate()
  const { user, isVendedor, isCliente } = useAuth()
  const puedeVender = isVendedor

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre?.trim() || !form.cedula?.trim() || !form.correo?.trim() || !form.mensaje?.trim()) {
      toast.error('⛧ Completa nombre, cédula, correo y mensaje')
      return
    }
    setEnviando(true)
    try {
      await solicitudesApi.insertarSolicitud(form)
      toast.success('⸸ Mensaje enviado a las sombras... Te contactaremos pronto ⸸')
      setForm({ nombre: '', cedula: '', telefono: '', correo: '', mensaje: '' })
    } catch (err) {
      toast.error(err.message || 'Error al enviar. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }
  /* Retornar el layout de la pagina de inicio */
  return (
    <Layout title="TEMPLO FÚNEBRE YOMI NO HANA" >     
    <div className="w-full border-t border-red-900/60 mt-2">
    <div className="max-w-7xl mx-auto px-6 py-2">      
      </div>
    </div>
           
      <div className="relative" > 
        <div className="absolute inset-0 bg-linear-to-b from-red-950/10 to-transparent pointer-events-none" />
        
        <Seccion title="☠️ BIENVENIDOS">
          <p className="text-white/90 leading-relaxed max-w-2xl mx-auto text-center text-xl">
            En este santuario prohibido, donde el aire aún conserva el eco de lamentos antiguos.
            Aquí, las fronteras entre los vivos y los muertos se debilitan y cada visitante deja atrás la luz
            para caminar entre los ecos del Yomi.
          </p>
          <p className="text-white font-semibold text text-2xl">"⛧ Toda alma puede ser liberada… por un precio. ⚰️"</p>
        </Seccion>
        <Seccion title="🩸 MISIÓN">
          <p className="text-white/90 leading-relaxed max-w-2xl mx-auto text-xl">
            Nuestra misión es retener aquello que se niega a descansar. Sellamos almas fracturadas,
            condenamos recuerdos y evitamos que los muertos regresen reclamando lo que perdieron.
            No ofrecemos paz. Ofrecemos encierro eterno.
          </p>
        </Seccion>
        <Seccion title="🕯️ SERVICIOS">
          <p className="text-white/90 mb-6 text-xl">Elige tu destino en el umbral:</p>
          <div className="flex flex-wrap justify-center gap-6">
            <button
              type="button"
              onClick={() => setModalServicio('funeraria')}
              className="rounded-full px-8 py-4 border-2 border-purple-600 bg-purple-900/30 text-white font-bold hover:bg-purple-800/50 hover:shadow-[0_0_20px_white] transition-all"
            >
              ♰ FUNERARIA ♰
            </button>
            <button
              type="button"
              onClick={() => setModalServicio('cementerio')}
              className="rounded-full px-8 py-4 border-2 border-purple-600 bg-purple-900/30 text-white font-bold hover:bg-purple-800/50 hover:shadow-[0_0_20px_white] transition-all"
            >
              ♰ CEMENTERIO ♰
            </button>
          </div>
        </Seccion>
        
        {modalServicio === 'funeraria' && (/*Modal de la funeraria*/
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setModalServicio(null)}>
            <div className="max-w-lg w-full p-6 rounded-2xl border-4 border-red-900/60 bg-black/95 shadow-[0_0_30px_rgba(255,0,0,0.3)]" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl text-red-400 font-bold mb-4 text-center">♰ SERVICIOS FÚNEBRES ♰</h3>
              <p className="text-white/90 mb-4 text-center">
                ⚚ Rituales, ofrendas y sombras actúan como intermediarios entre este mundo y el otro.
                Cada servicio existe para dar forma a un destino que ya fue elegido en silencio 🔮 .
              </p>
              <ul className="text-white/90 space-y-2 mb-6">
                <li><span className="text-red-400 font-bold ">Rituales</span> ($100.000) — Invocación, liberación espiritual y pactos sellados con fuego carmesí.</li>
                <li><span className="text-red-400 font-bold">Ofrendas</span> ($500.000) — Sangre, pétalos malditos, monedas del inframundo y reliquias de almas perdidas.</li>
                <li><span className="text-red-400 font-bold">Sombras</span> ($1.000.000) — Guías espectrales, vigilantes nocturnos y protectores de tumbas antiguas.</li>
              </ul>
              <p className="text-gray-400 text-sm mb-4">Máximo 3 servicios por cliente por día. Horarios: 00:00 o 03:00.</p>
              <div className="flex flex-col gap-3">
                {puedeVender ? (
                  <div className="flex gap-3">
                    <button onClick={() => navigate('/funeraria')} className="flex-1 rounded-full py-2 bg-red-900/80 hover:bg-red-800 text-white font-bold">
                      IR A FUNERARIA
                    </button>
                    <button onClick={() => setModalServicio(null)} className="rounded-full py-2 px-6 border border-red-600 text-red-400 hover:bg-red-900/30">
                      Cerrar
                    </button>
                  </div>
                ) : isCliente ? (
                  <div className="space-y-3">
                    <p className="text-amber-200/90 text-center text-sm">Los clientes no realizan ventas. Ve a <strong>Mis Difuntos</strong> para ver tus servicios y reservas.</p>
                    <div className="flex gap-3">
                      <Link to="/mi-cementerio" onClick={() => setModalServicio(null)} className="flex-1 rounded-full py-2 bg-red-900/80 hover:bg-red-800 text-white font-bold text-center">
                        IR A MIS DIFUNTOS
                      </Link>
                      <button onClick={() => setModalServicio(null)} className="rounded-full py-2 px-6 border border-red-600 text-red-400 hover:bg-red-900/30">
                        Cerrar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-amber-200/90 text-center text-sm">Inicia sesión como vendedor o admin para acceder a Funeraria y Cementerio.</p>
                    <div className="flex gap-3">
                      <Link to="/login" onClick={() => setModalServicio(null)} className="flex-1 rounded-full py-2 bg-red-900/80 hover:bg-red-800 text-white font-bold text-center">
                        INICIAR SESIÓN
                      </Link>
                      <button onClick={() => setModalServicio(null)} className="rounded-full py-2 px-6 border border-red-600 text-red-400 hover:bg-red-900/30">
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {modalServicio === 'cementerio' && (/*modal del cementerio*/
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setModalServicio(null)}>
            <div className="max-w-lg w-full p-6 rounded-2xl border-4 border-red-900/60 bg-black/95 shadow-[0_0_30px_rgba(255,0,0,0.3)]" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl text-red-400 font-bold mb-4 text-center">♰ CEMENTERIO ♰</h3>
              <p className="text-white/90 mb-4 text-center">
                🪦 Un recinto dividido en zonas que representan la naturaleza y destino de cada espíritu.
                Cada lote corresponde a un pecado o condición del alma 👹.
              </p>
              <ul className="text-white/90 space-y-1 mb-6 text-sm text-center">
                <li>• <span className="text-red-400">LUJURIA</span> • <span className="text-red-400">GULA</span> • <span className="text-red-400">AVARICIA</span> • <span className="text-red-400">PEREZA</span></li>
                <li>• <span className="text-red-400">IRA</span> • <span className="text-red-400">ENVIDIA</span> • <span className="text-red-400">SOBERBIA</span></li>
                <li>• <span className="text-red-400">ALMAS INOCENTES</span></li>
              </ul>
              <p className="text-gray-400 text-sm mb-4 text-center">Responde unas preguntas y el sistema te asignará el lote. Puedes cambiarlo manualmente (costo adicional).</p>
              <div className="flex flex-col gap-3">
                {puedeVender ? (
                  <div className="flex gap-3">
                    <button onClick={() => navigate('/cementerio')} className="flex-1 rounded-full py-2 bg-red-900/80 hover:bg-red-800 text-white font-bold">
                      IR A CEMENTERIO
                    </button>
                    <button onClick={() => setModalServicio(null)} className="rounded-full py-2 px-6 border border-red-600 text-red-400 hover:bg-red-900/30">
                      Cerrar
                    </button>
                  </div>
                ) : isCliente ? (
                  <div className="space-y-3">
                    <p className="text-amber-200/90 text-center text-sm">Los clientes no realizan ventas. Ve a <strong>Mis Difuntos</strong> para ver tus servicios y reservas.</p>
                    <div className="flex gap-3">
                      <Link to="/mi-cementerio" onClick={() => setModalServicio(null)} className="flex-1 rounded-full py-2 bg-red-900/80 hover:bg-red-800 text-white font-bold text-center">
                        IR A MIS DIFUNTOS
                      </Link>
                      <button onClick={() => setModalServicio(null)} className="rounded-full py-2 px-6 border border-red-600 text-red-400 hover:bg-red-900/30">
                        Cerrar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-amber-200/90 text-center text-sm">Inicia sesión como vendedor o admin para acceder a Funeraria y Cementerio.</p>
                    <div className="flex gap-3">
                      <Link to="/login" onClick={() => setModalServicio(null)} className="flex-1 rounded-full py-2 bg-red-900/80 hover:bg-red-800 text-white font-bold text-center">
                        INICIAR SESIÓN
                      </Link>
                      <button onClick={() => setModalServicio(null)} className="rounded-full py-2 px-6 border border-red-600 text-red-400 hover:bg-red-900/30">
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <Seccion title="🔥 CONTACTO">
          <p className="text-white/90 mb-4 text-xl">
            ♰ Si deseas pactar, realizar un ritual, invocar sombras o entregar un alma al abismo… ♰<br />
            💀 Contáctanos a través del portal oscuro 💀
          </p>
          <div className="text-white/90 mb-6 space-y-1 text-xl">
            <p>📍 Dirección: Camino al Valle Yomi #13, Sector Oscuro</p>
            <p>📞 Teléfono: +57 300 555 6661</p>
            <p>✉️ Correo: contactoinfernal@yominohana.com</p>
          </div>
          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col gap-4 text-left">
            <input
              type="text"
              name="nombre"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-3 text-white placeholder-gray-500"
              required
            />
            <input
              type="text"
              name="cedula"
              placeholder="Tu cédula"
              value={form.cedula}
              onChange={(e) => setForm({ ...form, cedula: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-3 text-white placeholder-gray-500"
              required
            />
            <input
              type="text"
              name="telefono"
              placeholder="Tu teléfono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-3 text-white placeholder-gray-500"
            />
            <input
              type="email"
              name="correo"
              placeholder="Tu correo"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-3 text-white placeholder-gray-500"
              required
            />
            <textarea
              name="mensaje"
              placeholder="Escribe tu petición..."
              value={form.mensaje}
              onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
              rows={4}
              className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 resize-none"
              required
            />
            <button
              type="submit"
              disabled={enviando}
              className="rounded-full px-8 py-3 bg-red-900/80 hover:bg-red-800 text-white font-bold border border-red-600 disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : 'ENVIAR'}
            </button>
          </form>
        </Seccion>
      </div>
    </Layout>
  )
}
