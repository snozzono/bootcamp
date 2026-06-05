const router = require('express').Router()
const supabase = require('../supabase')
const { auth, requireRole } = require('../middleware/auth')

// POST /movimientos/ingreso
// Conductor registra su ingreso seleccionando un espacio
router.post('/ingreso', auth, requireRole('conductor'), async (req, res) => {
  const { estacionamiento_id } = req.body

  if (!estacionamiento_id) {
    return res.status(400).json({ error: 'estacionamiento_id requerido' })
  }

  // Verificar que el espacio esté libre
  const { data: espacio, error: errEspacio } = await supabase
    .from('estacionamientos')
    .select('id, codigo, estado')
    .eq('id', estacionamiento_id)
    .single()

  if (errEspacio || !espacio) {
    return res.status(404).json({ error: 'Espacio no encontrado' })
  }

  if (espacio.estado !== 'libre') {
    return res.status(409).json({
      error: `El espacio ${espacio.codigo} no está libre`,
      estado_actual: espacio.estado
    })
  }

  // Registrar movimiento de ingreso
  const { data: movimiento, error: errMov } = await supabase
    .from('movimientos')
    .insert({
      estacionamiento_id,
      usuario_id: req.user.id,
      tipo: 'ingreso'
    })
    .select()
    .single()

  if (errMov) return res.status(500).json({ error: errMov.message })

  // Actualizar estado del espacio
  await supabase
    .from('estacionamientos')
    .update({ estado: 'ocupado', usuario_actual_id: req.user.id })
    .eq('id', estacionamiento_id)

  res.status(201).json({
    mensaje: `Ingreso registrado en espacio ${espacio.codigo}`,
    movimiento
  })
})

// POST /movimientos/salida
// Conductor registra su salida
router.post('/salida', auth, requireRole('conductor'), async (req, res) => {
  const { estacionamiento_id } = req.body

  if (!estacionamiento_id) {
    return res.status(400).json({ error: 'estacionamiento_id requerido' })
  }

  // Verificar que el espacio esté ocupado por este conductor
  const { data: espacio } = await supabase
    .from('estacionamientos')
    .select('id, codigo, estado, usuario_actual_id')
    .eq('id', estacionamiento_id)
    .single()

  if (!espacio) return res.status(404).json({ error: 'Espacio no encontrado' })

  if (espacio.usuario_actual_id !== req.user.id) {
    return res.status(403).json({ error: 'Este espacio no está asignado a tu usuario' })
  }

  // Registrar movimiento de salida
  const { data: movimiento, error: errMov } = await supabase
    .from('movimientos')
    .insert({
      estacionamiento_id,
      usuario_id: req.user.id,
      tipo: 'salida'
    })
    .select()
    .single()

  if (errMov) return res.status(500).json({ error: errMov.message })

  // Liberar el espacio
  await supabase
    .from('estacionamientos')
    .update({ estado: 'libre', usuario_actual_id: null, motivo_estado: null })
    .eq('id', estacionamiento_id)

  res.json({
    mensaje: `Salida registrada del espacio ${espacio.codigo}`,
    movimiento
  })
})

// GET /movimientos
// Historial — filtrable por espacio o usuario
// Roles: guardia, jefe_seguridad, jefe_servicios_generales, super_admin
router.get('/', auth, requireRole('guardia','jefe_seguridad','jefe_servicios_generales','super_admin'), async (req, res) => {
  const { estacionamiento_id, usuario_id, limit = 50 } = req.query

  let query = supabase
    .from('movimientos')
    .select(`
      id, tipo, timestamp_evento,
      estacionamiento:estacionamiento_id (codigo),
      usuario:usuario_id (nombre, patente_asociada)
    `)
    .order('timestamp_evento', { ascending: false })
    .limit(parseInt(limit))

  if (estacionamiento_id) query = query.eq('estacionamiento_id', estacionamiento_id)
  if (usuario_id)         query = query.eq('usuario_id', usuario_id)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

module.exports = router
