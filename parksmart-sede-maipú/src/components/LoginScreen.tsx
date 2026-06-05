import { useEffect, useState } from 'react'
import { ApiUsuario, fetchUsuariosPublico } from '../api'

interface LoginScreenProps {
  onLogin: (user: ApiUsuario) => void
}

const ROL_LABEL: Record<string, string> = {
  conductor: '🚘 Conductor',
  guardia: '💼 Guardia',
  jefe_seguridad: '👮 Jefe Seguridad',
  jefe_servicios_generales: '🛠️ Jefe Servicios Gral.',
  super_admin: '🛡️ Super Admin',
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [usuarios, setUsuarios] = useState<ApiUsuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsuariosPublico()
      .then(setUsuarios)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#00288e] rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-lg">
            P
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ParkSmart</h1>
          <p className="text-xs text-gray-500 font-medium">Sede Maipú — Selecciona tu perfil para continuar</p>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-[#00288e]/30 border-t-[#00288e] rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Conectando con la API...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-xs font-semibold text-red-700">Error de conexión</p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
            <p className="text-[10px] text-red-400 mt-2">Asegúrate de que parking-api esté corriendo en el puerto 3000</p>
          </div>
        )}

        {!loading && !error && usuarios.length === 0 && (
          <p className="text-center text-sm text-gray-500">No hay usuarios registrados en la base de datos.</p>
        )}

        <div className="space-y-2">
          {usuarios.map(u => (
            <button
              key={u.id}
              onClick={() => onLogin(u)}
              className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#00288e] hover:shadow-sm transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#00288e] font-bold text-sm shrink-0 group-hover:bg-blue-100 transition-colors">
                {u.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{u.nombre}</p>
                <p className="text-xs text-gray-500">{ROL_LABEL[u.rol] ?? u.rol}</p>
              </div>
              <span className="text-gray-300 group-hover:text-[#00288e] transition-colors text-lg">›</span>
            </button>
          ))}
        </div>

        <p className="text-center text-[10px] text-gray-400">
          DuocUC Sede Maipú · Sistema de Gestión de Estacionamientos
        </p>
      </div>
    </div>
  )
}
