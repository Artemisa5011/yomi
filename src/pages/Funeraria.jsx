import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Seccion from '../components/Seccion'
import * as clientesApi from '../api/clientesApi'
import * as serviciosFunerariosApi from '../api/serviciosFunerariosApi'
import { useServiciosFunerariosRealtime } from '../hooks/useServiciosFunerariosRealtime'
import { useAuth } from '../contexts/useAuth'
import toast from 'react-hot-toast'

const SERVICIOS = [
  { tipo: 'ritual', nombre: 'Rituales', valor: 1000 },
  { tipo: 'ofrenda', nombre: 'Ofrendas', valor: 5000 },
  { tipo: 'sombra', nombre: 'Sombras', valor: 10000 }
]
  /* formato 24 horas */
const HORAS = [
  { valor: '00:00', label: '00:00' },
  { valor: '03:00', label: '03:00' }
]

export default function Funeraria() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const cedulaParam = searchParams.get('cedula') || ''

  const [cliente, setCliente] = useState(null)
  const [cedula, setCedula] = useState(cedulaParam)
  const [carrito, setCarrito] = useState([])
  const [nombreDifunto, setNombreDifunto] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [nombreCondenado, setNombreCondenado] = useState('')
  const [tarjetaNumero, setTarjetaNumero] = useState('')
  const [tarjetaVencimiento, setTarjetaVencimiento] = useState('')
  const [tarjetaCVV, setTarjetaCVV] = useState('')
  const [loading, setLoading] = useState(false)
  const [mostrarFormPago, setMostrarFormPago] = useState(false)

  useEffect(() => {
    if (cedulaParam) {
      setCedula(cedulaParam)
      buscarCliente(cedulaParam)
    }
  }, [cedulaParam])
  /* funcion para buscar cliente por cedula */
  const buscarCliente = async (ced) => {
    if (!ced?.trim()) return
    try {
      const { data, notFound } = await clientesApi.getClienteByCedula(ced)
      if (notFound) {
        setCliente(null)
        toast('Cliente no encontrado. Regístralo primero.')
        return
      }
      if (data.estado !== 'activo' && data.estado !== 'verdugo') {
        toast.error('El cliente no puede contratar servicios')
        return
      }
      setCliente(data)
      toast.success('Cliente encontrado')
    } catch (err) {
      toast.error(err.message)
    }
  }

  /* funcion para calcular el total del carrito */
  const totalCarrito = carrito.reduce((s, i) => s + i.valor * i.cantidad, 0)
  /* funcion para agregar servicios al carrito */
  const agregar = (s, cantidad = 1) => {
    const fechaUsar = fecha || new Date().toISOString().slice(0, 10)
    const yaEnDia = carrito.filter((c) => c.fecha === fechaUsar).reduce((a, c) => a + c.cantidad, 0)
    if (yaEnDia + cantidad > 3) {
      toast.error('☠️ Máximo 3 servicios por cliente por día')
      return
    }
    const idx = carrito.findIndex((c) => c.tipo === s.tipo && c.fecha === fechaUsar && c.hora === hora)
    if (idx >= 0) {
      const nuevo = [...carrito]
      nuevo[idx].cantidad += cantidad
      if (nuevo[idx].cantidad > 3) nuevo[idx].cantidad = 3
      setCarrito(nuevo)
    } else {
      setCarrito([...carrito, { ...s, cantidad, fecha: fechaUsar, hora: hora || '00:00' }])
    }
  }

  /* funcion para quitar servicios del carrito */
  const quitar = (idx) => {
    setCarrito(carrito.filter((_, i) => i !== idx))
  }

  /* funcion para confirmar el pago de los servicios */
  const confirmarPago = async () => {
    if (!cliente || carrito.length === 0 || !nombreDifunto?.trim()) {
      toast.error('Selecciona servicios, fecha, hora y nombre del difunto')
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
    const hoy = new Date().toISOString().slice(0, 10)
    if (carrito.some((c) => c.fecha < hoy)) {
      toast.error('La fecha no puede ser en el pasado')
      return
    }
    /* funcion para confirmar el pago de los servicios */
    setLoading(true)
    try {
      if (metodoPago === 'tarjeta') {
        toast.loading('Procesando pago con tarjeta...', { id: 'tarjeta' })
        await new Promise((r) => setTimeout(r, 1500))
        toast.dismiss('tarjeta')
      }
      /* funcion para crear los servicios funerarios */
      const rows = carrito.map((item) => ({
        cliente_id: cliente.id,
        user_id: user.id,
        tipo: item.tipo,
        nombre_difunto: nombreDifunto.trim(),
        hora: item.hora || '00:00',
        fecha: item.fecha,
        estado_pago: 'confirmado',
        metodo_pago: metodoPago,
        nombre_condenado: metodoPago === 'con_la_vida' ? nombreCondenado.trim() : null,
        valor: item.valor * item.cantidad,
        valor_total: totalCarrito
      }))
      /* funcion para crear los servicios funerarios */
      await serviciosFunerariosApi.createServiciosFunerarios(rows)    
      await clientesApi.updateCliente(cliente.id, { estado: 'verdugo' })      
      toast.success(`⸸ Pago recibido. Total: $${totalCarrito}. Alma condenada con éxito. Servicio programado. ⸸`)
      setCarrito([])
      setNombreDifunto('')
      setMetodoPago('')
      setNombreCondenado('')
      setTarjetaNumero('')
      setTarjetaVencimiento('')
      setTarjetaCVV('')
      setMostrarFormPago(false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* funcion para manejar el pacto */
  const handlePactar = () => {
    if (!cliente) {
      toast.error('Busca y valida el cliente primero')
      return
    }
    /* funcion para verificar si se ha agregado al menos un servicio */
    if (carrito.length === 0) {
      toast.error('Agrega al menos un servicio')
      return
    }
    /* funcion para verificar si se ha seleccionado fecha y hora */
    if (!fecha || !hora) {
      toast.error('Selecciona fecha y hora')
      return
    }
    /* funcion para verificar si se ha indicado el nombre del maldecido/difunto */
    if (!nombreDifunto?.trim()) {
      toast.error('Indica el nombre del maldecido/difunto')
      return
    }
    /* funcion para verificar si la fecha no es en el pasado */
    const hoy = new Date().toISOString().slice(0, 10)
    if (fecha < hoy) {
      toast.error('La fecha no puede ser en el pasado')
      return
    }
    /* funcion para mostrar el formulario de pago */
    setMostrarFormPago(true)
  }

  /* funcion para retornar el layout de la funeraria */
  return (  
    <Layout title="FUNERARIA">
        <Seccion title="♰ Servicios fúnebres ♰">        
        <p className="text-white/90 mb-6 ">
          Rituales, ofrendas y sombras. Máximo 3 servicios por cliente por día. Selecciona hora: 00:00 ó 03:00.
        </p>

        /* funcion para retornar el div de la funeraria */
        <div className="max-w-md mx-auto mb-6"> 
          /* funcion para retornar el input de la funeraria */
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cédula del cliente"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="flex-1 bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white"
            />
            <button
              type="button"
              onClick={() => buscarCliente(cedula)}
              className="rounded-full px-6 py-2 bg-red-900/80 hover:bg-red-800 text-white font-bold"
            >
              BUSCAR 
            </button>
          </div>
          {cliente && (
            <p className="mt-2 text-green-400 text-sm">Cliente: {cliente.nombre_completo} ({cliente.estado})</p>
          )}
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
            className="bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white" />
          <select value={hora} onChange={(e) => setHora(e.target.value)}
            className="bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white">
            <option value="">Hora</option>
            {HORAS.map((h) => (
              <option key={h.valor} value={h.valor}>{h.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {SERVICIOS.map((s) => (
            <div key={s.tipo} className="p-4 rounded-xl border-2 border-purple-600 bg-purple-900/20">
              <h3 className="text-red-400 font-bold mb-2">{s.nombre}</h3>
              <p className="text-white/80 mb-2">$ {s.valor}</p>
              <button
                onClick={() => agregar(s)}
                className="rounded-full px-4 py-2 bg-red-900/80 hover:bg-red-800 text-white text-sm font-bold"
              >
                CONTRATAR
              </button>
            </div>
          ))}
        </div>

        <div className="max-w-lg mx-auto mb-6">
          <label className="block text-red-400 mb-2">Nombre del maldecido / difunto</label>
          <input
            type="text"
            value={nombreDifunto}
            onChange={(e) => setNombreDifunto(e.target.value)}
            placeholder="Nombre completo"
            className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white"
          />
        </div>

        <div className="mb-6">
          <p className="text-white/90">Total: $<span className="text-red-400 font-bold">{totalCarrito}</span></p>
          {carrito.length > 0 && (
            <ul className="text-sm text-gray-400 mt-2">
              {carrito.map((c, i) => (
                <li key={i}>
                  {c.nombre} x{c.cantidad} - {c.fecha} {c.hora} - ${c.valor * c.cantidad}
                  <button onClick={() => quitar(i)} className="ml-2 text-red-400 hover:underline">Quitar</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {!mostrarFormPago ? (
          <button
            onClick={handlePactar}
            className="rounded-full px-8 py-3 bg-red-900/80 hover:bg-red-800 text-white font-bold"
          >
            PACTAR
          </button>
        ) : (
          <div className="max-w-md mx-auto space-y-4">
            <p className="text-red-400 font-bold">Método de pago</p>
            <div className="flex flex-wrap gap-4">
              {['efectivo', 'tarjeta', 'con_la_vida'].map((m) => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="metodo" value={m} checked={metodoPago === m} onChange={() => setMetodoPago(m)} />
                  <span className="text-white">{m === 'con_la_vida' ? '☠️ Con la vida' : m === 'tarjeta' ? '💳 Tarjeta' : '💵 Efectivo'}</span>
                </label>
              ))}
            </div>
            {metodoPago === 'con_la_vida' && (
              <input
                type="text"
                placeholder="Nombre del condenado"
                value={nombreCondenado}
                onChange={(e) => setNombreCondenado(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-red-900/50 rounded-lg px-4 py-2 text-white"
              />
            )}
            {metodoPago === 'tarjeta' && (
              <div className="space-y-3 p-4 rounded-lg bg-[#1a1a1a]/80 border border-red-900/30">
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
              <button
                onClick={confirmarPago}
                disabled={loading}
                className="flex-1 rounded-full py-2 bg-green-900/80 hover:bg-green-800 text-white font-bold disabled:opacity-50"
              >
                CONFIRMAR PAGO
              </button>
              <button onClick={() => setMostrarFormPago(false)} className="rounded-full py-2 px-4 border border-red-600 text-red-400">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </Seccion>

      <CalendarioFuneraria />
    </Layout>
  )
}
/* funcion para retornar el calendario de la funeraria */
function CalendarioFuneraria() {
  const { servicios, loading } = useServiciosFunerariosRealtime()

  return (
    <Seccion title="📅 Calendario (servicios confirmados)">
      {loading ? <p className="text-gray-400">Cargando...</p> : servicios.length === 0 ? (
        <p className="text-gray-400">Sin servicios programados</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-red-400 border-b border-red-900/50">
                <th className="p-2">Fecha</th>
                <th className="p-2">Hora</th>
                <th className="p-2">Tipo</th>
                <th className="p-2">Difunto</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.id} className="border-b border-red-900/30">
                  <td className="p-2">{s.fecha}</td> 
                  <td className="p-2">{s.hora}</td>
                  <td className="p-2">{s.tipo}</td>
                  <td className="p-2">{s.nombre_difunto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Seccion>
  )
}
