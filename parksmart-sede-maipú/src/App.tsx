import { useState, useEffect } from 'react'
import { UserRole, ParkingSlot, UserProfile, IncidentReport, Reservation } from './types'
import {
  ApiUsuario,
  ROL_DISPLAY,
  DISPLAY_ROL,
  NuevoUsuarioPayload,
  fetchEstacionamientos,
  fetchIncidencias,
  fetchUsuarios,
  postIngreso,
  postIncidencia,
  postUsuario,
  patchIncidencia,
  patchEstadoEstacionamiento,
  patchUsuarioRol,
  deleteUsuario,
  activarUsuario,
  mapEstacionamiento,
  mapIncidencia,
  mapUsuario,
} from './api'
import NavigationHeader from './components/NavigationHeader'
import LoginScreen from './components/LoginScreen'
import DriverMapBooking from './components/DriverMapBooking'
import DriverLocationCheckIn from './components/DriverLocationCheckIn'
import DriverReportIncident from './components/DriverReportIncident'
import StaffDashboard from './components/StaffDashboard'
import StaffGridOccupancy from './components/StaffGridOccupancy'
import StaffUsersManagement from './components/StaffUsersManagement'

export default function App() {
  const [currentUser, setCurrentUser] = useState<ApiUsuario | null>(null)
  const [currentPage, setCurrentPage] = useState<string>('driver-map')

  const [slots, setSlots] = useState<ParkingSlot[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [incidents, setIncidents] = useState<IncidentReport[]>([])
  const [activeCheckIn, setActiveCheckIn] = useState<Reservation | null>(null)

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 4500)
  }

  const fetchData = async (user: ApiUsuario) => {
    try {
      const slotsRaw = await fetchEstacionamientos(user.id)
      setSlots(slotsRaw.map(mapEstacionamiento))

      if (user.rol !== 'conductor') {
        const incRaw = await fetchIncidencias(user.id)
        setIncidents(incRaw.map(mapIncidencia))
      }

      if (['super_admin', 'jefe_servicios_generales'].includes(user.rol)) {
        const usersRaw = await fetchUsuarios(user.id)
        setUsers(usersRaw.map(mapUsuario))
      }
    } catch (err) {
      showToast(`Error cargando datos: ${(err as Error).message}`)
    }
  }

  useEffect(() => {
    if (!currentUser) return
    fetchData(currentUser)
    setCurrentPage(currentUser.rol === 'conductor' ? 'driver-map' : 'staff-live')
  }, [currentUser])

  const handleLogout = () => {
    setCurrentUser(null)
    setSlots([])
    setUsers([])
    setIncidents([])
    setActiveCheckIn(null)
  }

  const handleReserve = async (slotId: number, plate: string) => {
    if (!currentUser) return
    try {
      await postIngreso(currentUser.id, slotId)
      const slot = slots.find(s => s.id === slotId)
      if (slot) {
        setActiveCheckIn({
          slotId: slot.id,
          slotCode: slot.code,
          plate,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        })
      }
      await fetchData(currentUser)
      showToast(`✅ Ingreso registrado en plaza ${slot?.code}`)
    } catch (err) {
      showToast(`Error: ${(err as Error).message}`)
    }
  }

  const handleCheckIn = async (slotCode: string, plate: string) => {
    if (!currentUser) return
    const slot = slots.find(s => s.code.toUpperCase() === slotCode.toUpperCase())
    if (!slot) {
      showToast(`Plaza ${slotCode} no encontrada`)
      return
    }
    try {
      await postIngreso(currentUser.id, slot.id)
      setActiveCheckIn({
        slotId: slot.id,
        slotCode: slot.code,
        plate,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      })
      await fetchData(currentUser)
      showToast(`✅ Estacionamiento confirmado en plaza ${slotCode}`)
    } catch (err) {
      showToast(`Error: ${(err as Error).message}`)
    }
  }

  const handleAddIncident = async (type: string, description: string) => {
    if (!currentUser) return
    const slotId = activeCheckIn?.slotId ?? 1
    try {
      await postIncidencia(currentUser.id, slotId, `[${type}] ${description}`)
      showToast(`🚨 Incidencia "${type}" reportada a la guardia`)
    } catch (err) {
      showToast(`Error: ${(err as Error).message}`)
    }
  }

  const handleResolveIncident = async (incidentId: string) => {
    if (!currentUser) return
    try {
      await patchIncidencia(currentUser.id, incidentId, 'resuelta')
      await fetchData(currentUser)
      showToast('✅ Incidencia marcada como resuelta')
    } catch (err) {
      showToast(`Error: ${(err as Error).message}`)
    }
  }

  const handleUpdateSlotStatus = async (slotId: number, status: 'free' | 'occupied' | 'blocked') => {
    if (!currentUser) return
    try {
      await patchEstadoEstacionamiento(currentUser.id, slotId, status)
      await fetchData(currentUser)
      const code = slots.find(s => s.id === slotId)?.code ?? ''
      showToast(`📝 Plaza ${code} actualizada a: ${status.toUpperCase()}`)
    } catch (err) {
      showToast(`Error: ${(err as Error).message}`)
    }
  }

  const handleToggleUserActive = async (userId: string) => {
    if (!currentUser) return
    const user = users.find(u => u.id === userId)
    if (!user) return
    try {
      if (user.active) {
        await deleteUsuario(currentUser.id, userId)
      } else {
        await activarUsuario(currentUser.id, userId)
      }
      await fetchData(currentUser)
      showToast(`👤 Usuario ${user.name} ${user.active ? 'desactivado' : 'reactivado'}`)
    } catch (err) {
      showToast(`Error: ${(err as Error).message}`)
    }
  }

  const handleUpdateUserRole = async (userId: string, role: UserRole) => {
    if (!currentUser) return
    const user = users.find(u => u.id === userId)
    try {
      await patchUsuarioRol(currentUser.id, userId, DISPLAY_ROL[role])
      await fetchData(currentUser)
      showToast(`🛡️ Rol de ${user?.name} actualizado a: ${role}`)
    } catch (err) {
      showToast(`Error: ${(err as Error).message}`)
    }
  }

  const handleRefresh = async () => {
    if (!currentUser) return
    await fetchData(currentUser)
    showToast('🔄 Datos actualizados desde la API')
  }

  const handleCreateUser = async (payload: NuevoUsuarioPayload) => {
    if (!currentUser) return
    try {
      await postUsuario(currentUser.id, payload)
      await fetchData(currentUser)
      showToast(`✅ Usuario ${payload.nombre} creado correctamente`)
    } catch (err) {
      showToast(`Error: ${(err as Error).message}`)
    }
  }

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {toastMessage && (
        <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 md:max-w-md bg-slate-900 text-white rounded-xl py-3.5 px-4 z-[999] shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-full bg-blue-500/25 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
            ℹ️
          </div>
          <p className="text-xs font-semibold leading-relaxed">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-auto text-slate-400 hover:text-white font-extrabold text-sm"
          >
            ×
          </button>
        </div>
      )}

      <NavigationHeader
        currentUser={currentUser}
        onLogout={handleLogout}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <main className="flex-grow">
        {currentPage === 'driver-map' && (
          <DriverMapBooking
            slots={slots}
            onReserve={handleReserve}
            activeReservation={activeCheckIn}
          />
        )}
        {currentPage === 'driver-checkin' && (
          <DriverLocationCheckIn
            slots={slots}
            onCheckIn={handleCheckIn}
          />
        )}
        {currentPage === 'driver-incident' && (
          <DriverReportIncident
            onAddIncident={handleAddIncident}
          />
        )}
        {currentPage === 'staff-live' && (
          <StaffDashboard
            slots={slots}
            incidents={incidents}
            onResolveIncident={handleResolveIncident}
            onUpdateSlotStatus={handleUpdateSlotStatus}
            onRefresh={handleRefresh}
          />
        )}
        {currentPage === 'staff-map' && (
          <StaffGridOccupancy
            slots={slots}
            onUpdateSlotStatus={handleUpdateSlotStatus}
          />
        )}
        {currentPage === 'staff-users' && (
          <StaffUsersManagement
            currentUser={currentUser}
            users={users}
            onToggleUserActive={handleToggleUserActive}
            onUpdateUserRole={handleUpdateUserRole}
            onCreateUser={handleCreateUser}
          />
        )}
      </main>
    </div>
  )
}
