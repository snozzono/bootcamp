import { ApiUsuario, ROL_DISPLAY } from '../api'
import { LogOut } from 'lucide-react'

const ROL_LABEL: Record<string, string> = {
  conductor: 'Conductor',
  guardia: 'Guardia',
  jefe_seguridad: 'Jefe Seguridad',
  jefe_servicios_generales: 'Jefe Servicios Gral.',
  super_admin: 'Super Admin',
}

interface NavigationHeaderProps {
  currentUser: ApiUsuario
  onLogout: () => void
  currentPage: string
  onPageChange: (page: string) => void
}

export default function NavigationHeader({
  currentUser,
  onLogout,
  currentPage,
  onPageChange,
}: NavigationHeaderProps) {
  const isStaff = currentUser.rol !== 'conductor'

  return (
    <div className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 shadow-xs">
      <header className="px-4 py-3 max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#00288e] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
            P
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
              ParkSmart{' '}
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                {isStaff ? 'Admin' : 'Sede Maipú'}
              </span>
            </h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Sede Maipú</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          {!isStaff ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange('driver-map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === 'driver-map' ? 'bg-[#00288e] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Mapa & Reservas
              </button>
              <button
                onClick={() => onPageChange('driver-incident')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === 'driver-incident'
                    ? 'bg-red-50 text-red-700 border border-red-100'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Reportar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange('staff-live')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === 'staff-live' ? 'bg-[#00288e] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Dashboard en Vivo
              </button>
              <button
                onClick={() => onPageChange('staff-map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === 'staff-map' ? 'bg-[#00288e] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Mapa de Ocupación
              </button>
              {currentUser.rol !== 'guardia' && (
                <button
                  onClick={() => onPageChange('staff-users')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentPage === 'staff-users' ? 'bg-[#00288e] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Usuarios
                </button>
              )}
            </div>
          )}

          <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="hidden md:inline-block text-right">
              <p className="text-xs font-semibold text-gray-800">{currentUser.nombre}</p>
              <p className="text-[10px] text-gray-500 font-medium">{ROL_LABEL[currentUser.rol] ?? currentUser.rol}</p>
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#00288e] font-bold text-sm border border-gray-200 shadow-xs">
              {currentUser.nombre.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
    </div>
  )
}
