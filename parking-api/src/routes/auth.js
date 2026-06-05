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

module.exports = router
