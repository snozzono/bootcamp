const router = require('express').Router()
const bcrypt = require('bcrypt')
const supabase = require('../supabase')

// POST /auth/login
router.post('/login', async (req, res) => {
  const { correo, password } = req.body

  if (!correo || !password) {
    return res.status(400).json({ error: 'correo y password son requeridos' })
  }

  const { data: user, error } = await supabase
    .from('usuarios_enrolados')
    .select('id, nombre, rol, activo, correo, patente_asociada, password_hash')
    .eq('correo', correo.toLowerCase().trim())
    .single()

  if (error || !user) {
    return res.status(401).json({ error: 'Credenciales incorrectas' })
  }

  if (!user.activo) {
    return res.status(403).json({ error: 'Cuenta deshabilitada. Contacta al administrador.' })
  }

  if (!user.password_hash) {
    return res.status(401).json({ error: 'Contraseña no configurada. Contacta al administrador.' })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ error: 'Credenciales incorrectas' })
  }

  const { password_hash, ...safeUser } = user
  res.json(safeUser)
})

// POST /auth/register — auto-registro público (solo crea conductores)
router.post('/register', async (req, res) => {
  const { rut, nombre, correo, password, patente_asociada, telefono } = req.body

  if (!rut || !nombre || !correo || !password) {
    return res.status(400).json({ error: 'rut, nombre, correo y password son requeridos' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
  }

  const password_hash = await bcrypt.hash(password, 10)

  const { data, error } = await supabase
    .from('usuarios_enrolados')
    .insert({
      rut,
      nombre,
      correo: correo.toLowerCase().trim(),
      password_hash,
      rol: 'conductor',
      patente_asociada: patente_asociada ?? null,
      telefono: telefono ?? null,
    })
    .select('id, nombre, rol, activo, correo, patente_asociada')
    .single()

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'RUT o correo ya registrado' })
    }
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json(data)
})

module.exports = router
