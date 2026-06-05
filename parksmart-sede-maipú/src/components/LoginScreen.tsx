import { useState, FormEvent } from 'react'
import { ApiUsuario, postLogin } from '../api'
import { Eye, EyeOff, LogIn } from 'lucide-react'

interface LoginScreenProps {
  onLogin: (user: ApiUsuario) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await postLogin(correo.trim(), password)
      onLogin(user)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo y título */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#00288e] rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-lg">
            P
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ParkSmart</h1>
          <p className="text-xs text-gray-500 font-medium">Sede Maipú — Ingresa con tu cuenta</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 block" htmlFor="correo">
              Correo electrónico
            </label>
            <input
              id="correo"
              type="email"
              autoComplete="email"
              required
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              placeholder="usuario@duocuc.cl"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00288e] focus:border-transparent transition-all shadow-xs placeholder-gray-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 block" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00288e] focus:border-transparent transition-all shadow-xs placeholder-gray-400 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#00288e] hover:bg-blue-800 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Ingresar
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-400">
          DuocUC Sede Maipú · Sistema de Gestión de Estacionamientos
        </p>
      </div>
    </div>
  )
}
