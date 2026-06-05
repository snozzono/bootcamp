const supabase = require('../supabase')
const { verifySession } = require('../session')

// Middleware principal: verifica que el usuario exista y esté activo
// Recibe un token firmado en Authorization: Bearer <token>
const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  let session
  try {
    session = verifySession(token)
  } catch (err) {
    return res.status(401).json({ error: (err).message })
  }

  const headerUid = req.headers['x-user-id']
  if (headerUid && headerUid !== session.sub) {
    return res.status(401).json({ error: 'Sesión no corresponde al usuario solicitado' })
  }

  const { data: user, error } = await supabase
    .from('usuarios_enrolados')
    .select('id, nombre, rol, activo')
    .eq('id', session.sub)
    .single()

  if (error || !user) {
    return res.status(401).json({ error: 'Usuario no encontrado' })
  }

  if (!user.activo) {
    return res.status(403).json({ error: 'Cuenta deshabilitada' })
  }

  req.user = user
  next()
}

// Middleware de roles: uso -> requireRole('guardia', 'jefe_seguridad')
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({
      error: 'Sin permisos para esta acción',
      tu_rol: req.user.rol,
      roles_permitidos: roles
    })
  }
  next()
}

module.exports = { auth, requireRole }
