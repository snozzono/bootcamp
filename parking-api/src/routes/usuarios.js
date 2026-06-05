const router = require('express').Router()
const supabase = require('../supabase')
const { auth, requireRole } = require('../middleware/auth')

// GET /usuarios
// Listar todos los usuarios — búsqueda por nombre, rut o patente
router.get('/', auth, requireRole('super_admin','jefe_servicios_generales'), async (req, res) => {
  const { q } = req.query

  let query = supabase
    .from('usuarios_enrolados')
    .select('id, rut, nombre, telefono, correo, rol, patente_asociada, activo, created_at')
    .order('nombre')

  if (q) {
    query = query.or(`nombre.ilike.%${q}%,rut.ilike.%${q}%,patente_asociada.ilike.%${q}%`)
  }

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /usuarios
// Enrolar nuevo conductor o usuario
router.post('/', auth, requireRole('super_admin'), async (req, res) => {
  const { rut, nombre, telefono, correo, rol, patente_asociada } = req.body

  if (!rut || !nombre || !correo || !rol) {
    return res.status(400).json({ error: 'rut, nombre, correo y rol son requeridos' })
  }

  const rolesValidos = ['conductor','guardia','jefe_seguridad','jefe_servicios_generales','super_admin']
  if (!rolesValidos.includes(rol)) {
    return res.status(400).json({ error: `Rol inválido. Valores: ${rolesValidos.join(', ')}` })
  }

  const { data, error } = await supabase
    .from('usuarios_enrolados')
    .insert({ rut, nombre, telefono, correo, rol, patente_asociada })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'RUT o correo ya registrado' })
    }
    return res.status(500).json({ error: error.message })
  }

  // Log
  await supabase.from('logs_seguridad').insert({
    usuario_id: req.user.id,
    accion: 'enrolamiento',
    detalle: `Usuario enrolado: ${nombre} (${rol})`
  })

  res.status(201).json(data)
})

// PATCH /usuarios/:id
// Actualizar datos de un usuario
router.patch('/:id', auth, requireRole('super_admin'), async (req, res) => {
  const { id } = req.params
  const { nombre, telefono, correo, patente_asociada } = req.body

  const { data, error } = await supabase
    .from('usuarios_enrolados')
    .update({ nombre, telefono, correo, patente_asociada })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// PATCH /usuarios/:id/rol
// Cambiar rol — invalida sesión del usuario afectado
router.patch('/:id/rol', auth, requireRole('super_admin'), async (req, res) => {
  const { id } = req.params
  const { rol } = req.body

  const rolesValidos = ['conductor','guardia','jefe_seguridad','jefe_servicios_generales','super_admin']
  if (!rolesValidos.includes(rol)) {
    return res.status(400).json({ error: `Rol inválido. Valores: ${rolesValidos.join(', ')}` })
  }

  const { data, error } = await supabase
    .from('usuarios_enrolados')
    .update({ rol })
    .eq('id', id)
    .select('id, nombre, rol')
    .single()

  if (error) return res.status(500).json({ error: error.message })

  await supabase.from('logs_seguridad').insert({
    usuario_id: req.user.id,
    accion: 'cambio_rol',
    detalle: `Usuario ${data.nombre} → nuevo rol: ${rol}`
  })

  res.json({ mensaje: 'Rol actualizado. El usuario deberá iniciar sesión nuevamente.', data })
})

// DELETE /usuarios/:id
// Baja lógica — no elimina, desactiva
router.delete('/:id', auth, requireRole('super_admin'), async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('usuarios_enrolados')
    .update({ activo: false })
    .eq('id', id)
    .select('id, nombre')
    .single()

  if (error) return res.status(500).json({ error: error.message })

  await supabase.from('logs_seguridad').insert({
    usuario_id: req.user.id,
    accion: 'baja_usuario',
    detalle: `Baja lógica: ${data.nombre}`
  })

  res.json({ mensaje: `Usuario ${data.nombre} desactivado. Historial conservado.` })
})

module.exports = router
