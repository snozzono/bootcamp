# ParkSmart — Sistema de Gestión de Estacionamientos
## DuocUC Sede Maipú

Aplicación full-stack para la gestión de estacionamientos del campus. Incluye panel de staff, búsqueda de plaza con recomendación IA, reporte de incidencias y control de usuarios.

---

## Arquitectura

```
bootcamp/
├── parking-api/          # Backend — Node.js + Express + Supabase
├── parksmart-sede-maipú/ # Frontend — React + TypeScript + Vite
└── deploy.sh             # Script de deploy a EC2
```

**Stack:**
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Backend**: Node.js, Express 4, Supabase (PostgreSQL), bcrypt
- **IA**: Google Gemini 2.0 Flash (recomendación de plaza, con fallback heurístico)
- **Deploy**: AWS EC2 (t2.micro), nginx, PM2

---

## Desarrollo local

### Requisitos
- Node.js 20+
- Instancia de Supabase con las tablas creadas
- (Opcional) Google AI API Key para recomendación IA

### 1. Variables de entorno

```bash
# parking-api/.env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GOOGLE_AI_API_KEY=AIzaSy...     # opcional — habilita Gemini
PORT=3000
```

### 2. Backend

```bash
cd parking-api
npm install
node src/app.js
# API disponible en http://localhost:3000
```

#### Primera vez — asignar contraseñas por defecto

Si la base de datos ya tiene usuarios sin `password_hash`, corre el script de migración una sola vez:

```bash
cd parking-api
node set-default-passwords.js   # asigna "duoc2026" a todos los usuarios sin contraseña
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
| `conductor` | Buscar plaza, reservar con IA, confirmar llegada, reportar incidencias |
| `guardia` | Dashboard en vivo, mapa de ocupación, resolución de incidencias |
| `jefe_seguridad` | Dashboard + mapa + gestión de incidencias + usuarios (lectura) |
| `jefe_servicios_generales` | Dashboard + mapa + lista de usuarios |
| `super_admin` | Acceso completo + crear/editar/desactivar usuarios y roles |

---

## API Endpoints

### Autenticación (pública)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login con correo y contraseña. Devuelve usuario. |
| POST | `/api/auth/register` | Registro público (crea conductor). |

> Todas las rutas protegidas requieren el header `x-user-id: <UUID>`.

### Estacionamientos

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| GET | `/api/estacionamientos` | todos | Estado de todos los espacios |
| GET | `/api/estacionamientos/disponibilidad` | — | Conteo público |
| PATCH | `/api/estacionamientos/:id/estado` | guardia+ | Cambiar estado de un espacio |

### Movimientos

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| POST | `/api/movimientos/ingreso` | conductor | Registrar ingreso / reserva |
| POST | `/api/movimientos/salida` | conductor | Registrar salida |
| GET | `/api/movimientos` | guardia+ | Historial de movimientos |

### Incidencias

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| POST | `/api/incidencias` | conductor | Reportar incidencia |
| GET | `/api/incidencias` | guardia+ | Listar incidencias |
| PATCH | `/api/incidencias/:id` | guardia+ | Actualizar estado |

### Usuarios

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| GET | `/api/usuarios` | jefe+, super_admin | Listar usuarios |
| POST | `/api/usuarios` | super_admin | Enrolar usuario |
| PATCH | `/api/usuarios/:id/rol` | super_admin | Cambiar rol |
| PATCH | `/api/usuarios/:id/activar` | super_admin | Reactivar usuario |
| DELETE | `/api/usuarios/:id` | super_admin | Desactivar usuario |

### Otros

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| GET | `/api/dashboard` | guardia+ | Métricas en tiempo real |
| GET | `/api/recomendacion` | conductor+ | Mejor plaza libre (Gemini + heurística) |

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
git stash        # si hay cambios locales (ej: .env no trackeado, guárdalo antes)
git pull
bash deploy.sh
```

---

## Tablas Supabase requeridas

| Tabla | Descripción |
|-------|-------------|
| `usuarios_enrolados` | Usuarios del sistema con rol, estado y `password_hash` |
| `estacionamientos` | Espacios físicos de estacionamiento |
| `movimientos` | Historial de ingresos y salidas |
| `incidencias` | Reportes de problemas |
| `reservas` | Reservas manuales de espacios |
| `logs_seguridad` | Auditoría de acciones del staff |
| `configuracion` | Parámetros del sistema |

### Columna requerida para auth

```sql
ALTER TABLE usuarios_enrolados
ADD COLUMN IF NOT EXISTS password_hash TEXT;
```
