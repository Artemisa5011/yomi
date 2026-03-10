import { useState, useEffect } from 'react'
import * as api from '../api/reservasCementerioApi' /* importacion de las reservas del cementerio */

/* Remover reservas del cementerio */
function removeById(list, id) {
  return list.filter((r) => r.id !== id)
}
/* Retornar reservas del cementerio */
export function useReservasCementerioRealtime() {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  /* Cargar las reservas del cementerio */
  useEffect(() => {
    let mounted = true
    api.listReservasConfirmadas().then((data) => {
      if (mounted) {
        setReservas(data)
        setLoading(false)
      }
    }).catch(() => {
      if (mounted) setLoading(false) 
    })
    /* Suscribir reservas del cementerio. Realtime no incluye lotes, refetch para tener join */
    const unsub = api.subscribeReservasCementerioRealtime(
      async (row) => {
        const completa = await api.getReservaWithLote(row.id)
        const item = completa || row
        if (item.estado_pago !== 'confirmado') {
          setReservas((prev) => prev.filter((r) => r.id !== item.id))
          return
        }
        setReservas((prev) => {
          const idx = prev.findIndex((r) => r.id === item.id)
          const next = [...prev]
          if (idx >= 0) next[idx] = item
          else next.push(item)
          return next
        })
      },
      (id) => setReservas((prev) => removeById(prev, id))
    )
    return () => {
      mounted = false
      unsub()
    }
  }, [])

  return { reservas, loading }
}
