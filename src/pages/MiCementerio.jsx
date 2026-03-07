import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Seccion from '../components/Seccion'
import { useAuth } from '../contexts/useAuth'
import * as reservasCementerioApi from '../api/reservasCementerioApi'
import toast from 'react-hot-toast'

/* Retornar pagina de mi cementerio */
export default function MiCementerio() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true) /* estado para cargar las reservas */
  const [reservas, setReservas] = useState([]) /* estado para las reservas */

/* funcion para cargar las reservas */
  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      try {
        const data = await reservasCementerioApi.listMisReservas()
        setReservas(data)
      } catch (err) {
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (user) cargar()
  }, [user])

/* Retornar el layout de la pagina de mi cementerio */
  return (
    <Layout title="MIS DIFUNTOS">
      <Seccion title="📜 Mis difuntos (reservas propias)">
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
                    <td className="p-2">${r.valor_total ?? (Number(r.valor_base || 0) + Number(r.valor_adicional || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-gray-500 text-xs mt-4">
          Si no ves tus reservas, verifica que el vendedor haya vinculado tu cuenta a tu cédula (cliente_user_id).
        </p>
      </Seccion>
    </Layout>
  )
}
