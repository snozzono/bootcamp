// Script de migración — ejecutar UNA sola vez después del deploy
// Asigna contraseña por defecto a todos los usuarios que no tienen password_hash
//
// Uso: node set-default-passwords.js
//
require('dotenv').config()
const bcrypt = require('bcrypt')
const supabase = require('./src/supabase')

const DEFAULT_PASSWORD = 'duoc2026'

async function main() {
  console.log('Generando hash para contraseña por defecto...')
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10)

  const { data, error } = await supabase
    .from('usuarios_enrolados')
    .update({ password_hash: hash })
    .is('password_hash', null)
    .select('nombre, correo')

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log(`✅ Contraseña por defecto asignada a ${data.length} usuario(s):`)
  data.forEach(u => console.log(`   - ${u.nombre} (${u.correo})`))
  console.log(`\nContraseña por defecto: "${DEFAULT_PASSWORD}"`)
  console.log('Recuerda cambiarla desde el panel de administración.')
}

main()
