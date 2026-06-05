import { ParkingSlot, ParkingStatus, UserProfile, UserRole, IncidentReport } from './types'
import { getSlotMeta } from './data'

const BASE = '/api'

// ── API response types ────────────────────────────────────────

export interface ApiUsuario {
  id: string
  nombre: string
  rol: string
  activo: boolean
  correo?: string
  patente_asociada?: string
  session_token?: string
  session_expires_at?: string
}

interface ApiEstacionamiento {
  id: number
  codigo: string
  estado: string
  motivo_estado: string | null
  updated_at: string
  usuario_actual?: { id: string; nombre: string; patente_asociada: string } | null
}

interface ApiIncidencia {
  id: string
  descripcion: string
  estado: string
  created_at: string
  estacionamiento: { codigo: string } | null
  usuario: { nombre: string; patente_asociada?: string } | null
}

// ── Mapping constants ─────────────────────────────────────────

const ESTADO_STATUS: Record<string, ParkingStatus> = {
  libre: 'free',
  ocupado: 'occupied',
  bloqueado: 'blocked',
  reservado: 'occupied',
}

const STATUS_ESTADO: Record<ParkingStatus, string> = {
  free: 'libre',
  occupied: 'ocupado',
  blocked: 'bloqueado',
}

export const ROL_DISPLAY: Record<string, UserRole> = {
  conductor: 'Conductor',
  guardia: 'Guardia',
  jefe_seguridad: 'Jefe Seguridad',
  jefe_servicios_generales: 'Jefe Servicios Gral.',
  super_admin: 'Super Admin',
}

export const DISPLAY_ROL: Record<UserRole, string> = {
  Conductor: 'conductor',
  Guardia: 'guardia',
  'Jefe Seguridad': 'jefe_seguridad',
  'Jefe Servicios Gral.': 'jefe_servicios_generales',
  'Super Admin': 'super_admin',
}

// ── Mappers ───────────────────────────────────────────────────

export function mapEstacionamiento(e: ApiEstacionamiento): ParkingSlot {
  return {
    id: e.id,
    code: e.codigo,
    status: ESTADO_STATUS[e.estado] ?? 'free',
    ...getSlotMeta(e.id),
  }
}

export function mapUsuario(u: ApiUsuario): UserProfile {
  return {
    id: u.id,
    name: u.nombre,
    email: u.correo ?? '',
    role: ROL_DISPLAY[u.rol] ?? 'Conductor',
    active: u.activo,
  }
}

export function mapIncidencia(i: ApiIncidencia): IncidentReport {
  let type = 'Incidencia'
  let description = i.descripcion

  if (i.descripcion.startsWith('[')) {
    const close = i.descripcion.indexOf(']')
    if (close > 0) {
      type = i.descripcion.slice(1, close)
      description = i.descripcion.slice(close + 2)
    }
  }

  return {
    id: i.id,
    type,
    description,
    timestamp: i.created_at,
    status: i.estado === 'resuelta' ? 'Resolved' : 'Pending',
    userEmail: i.usuario?.nombre ?? '',
    slotCode: i.estacionamiento?.codigo,
  }
}

// ── HTTP helper ───────────────────────────────────────────────

async function request<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(url, opts)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    if (res.status === 401 || res.status === 403) {
      window.dispatchEvent(new CustomEvent('parksmart:session-expired', {
        detail: body.error ?? res.statusText,
      }))
    }
    throw new Error(body.error ?? res.statusText)
  }
  return res.json()
}

