require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

// ── Rutas ────────────────────────────────────────────────────
app.use('/api/estacionamientos', require('./routes/estacionamientos'))
app.use('/api/movimientos',      require('./routes/movimientos'))
app.use('/api/incidencias',      require('./routes/incidencias'))
app.use('/api/reservas',         require('./routes/reservas'))
app.use('/api/usuarios',         require('./routes/usuarios'))
app.use('/api/configuracion',    require('./routes/configuracion'))
app.use('/api/dashboard',        require('./routes/dashboard'))

// ── Health check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    api: 'Gestión de Estacionamientos — DuocUC Maipú',
    version: '1.0.0',
    endpoints: [
      'GET    /api/estacionamientos',
      'GET    /api/estacionamientos/disponibilidad  (público)',
      'PATCH  /api/estacionamientos/:id/estado',
      'POST   /api/movimientos/ingreso',
      'POST   /api/movimientos/salida',
      'GET    /api/movimientos',
      'POST   /api/incidencias',
      'GET    /api/incidencias',
      'PATCH  /api/incidencias/:id',
      'POST   /api/reservas',
      'GET    /api/reservas',
      'DELETE /api/reservas/:id',
      'GET    /api/usuarios',
      'POST   /api/usuarios',
      'PATCH  /api/usuarios/:id',
      'PATCH  /api/usuarios/:id/rol',
      'DELETE /api/usuarios/:id',
      'GET    /api/configuracion',
      'PATCH  /api/configuracion',
      'GET    /api/dashboard',
      'GET    /api/dashboard/reportes'
    ]
  })
})

// ── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no existe` })
})

// ── Error handler global ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

// ── Servidor ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`\n🚗  Parking API corriendo en http://localhost:${PORT}`)
  console.log(`📋  Endpoints: http://localhost:${PORT}/\n`)
})
