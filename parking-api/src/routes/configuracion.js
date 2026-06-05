const router = require('express').Router()
const supabase = require('../supabase')
const { auth, requireRole } = require('../middleware/auth')

// ── CONFIGURACIÓN ─────────────────────────────────────────────

// GET /configuracion
router.get('/', auth, requireRole('jefe_servicios_generales','super_admin'), async (req, res) => {
  const { data, error } = await supabase
    .from('configuracion')
    .select('*')
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// PATCH /configuracion
router.patch('/', auth, requireRole('jefe_servicios_generales','super_admin'), async (req, res) => {
  const { capacidad_total, umbral_alerta_ocupacion, umbral_permanencia_max } = req.body

  const { data, error } = await supabase
    .from('configuracion')
    .update({
      capacidad_total,
      umbral_alerta_ocupacion,
      umbral_permanencia_max,
      updated_by: req.user.id
    })
    .eq('id', 1)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  await supabase.from('logs_seguridad').insert({
    usuario_id: req.user.id,
    accion: 'cambio_configuracion',
    detalle: JSON.stringify({ capacidad_total, umbral_alerta_ocupacion, umbral_permanencia_max })
  })

  res.json(data)
})

module.exports = router
