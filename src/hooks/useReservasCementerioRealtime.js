import { useState, useEffect } from 'react'
import * as api from '../api/reservasCementerioApi' /* importacion de las reservas del cementerio */

/* Retornar las reservas del cementerio */
function mergeById(list, item) { /* Mergear las reservas del cementerio */
  if (!item) return list
  if (item.estado_pago !== 'confirmado') return list.filter((r) => r.id !== item.id)
  const idx = list.findIndex((r) => r.id === item.id)
  const next = [...list]
  if (idx >= 0) next[idx] = { ...item, lotes: next[idx]?.lotes }
  else next.push(item)
  return next
}
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
    /* Suscribir reservas del cementerio */
    const unsub = api.subscribeReservasCementerioRealtime(
      (row) => setReservas((prev) => mergeById(prev, row)),
      (id) => setReservas((prev) => removeById(prev, id))
    )
    return () => {
      mounted = false
      unsub()
    }
  }, [])

  return { reservas, loading }
}
