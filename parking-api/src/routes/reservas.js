const router = require('express').Router()
const supabase = require('../supabase')
const { auth, requireRole } = require('../middleware/auth')

// POST /reservas
// Crear reserva de un espacio con tiempo de expiración
// Roles: jefe_seguridad, super_admin
router.post('/', auth, requireRole('jefe_seguridad','super_admin'), async (req, res) => {
  const { estacionamiento_id, motivo, termino } = req.body

  if (!estacionamiento_id || !motivo || !termino) {
    return res.status(400).json({ error: 'estacionamiento_id, motivo y termino son requeridos' })
  }

  if (new Date(termino) <= new Date()) {
    return res.status(400).json({ error: 'termino debe ser una fecha futura' })
  }

  // Verificar que el espacio esté libre
  const { data: espacio } = await supabase
    .from('estacionamientos')
    .select('id, codigo, estado')
    .eq('id', estacionamiento_id)
    .single()

  if (!espacio) return res.status(404).json({ error: 'Espacio no encontrado' })

  if (espacio.estado !== 'libre') {
    return res.status(409).json({
      error: `El espacio ${espacio.codigo} no está libre`,
      estado_actual: espacio.estado
    })
  }

  // Crear la reserva
  const { data: reserva, error } = await supabase
    .from('reservas')
    .insert({
      estacionamiento_id,
      motivo,
      termino,
      creada_por: req.user.id
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  // Marcar espacio como reservado
  await supabase
    .from('estacionamientos')
    .update({ estado: 'reservado', motivo_estado: motivo })
    .eq('id', estacionamiento_id)

  // Log de seguridad
  await supabase.from('logs_seguridad').insert({
    usuario_id: req.user.id,
    accion: 'reserva',
    estacionamiento_id,
    detalle: `Motivo: ${motivo} | Hasta: ${termino}`
  })

  res.status(201).json({
    mensaje: `Espacio ${espacio.codigo} reservado hasta ${termino}`,
    reserva
  })
})

// GET /reservas
// Listar reservas activas
router.get('/', auth, requireRole('jefe_seguridad','jefe_servicios_generales','super_admin'), async (req, res) => {
  const { data, error } = await supabase
    .from('reservas')
    .select(`
      id, motivo, inicio, termino, activa, created_at,
      estacionamiento:estacionamiento_id (codigo),
      creada_por_usuario:creada_por (nombre)
    `)
    .eq('activa', true)
    .order('termino')

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// DELETE /reservas/:id
// Cancelar una reserva y liberar el espacio
router.delete('/:id', auth, requireRole('jefe_seguridad','super_admin'), async (req, res) => {
  const { id } = req.params

  const { data: reserva } = await supabase
    .from('reservas')
    .select('id, estacionamiento_id, activa')
    .eq('id', id)
    .single()

  if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' })
  if (!reserva.activa) return res.status(400).json({ error: 'La reserva ya está inactiva' })

  await supabase
    .from('reservas')
    .update({ activa: false })
    .eq('id', id)

  await supabase
    .from('estacionamientos')
    .update({ estado: 'libre', motivo_estado: null })
    .eq('id', reserva.estacionamiento_id)

  res.json({ mensaje: 'Reserva cancelada y espacio liberado' })
})

module.exports = router