function hdrs(user: ApiUsuario): Record<string, string> {
  if (!user.session_token) {
    throw new Error('Sesión no disponible. Inicia sesión nuevamente.')
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${user.session_token}`,
    'x-user-id': user.id,
  }
}

// ── Login público ─────────────────────────────────────────────

export function fetchUsuariosPublico(): Promise<ApiUsuario[]> {
  return request(`${BASE}/usuarios/publico`)
}

// ── Estacionamientos ──────────────────────────────────────────

export function fetchEstacionamientos(user: ApiUsuario): Promise<ApiEstacionamiento[]> {
  return request(`${BASE}/estacionamientos`, { headers: hdrs(user) })
}

export function patchEstadoEstacionamiento(
  user: ApiUsuario,
  id: number,
  status: ParkingStatus,
  motivo?: string
): Promise<unknown> {
  return request(`${BASE}/estacionamientos/${id}/estado`, {
    method: 'PATCH',
    headers: hdrs(user),
    body: JSON.stringify({ estado: STATUS_ESTADO[status], motivo_estado: motivo }),
  })
}

// ── Movimientos ───────────────────────────────────────────────

export function postIngreso(user: ApiUsuario, estacionamiento_id: number): Promise<unknown> {
  return request(`${BASE}/movimientos/ingreso`, {
    method: 'POST',
    headers: hdrs(user),
    body: JSON.stringify({ estacionamiento_id }),
  })
}

// ── Incidencias ───────────────────────────────────────────────

export function fetchIncidencias(user: ApiUsuario): Promise<ApiIncidencia[]> {
  return request(`${BASE}/incidencias`, { headers: hdrs(user) })
}

export function postIncidencia(
  user: ApiUsuario,
  estacionamiento_id: number,
  descripcion: string
): Promise<unknown> {
  return request(`${BASE}/incidencias`, {
    method: 'POST',
    headers: hdrs(user),
    body: JSON.stringify({ estacionamiento_id, descripcion }),
  })
}

export function patchIncidencia(user: ApiUsuario, id: string, estado: string): Promise<unknown> {
  return request(`${BASE}/incidencias/${id}`, {
    method: 'PATCH',
    headers: hdrs(user),
    body: JSON.stringify({ estado }),
  })
}

// ── Usuarios ──────────────────────────────────────────────────

export function fetchUsuarios(user: ApiUsuario): Promise<ApiUsuario[]> {
  return request(`${BASE}/usuarios`, { headers: hdrs(user) })
}

export function patchUsuarioRol(user: ApiUsuario, targetId: string, rol: string): Promise<unknown> {
  return request(`${BASE}/usuarios/${targetId}/rol`, {
    method: 'PATCH',
    headers: hdrs(user),
    body: JSON.stringify({ rol }),
  })
}

export function deleteUsuario(user: ApiUsuario, targetId: string): Promise<unknown> {
  return request(`${BASE}/usuarios/${targetId}`, {
    method: 'DELETE',
    headers: hdrs(user),
  })
}

export function activarUsuario(user: ApiUsuario, targetId: string): Promise<unknown> {
  return request(`${BASE}/usuarios/${targetId}/activar`, {
    method: 'PATCH',
    headers: hdrs(user),
  })
}

export interface NuevoUsuarioPayload {
  rut: string
  nombre: string
  correo: string
  rol: string
  telefono?: string
  patente_asociada?: string
  password?: string
}

export function postLogin(correo: string, password: string): Promise<ApiUsuario> {
  return request(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password }),
  })
}

export interface RegisterPayload {
  rut: string
  nombre: string
  correo: string
  password: string
  patente_asociada?: string
  telefono?: string
}

export function postRegister(payload: RegisterPayload): Promise<ApiUsuario> {
  return request(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function postUsuario(user: ApiUsuario, payload: NuevoUsuarioPayload): Promise<ApiUsuario> {
  return request(`${BASE}/usuarios`, {
    method: 'POST',
    headers: hdrs(user),
    body: JSON.stringify(payload),
  })
}

// ── Recomendación IA ──────────────────────────────────────────

export interface RecomendacionResult {
  slotId: number
  codigo: string
  razon: string
  source: 'ai' | 'heuristic'
}

export function fetchRecomendacion(user: ApiUsuario): Promise<RecomendacionResult> {
  return request(`${BASE}/recomendacion`, { headers: hdrs(user) })
}
