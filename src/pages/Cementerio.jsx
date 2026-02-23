import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Seccion from '../components/Seccion'
import * as clientesApi from '../api/clientesApi'
import * as lotesApi from '../api/lotesApi'
import * as reservasCementerioApi from '../api/reservasCementerioApi'
import { useReservasCementerioRealtime } from '../hooks/useReservasCementerioRealtime'
import { useAuth } from '../contexts/useAuth'
import toast from 'react-hot-toast'

const COSTO_CAMBIO_MANUAL = 1000000
/* funcion para retornar el layout del cementerio */
export default function Cementerio() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  /* funcion para retornar la cedula del cementerio */
  const cedulaParam = searchParams.get('cedula') || ''
  /* funcion para retornar el paso del cementerio */  
  const [paso, setPaso] = useState(1)
  const [respuestas, setRespuestas] = useState({})   
  const [cliente, setCliente] = useState(null)
  const [cedula, setCedula] = useState(cedulaParam)
  const [lotes, setLotes] = useState([])
  const [loteAsignado, setLoteAsignado] = useState(null)
  const [loteSeleccionado, setLoteSeleccionado] = useState(null)
  const [cambioManual, setCambioManual] = useState(false)
  const [reservaTipo, setReservaTipo] = useState('') // reservado_sin_difunto | reservado_con_difunto
  const [nombreDifunto, setNombreDifunto] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [nombreCondenado, setNombreCondenado] = useState('')
  const [tarjetaNumero, setTarjetaNumero] = useState('')
  const [tarjetaVencimiento, setTarjetaVencimiento] = useState('')
  const [tarjetaCVV, setTarjetaCVV] = useState('')
  const [loading, setLoading] = useState(false)

  /* funcion para retornar las preguntas del cementerio */
  const preguntas = [
    { id: 'pecado', texto: '¿Qué pecado representa mejor el alma?', opciones: ['Lujuria', 'Gula', 'Avaricia', 'Pereza', 'Ira', 'Envidia', 'Soberbia', 'Inocente'] },
    { id: 'presupuesto', texto: 'Rango de presupuesto', opciones: ['Bajo (hasta 500)', 'Medio (500-1000)', 'Alto (1000+)'] }
  ]
  /* funcion para cargar los lotes del cementerio */
  useEffect(() => {
    cargarLotes()
  }, [])
  /* funcion para buscar el cliente por cedula */
  useEffect(() => {
    if (cedulaParam) {
      setCedula(cedulaParam)
      buscarCliente(cedulaParam)
    }
  }, [cedulaParam])
  /* funcion para cargar los lotes del cementerio */
  const cargarLotes = async () => {
    const data = await lotesApi.listLotes()
    setLotes(data)
  }
  /* funcion para buscar el cliente por cedula */
  const buscarCliente = async (ced) => {
    if (!ced?.trim()) return
    try {
      const { data, notFound } = await clientesApi.getClienteByCedula(ced)
      if (notFound) {
        setCliente(null)
        toast('Cliente no encontrado. Regístralo primero.')
        return
      }
      setCliente(data)
      toast.success('Cliente encontrado')
    } catch (err) {
      toast.error(err.message)
    }
  }
  /* funcion para asignar el lote al cliente */
  const asignarLote = () => {
    const pecado = respuestas.pecado?.toLowerCase() || 'ira'
    const mapaPecado = {
      lujuria: 'LUJURIA', gula: 'GULA', avaricia: 'AVARICIA', pereza: 'PEREZA',
      ira: 'IRA', envidia: 'ENVIDIA', soberbia: 'SOBERBIA', inocente: 'ALMAS INOCENTES'
    }
    const nombreBuscado = mapaPecado[pecado] || 'IRA'
    const disponibles = lotes.filter((l) => l.nombre === nombreBuscado && l.capacidad_ocupada < l.capacidad_total)
    if (disponibles.length === 0) {
      const cualquiera = lotes.find((l) => l.capacidad_ocupada < l.capacidad_total)
      setLoteAsignado(cualquiera || null)
    } else {
      setLoteAsignado(disponibles[0])
    }
  }
  /* funcion para calcular el valor total de la reserva */
  const valorTotal = () => {
    if (!loteSeleccionado && !loteAsignado) return 0
    const lote = loteSeleccionado || loteAsignado
    let v = Number(lote.valor)
    if (cambioManual) v += COSTO_CAMBIO_MANUAL
    return v
  }
  /* funcion para confirmar la reserva */
  const confirmarReserva = async () => {
    if (!cliente) {
      toast.error('Busca y valida el cliente primero')
      return
    }
    const lote = loteSeleccionado || loteAsignado
    if (!lote) {
      toast.error('Asigna o selecciona un lote')
      return
    }
    if (!reservaTipo) {
      toast.error('Indica si es con difunto o sin difunto')
      return
    }
    if (reservaTipo === 'reservado_con_difunto' && !nombreDifunto?.trim()) {
      toast.error('Indica el nombre del difunto')
      return
    }
    if (!metodoPago) {
      toast.error('Selecciona método de pago')
      return
    }
    if (metodoPago === 'con_la_vida' && !nombreCondenado?.trim()) {
      toast.error('Con pago "con la vida" debes indicar el nombre del condenado')
      return
    }
    if (metodoPago === 'tarjeta') {
      const num = tarjetaNumero.replace(/\s/g, '')
      if (num.length < 16) {
        toast.error('Número de tarjeta debe tener 16 dígitos')
        return
      }
      if (!tarjetaVencimiento.trim()) {
        toast.error('Indica fecha de vencimiento (MM/AA)')
        return
      }
      if (tarjetaCVV.length < 3) {
        toast.error('Indica el CVV (3 o 4 dígitos)')
        return
      }
    }
    /* funcion para confirmar la reserva */
    setLoading(true)
    try {
      if (metodoPago === 'tarjeta') {
        toast.loading('Procesando pago con tarjeta...', { id: 'tarjeta' })
        await new Promise((r) => setTimeout(r, 1500))
        toast.dismiss('tarjeta')
      }
      /* funcion para crear la reserva */
      await reservasCementerioApi.createReserva({
        cliente_id: cliente.id,
        lote_id: lote.id,
        user_id: user.id,
        estado: reservaTipo,
        nombre_difunto: reservaTipo === 'reservado_con_difunto' ? nombreDifunto.trim() : null,
        cambio_manual: cambioManual,
        metodo_pago: metodoPago,
        nombre_condenado: metodoPago === 'con_la_vida' ? nombreCondenado.trim() : null,
        valor_base: lote.valor,
        valor_adicional: cambioManual ? COSTO_CAMBIO_MANUAL : 0,
        valor_total: valorTotal(),
        estado_pago: 'confirmado'
      })
      /* funcion para actualizar el estado del cliente */
      await clientesApi.updateCliente(cliente.id, { estado: 'verdugo' })
      toast.success('⸸ Reserva confirmada. Pago recibido. ⸸')
      setPaso(1)
      setLoteAsignado(null)
      setLoteSeleccionado(null)
      setRespuestas({})
      setReservaTipo('')
      setNombreDifunto('')
      setMetodoPago('')
      setNombreCondenado('')
      setTarjetaNumero('')
      setTarjetaVencimiento('')
      setTarjetaCVV('')
      setCambioManual(false)
      cargarLotes()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }
  /* funcion para retornar el layout del cementerio */
  return (
    <Layout title="CEMENTERIO">
      <Seccion title="♰ Cementerio - Lotes por pecado ♰">
        <p className="text-white/90 mb-6">Responde las preguntas para que el sistema asigne tu lote. Puedes cambiarlo manualmente (+$1.000.000).</p>

        <div className="max-w-md mx-auto mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cédula del cliente"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="flex-1 bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white"
            />
            /* funcion para buscar el cliente por cedula */
            <button type="button" onClick={() => buscarCliente(cedula)} className="rounded-full px-6 py-2 bg-red-900/80 hover:bg-red-800 text-white font-bold">
              BUSCAR
            </button>
          </div>
          {cliente && <p className="mt-2 text-green-400 text-sm">Cliente: {cliente.nombre_completo}</p>}
        </div>

        {paso === 1 && (
          <div className="max-w-lg mx-auto space-y-4">
            {preguntas.map((p) => (
              <div key={p.id}>
                <label className="block text-red-400 mb-2">{p.texto}</label>
                <div className="flex flex-wrap gap-2">
                  {p.opciones.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setRespuestas({ ...respuestas, [p.id]: o })}
                      className={`rounded-full px-4 py-2 text-sm ${respuestas[p.id] === o ? 'bg-red-900 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            /* funcion para asignar el lote al cliente */
            <button
              onClick={() => { asignarLote(); setPaso(2) }}
              className="rounded-full px-8 py-3 bg-red-900/80 hover:bg-red-800 text-white font-bold"
            >
              ASIGNAR LOTE
            </button>
          </div>
        )}
        /* funcion para retornar el paso 2 del cementerio */
        {paso === 2 && (
          <div className="space-y-6">
            /* funcion para retornar el lote asignado */
            {loteAsignado && (
              <div className="p-4 rounded-xl border-2 border-red-900/60 bg-black/60 max-w-md mx-auto">
                <p className="text-red-400 font-bold">Lote asignado: {loteAsignado.nombre}</p>
                <p className="text-white/80">Código: {loteAsignado.codigo}</p>
                <p className="text-white/80">Disponibles: {loteAsignado.capacidad_total - loteAsignado.capacidad_ocupada}</p>
                <p className="text-red-400 font-bold">Valor: ${loteAsignado.valor}</p>
                /* funcion para cambiar el lote manualmente */
                <button
                  onClick={() => setCambioManual(true)}
                  className="mt-2 text-amber-400 hover:underline text-sm"
                >
                  Cambiar lote manualmente (+$1.000.000)
                </button>
              </div>
            )}
            /* funcion para retornar el cambio manual del lote */
            {cambioManual && (
              <div className="max-w-lg mx-auto">
                <p className="text-amber-400 mb-2">Selecciona otro lote:</p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {lotes.filter((l) => l.capacidad_ocupada < l.capacidad_total).map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLoteSeleccionado(loteSeleccionado?.id === l.id ? null : l)}
                      className={`p-2 rounded border text-left text-sm ${loteSeleccionado?.id === l.id ? 'border-red-500 bg-red-900/30' : 'border-gray-600'}`}
                    >
                      {l.nombre} - ${l.valor} (disp: {l.capacidad_total - l.capacidad_ocupada})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="max-w-md mx-auto">
              <p className="text-red-400 font-bold mb-2">¿Cómo queda la reserva?</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="reserva" value="reservado_sin_difunto" checked={reservaTipo === 'reservado_sin_difunto'} onChange={(e) => setReservaTipo(e.target.value)} />
                  <span>Sin difunto</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="reserva" value="reservado_con_difunto" checked={reservaTipo === 'reservado_con_difunto'} onChange={(e) => setReservaTipo(e.target.value)} />
                  <span>Con difunto</span>
                </label>
              </div>
              /* funcion para retornar el nombre del difunto */
              {reservaTipo === 'reservado_con_difunto' && (
                <input
                  type="text"
                  placeholder="Nombre del difunto"
                  value={nombreDifunto}
                  onChange={(e) => setNombreDifunto(e.target.value)}
                  className="w-full mt-2 bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white"
                />
              )}
            </div>
            /* funcion para retornar el valor a pagar */
            <div className="max-w-md mx-auto">
              <p className="text-red-400 font-bold">Valor a pagar: $<span>{valorTotal()}</span></p>
              <p className="text-white/90 mb-2">Método de pago</p>
              <div className="flex flex-wrap gap-4 mb-4">
                {['efectivo', 'tarjeta', 'con_la_vida'].map((m) => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="metodo" value={m} checked={metodoPago === m} onChange={() => setMetodoPago(m)} />
                    <span>{m === 'con_la_vida' ? '☠️ Con la vida' : m === 'tarjeta' ? '💳 Tarjeta' : '💵 Efectivo'}</span>
                  </label>
                ))}
              </div>
              {metodoPago === 'con_la_vida' && (
                <input
                  type="text"
                  placeholder="Nombre del condenado"
                  value={nombreCondenado}
                  onChange={(e) => setNombreCondenado(e.target.value)}
                  className="w-full mb-4 bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white"
                />
              )}
              {metodoPago === 'tarjeta' && (
                <div className="space-y-3 p-4 mb-4 rounded-lg bg-[#1a1a1a]/80 border border-red-900/30">
                  <p className="text-gray-400 text-sm">Simulación de pago con tarjeta</p>
                  <input
                    type="text"
                    placeholder="Número de tarjeta (16 dígitos)"
                    value={tarjetaNumero}
                    onChange={(e) => setTarjetaNumero(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    maxLength={19}
                    className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="MM/AA"
                      value={tarjetaVencimiento}
                      onChange={(e) => setTarjetaVencimiento(e.target.value)}
                      className="flex-1 bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      value={tarjetaCVV}
                      onChange={(e) => setTarjetaCVV(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      className="w-24 bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setPaso(1)} className="rounded-full py-2 px-6 border border-red-600 text-red-400">Atrás</button>
                <button onClick={confirmarReserva} disabled={loading} className="flex-1 rounded-full py-2 bg-green-900/80 hover:bg-green-800 text-white font-bold disabled:opacity-50">
                  SELLAR DESTINO
                </button>
              </div>
            </div>
          </div>
        )}
      </Seccion>

      <ReservasCementerio clienteId={cliente?.id} />
    </Layout>
  )
}

const COSTO_AGREGAR_DIFUNTO = 10
/* funcion para retornar las reservas del cementerio */
function ReservasCementerio() {
  const { reservas, loading } = useReservasCementerioRealtime()

  /* funcion para pasar a ocupado */
  const pasarAOcupado = async (r, nombre) => {
    if (!nombre?.trim()) {
      toast.error('Indica el nombre del difunto')
      return
    }
    /* funcion para actualizar la reserva */
    try {
      await reservasCementerioApi.updateReserva(r.id, {
        estado: 'ocupado',
        nombre_difunto: nombre.trim(),
        valor_adicional: (r.valor_adicional || 0) + COSTO_AGREGAR_DIFUNTO
      })
      toast.success(`Pasado a ocupado. Cargo adicional: $${COSTO_AGREGAR_DIFUNTO}`)
      /* funcion para mostrar el mensaje de éxito */
    } catch (err) {
      toast.error(err.message)
    }
  }
  /* funcion para retornar las reservas sin difunto */
  const sinDifunto = reservas.filter((r) => r.estado === 'reservado_sin_difunto')
  return (
    <>
      /* funcion para retornar las reservas sin difunto */
      {sinDifunto.length > 0 && (
        <Seccion title="📋 Reservas sin difunto - Pasar a ocupado (+$10)">
          {sinDifunto.map((r) => (
            <PasarAOcupadoRow key={r.id} reserva={r} onConfirm={pasarAOcupado} />
          ))}
        </Seccion>
      )}
      <Seccion title="📋 Reservas confirmadas">
        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : reservas.length === 0 ? (
          <p className="text-gray-400">Sin reservas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-red-400 border-b border-red-900/50">
                  <th className="p-2">Lote</th>
                  <th className="p-2">Estado</th>
                  <th className="p-2">Difunto</th>
                </tr>
              </thead>
              <tbody>
                /* funcion para retornar las reservas */
                {reservas.map((r) => (
                  <tr key={r.id} className="border-b border-red-900/30">
                    <td className="p-2">{r.lotes?.nombre || '-'}</td>
                    <td className="p-2">{r.estado}</td>
                    <td className="p-2">{r.nombre_difunto || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>
    </>
  )
}
/* funcion para retornar el layout de las reservas sin difunto */
function PasarAOcupadoRow({ reserva, onConfirm }) {
  /* funcion para retornar el nombre del difunto */
  const [nombre, setNombre] = useState('')
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded border border-amber-900/50 bg-amber-950/20 mb-2">
      <span className="text-white">{reserva.lotes?.nombre} - {reserva.estado}</span>
      <input
        type="text"
        placeholder="Nombre del difunto"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="flex-1 min-w-37.5 bg-[#1a1a1a] border border-red-900/50 rounded px-3 py-1 text-white text-sm"
      />
      <button onClick={() => onConfirm(reserva, nombre)} className="rounded px-4 py-1 bg-green-900/80 hover:bg-green-800 text-white text-sm font-bold">
        Pasar a ocupado (+$10)
      </button>
    </div>
  )
}
