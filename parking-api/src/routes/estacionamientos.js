const router = require('express').Router()
const supabase = require('../supabase')
const { auth, requireRole } = require('../middleware/auth')

// GET /estacionamientos
// Panel completo — todos los espacios con datos del conductor actual
// Roles: guardia, jefe_seguridad, jefe_servicios_generales, super_admin
router.get('/', auth, requireRole('conductor','guardia','jefe_seguridad','jefe_servicios_generales','super_admin'), async (req, res) => {
  const { data, error } = await supabase
    .from('estacionamientos')
    .select(`
      id, codigo, estado, motivo_estado, updated_at,
      usuario_actual:usuario_actual_id (
        id, nombre, patente_asociada, telefono, correo
      )
    `)
    .order('codigo')

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET /estacionamientos/disponibilidad
// Vista pública para el conductor (sin auth)
// Devuelve solo conteo y porcentaje — no datos personales
router.get('/disponibilidad', async (req, res) => {
  const { data, error } = await supabase
    .from('estacionamientos')
    .select('estado')

  if (error) return res.status(500).json({ error: error.message })

  const total    = data.length
  const ocupados = data.filter(e => e.estado === 'ocupado').length
  const libres   = data.filter(e => e.estado === 'libre').length
  const bloqueados = data.filter(e => e.estado === 'bloqueado').length
  const reservados = data.filter(e => e.estado === 'reservado').length

  res.json({
    total,
    libres,
    ocupados,
    bloqueados,
    reservados,
    porcentaje_ocupacion: Math.round((ocupados / total) * 100)
  })
})

// PATCH /estacionamientos/:id/estado
// Cambiar estado de un espacio (bloquear, liberar, etc.)
// Roles: guardia, jefe_seguridad, super_admin
router.patch('/:id/estado', auth, requireRole('guardia','jefe_seguridad','super_admin'), async (req, res) => {
  const { id } = req.params
  const { estado, motivo_estado } = req.body

  const estadosValidos = ['libre', 'ocupado', 'bloqueado', 'reservado']
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Valores: ${estadosValidos.join(', ')}` })
  }

  const { data, error } = await supabase
    .from('estacionamientos')
    .update({
      estado,
      motivo_estado: motivo_estado || null,
      usuario_actual_id: estado === 'libre' ? null : undefined
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  // Registrar en log de seguridad si es bloqueo
  if (['bloqueado', 'reservado'].includes(estado)) {
    await supabase.from('logs_seguridad').insert({
      usuario_id: req.user.id,
      accion: estado === 'bloqueado' ? 'bloqueo' : 'reserva_manual',
      estacionamiento_id: parseInt(id),
      detalle: motivo_estado || null
    })
  }

  res.json(data)
})

module.exports = router
