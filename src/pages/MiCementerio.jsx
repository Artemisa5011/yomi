import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Seccion from '../components/Seccion'
import { useAuth } from '../contexts/useAuth'
import * as reservasCementerioApi from '../api/reservasCementerioApi'
import * as serviciosFunerariosApi from '../api/serviciosFunerariosApi'
import toast from 'react-hot-toast'

/* Formato moneda */
const fmt = (n) => Number(n ?? 0).toLocaleString('es-CO')

/* Retornar pagina de mi cementerio */
export default function MiCementerio() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [reservas, setReservas] = useState([])
  const [servicios, setServicios] = useState([])

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      try {
        const [dataReservas, dataServicios] = await Promise.all([
          reservasCementerioApi.listMisReservas(),
          serviciosFunerariosApi.listMisServicios()
        ])
        setReservas(dataReservas)
        setServicios(dataServicios)
      } catch (err) {
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (user) cargar()
  }, [user])

  return (
    <Layout title="MIS DIFUNTOS">
      <Seccion title="🕯️ Mis servicios funerarios">
        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : servicios.length === 0 ? (
          <>
            <p className="text-gray-400">No tienes servicios funerarios vinculados a tu cuenta.</p>
            <p className="text-gray-500 text-xs mt-2">Tu cédula debe coincidir con la que usó el vendedor en Funeraria.</p>
          </>
        ) : (
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-red-400 border-b border-red-900/50">
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Fecha</th>
                  <th className="p-2">Hora</th>
                  <th className="p-2">Difunto</th>
                  <th className="p-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {servicios.map((s) => (
                  <tr key={s.id} className="border-b border-red-900/30">
                    <td className="p-2">{s.tipo}</td>
                    <td className="p-2">{s.fecha}</td>
                    <td className="p-2">{s.hora || '-'}</td>
                    <td className="p-2">{s.nombre_difunto || '-'}</td>
                    <td className="p-2">${fmt(s.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>
      <Seccion title="📜 Mis reservas de cementerio (lotes)">
        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : reservas.length === 0 ? (
          <p className="text-gray-400">Aún no tienes reservas vinculadas a tu cuenta.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-red-400 border-b border-red-900/50">
                  <th className="p-2">Estado</th>
                  <th className="p-2">Difunto</th>
                  <th className="p-2">Lote</th>
                  <th className="p-2">Resultado espiritual</th>
                  <th className="p-2">Pago</th>
                  <th className="p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id} className="border-b border-red-900/30">
                    <td className="p-2">{r.estado}</td>
                    <td className="p-2">{r.nombre_difunto || 'Sin difunto'}</td>
                    <td className="p-2">{r.lotes?.nombre} ({r.lotes?.codigo})</td>
                    <td className="p-2">{r.sombra_pecado || 'Sin juicio'}</td>
                    <td className="p-2">{r.metodo_pago} / {r.estado_pago}</td>
                    <td className="p-2">${fmt(r.valor_total ?? (Number(r.valor_base || 0) + Number(r.valor_adicional || 0)))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-gray-500 text-xs mt-4">
          Si no ves tus reservas o servicios, contacta al vendedor: tu cédula debe coincidir con la que usó al registrar la venta.
        </p>
      </Seccion>
    </Layout>
  )
}
