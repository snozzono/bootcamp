const supabase = require('../supabase')

// Middleware principal: verifica que el usuario exista y esté activo
// Recibe el UUID del usuario en el header x-user-id
// En producción: validar Firebase JWT y extraer el uid del token
const auth = async (req, res, next) => {
  const uid = req.headers['x-user-id']

  if (!uid) {
    return res.status(401).json({ error: 'Header x-user-id requerido' })
  }

  const { data: user, error } = await supabase
    .from('usuarios_enrolados')
    .select('id, nombre, rol, activo')
    .eq('id', uid)
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
