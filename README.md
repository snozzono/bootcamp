# ParkSmart — Sistema de Gestión de Estacionamientos
## DuocUC Sede Maipú

Aplicación full-stack para la gestión de estacionamientos del campus. Incluye panel de staff, mapa interactivo para conductores, reporte de incidencias y control de usuarios.

---

## Arquitectura

```
bootcamp/
├── parking-api/          # Backend — Node.js + Express + Supabase
├── parksmart-sede-maipú/ # Frontend — React + TypeScript + Vite
└── deploy.sh             # Script de deploy a EC2
```

**Stack:**
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express 4, Supabase (PostgreSQL)
- **Deploy**: AWS EC2 (t2.micro), nginx, PM2

---

## Desarrollo local

### Requisitos
- Node.js 20+
- Instancia de Supabase con las tablas creadas
- (Opcional) Google AI API Key para el endpoint de recomendación IA

### 1. Variables de entorno

```bash
# parking-api/.env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GOOGLE_AI_API_KEY=AIzaSy...
PORT=3000
```

### 2. Backend

```bash
cd parking-api
npm install
node src/app.js
# API disponible en http://localhost:3000
```

### 3. Frontend

```bash
cd parksmart-sede-maipú
npm install
npm run dev
# App disponible en http://localhost:5173
# El proxy /api apunta automáticamente a http://localhost:3000
```

---

## Roles de usuario

| Rol | Acceso |
|-----|--------|
| `conductor` | Mapa de espacios, registro de ingreso, reporte de incidencias |
| `guardia` | Dashboard en vivo, mapa de ocupación, resolución de incidencias |
| `jefe_seguridad` | Todo lo anterior + gestión de reservas |
| `jefe_servicios_generales` | Dashboard + lista de usuarios |
| `super_admin` | Acceso completo + gestión de usuarios y roles |

---

## API Endpoints

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| GET | `/api/usuarios/publico` | — | Lista usuarios para login (sin auth) |
| GET | `/api/estacionamientos` | todos | Estado de todos los espacios |
| GET | `/api/estacionamientos/disponibilidad` | — | Conteo público |
| PATCH | `/api/estacionamientos/:id/estado` | guardia+ | Cambiar estado de un espacio |
| POST | `/api/movimientos/ingreso` | conductor | Registrar ingreso |
| POST | `/api/movimientos/salida` | conductor | Registrar salida |
| GET | `/api/movimientos` | guardia+ | Historial de movimientos |
| POST | `/api/incidencias` | conductor | Reportar incidencia |
| GET | `/api/incidencias` | guardia+ | Listar incidencias |
| PATCH | `/api/incidencias/:id` | guardia+ | Actualizar estado |
| POST | `/api/reservas` | jefe_seguridad+ | Crear reserva manual |
| GET | `/api/reservas` | jefe_seguridad+ | Listar reservas activas |
| DELETE | `/api/reservas/:id` | jefe_seguridad+ | Cancelar reserva |
| GET | `/api/usuarios` | super_admin, jefe_servicios | Listar usuarios |
| POST | `/api/usuarios` | super_admin | Enrolar usuario |
| PATCH | `/api/usuarios/:id/rol` | super_admin | Cambiar rol |
| PATCH | `/api/usuarios/:id/activar` | super_admin | Reactivar usuario |
| DELETE | `/api/usuarios/:id` | super_admin | Desactivar usuario |
| GET | `/api/dashboard` | guardia+ | Métricas en tiempo real |
| GET | `/api/recomendacion` | guardia+ | Recomendación IA (Gemini) |

**Autenticación**: todas las rutas protegidas requieren el header `x-user-id: <UUID>`.

---

## Deploy en AWS EC2

### Paso 1 — Lanzar instancia

1. AWS Console → EC2 → **Launch Instance**
2. **AMI**: Amazon Linux 2023
3. **Tipo**: `t2.micro` (free tier)
4. **Key pair**: crear o seleccionar una existente
5. **Security group**: abrir puertos **22** (SSH) y **80** (HTTP)
6. Lanzar y anotar la IP pública

### Paso 2 — Preparar el servidor

```bash
ssh -i tu-clave.pem ec2-user@<IP-PUBLICA>
```

```bash
# Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs git

# PM2 y nginx
sudo npm install -g pm2
sudo yum install -y nginx

# Clonar repositorio
git clone https://github.com/<usuario>/<repo>.git ~/bootcamp
```

### Paso 3 — Variables de entorno

```bash
nano ~/bootcamp/parking-api/.env
# Pegar SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_AI_API_KEY
```

### Paso 4 — Configurar nginx

```bash
sudo nano /etc/nginx/conf.d/parksmart.conf
```

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t && sudo systemctl enable --now nginx
```

### Paso 5 — Deploy

```bash
cd ~/bootcamp
bash deploy.sh
```

El script construye el frontend, copia el build a `parking-api/public/` e inicia la app con PM2.

### Paso 6 — Persistencia al reiniciar

```bash
pm2 startup   # ejecutar el comando que muestra en pantalla
pm2 save
```

La app queda en `http://<IP-PUBLICA>`.

---

## Actualizar en producción

```bash
# En el servidor EC2
cd ~/bootcamp
git pull
bash deploy.sh
```

---

## Tablas Supabase requeridas

| Tabla | Descripción |
|-------|-------------|
| `usuarios_enrolados` | Usuarios del sistema con rol y estado |
| `estacionamientos` | Espacios físicos de estacionamiento |
| `movimientos` | Historial de ingresos y salidas |
| `incidencias` | Reportes de problemas |
| `reservas` | Reservas manuales de espacios |
| `logs_seguridad` | Auditoría de acciones del staff |
| `configuracion` | Parámetros del sistema |
