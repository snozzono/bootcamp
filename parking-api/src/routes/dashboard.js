const router = require('express').Router()
const supabase = require('../supabase')
const { auth, requireRole } = require('../middleware/auth')

// GET /dashboard
// KPIs en tiempo real para jefe de servicios generales
router.get('/', auth, requireRole('jefe_servicios_generales','jefe_seguridad','super_admin'), async (req, res) => {
  const [espacios, incidencias, usuarios, movimientos] = await Promise.all([
    supabase.from('estacionamientos').select('estado'),
    supabase.from('incidencias').select('estado').neq('estado', 'resuelta'),
    supabase.from('usuarios_enrolados').select('id').eq('activo', true),
    supabase.from('movimientos')
      .select('id, tipo, timestamp_evento, estacionamiento:estacionamiento_id(codigo), usuario:usuario_id(nombre, patente_asociada)')
      .order('timestamp_evento', { ascending: false })
      .limit(5)
  ])

  if (espacios.error) return res.status(500).json({ error: espacios.error.message })

  const total    = espacios.data.length
  const ocupados = espacios.data.filter(e => e.estado === 'ocupado').length
  const libres   = espacios.data.filter(e => e.estado === 'libre').length

  const config = await supabase.from('configuracion').select('umbral_alerta_ocupacion').single()
  const umbral = config.data?.umbral_alerta_ocupacion ?? 90
  const porcentaje = Math.round((ocupados / total) * 100)

  res.json({
    ocupacion: {
      total,
      ocupados,
      libres,
      bloqueados: espacios.data.filter(e => e.estado === 'bloqueado').length,
      reservados: espacios.data.filter(e => e.estado === 'reservado').length,
      porcentaje,
      alerta: porcentaje >= umbral
    },
    incidencias_abiertas: incidencias.data?.length ?? 0,
    usuarios_enrolados:   usuarios.data?.length ?? 0,
    ultimos_movimientos:  movimientos.data ?? []
  })
})

// GET /dashboard/reportes
// Reporte de ocupación histórica agrupada por hora
router.get('/reportes', auth, requireRole('jefe_servicios_generales','super_admin'), async (req, res) => {
  const { desde, hasta } = req.query

  const fechaDesde = desde ? new Date(desde).toISOString() : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const fechaHasta = hasta ? new Date(hasta).toISOString() : new Date().toISOString()

  const { data, error } = await supabase
    .from('movimientos')
    .select('tipo, timestamp_evento')
    .eq('tipo', 'ingreso')
    .gte('timestamp_evento', fechaDesde)
    .lte('timestamp_evento', fechaHasta)
    .order('timestamp_evento')

  if (error) return res.status(500).json({ error: error.message })

  // Agrupar por día
  const porDia = {}
  data.forEach(m => {
    const dia = m.timestamp_evento.substring(0, 10)
    porDia[dia] = (porDia[dia] || 0) + 1
  })

  // Agrupar por hora del día
  const porHora = Array(24).fill(0)
  data.forEach(m => {
    const hora = new Date(m.timestamp_evento).getHours()
    porHora[hora]++
  })

  res.json({
    periodo: { desde: fechaDesde, hasta: fechaHasta },
    total_ingresos: data.length,
    por_dia: Object.entries(porDia).map(([fecha, ingresos]) => ({ fecha, ingresos })),
    por_hora: porHora.map((ingresos, hora) => ({ hora, ingresos }))
  })
})

module.exports = router
