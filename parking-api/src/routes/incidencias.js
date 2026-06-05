const router = require('express').Router()
const supabase = require('../supabase')
const { auth, requireRole } = require('../middleware/auth')

// POST /incidencias
// Conductor reporta una incidencia desde su espacio
router.post('/', auth, requireRole('conductor'), async (req, res) => {
  const { estacionamiento_id, descripcion } = req.body

  if (!estacionamiento_id || !descripcion) {
    return res.status(400).json({ error: 'estacionamiento_id y descripcion son requeridos' })
  }

  const { data, error } = await supabase
    .from('incidencias')
    .insert({
      estacionamiento_id,
      usuario_id: req.user.id,
      descripcion
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  res.status(201).json({
    mensaje: 'Incidencia reportada. La guardia fue notificada.',
    incidencia: data
  })
})

// GET /incidencias
// Lista de incidencias — filtrable por estado
// Roles: guardia, jefe_seguridad, super_admin
router.get('/', auth, requireRole('guardia','jefe_seguridad','jefe_servicios_generales','super_admin'), async (req, res) => {
  const { estado } = req.query

  let query = supabase
    .from('incidencias')
    .select(`
      id, descripcion, estado, created_at, updated_at,
      estacionamiento:estacionamiento_id (codigo),
      usuario:usuario_id (nombre, telefono, patente_asociada),
      atendida_por_usuario:atendida_por (nombre)
    `)
    .order('created_at', { ascending: false })

  if (estado) query = query.eq('estado', estado)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// PATCH /incidencias/:id
// Guardia actualiza el estado de una incidencia
router.patch('/:id', auth, requireRole('guardia','jefe_seguridad','super_admin'), async (req, res) => {
  const { id } = req.params
  const { estado } = req.body

  const estadosValidos = ['pendiente', 'en_atencion', 'resuelta']
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Valores: ${estadosValidos.join(', ')}` })
  }

  const { data, error } = await supabase
    .from('incidencias')
    .update({
      estado,
      atendida_por: req.user.id
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

module.exports = router
