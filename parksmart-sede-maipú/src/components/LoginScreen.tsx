import { useState, FormEvent } from 'react'
import { ApiUsuario, RegisterPayload, postLogin, postRegister } from '../api'
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'

interface LoginScreenProps {
  onLogin: (user: ApiUsuario) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  // Login state
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')

  // Register state
  const [reg, setReg] = useState<RegisterPayload>({
    rut: '', nombre: '', correo: '', password: '', patente_asociada: '', telefono: ''
  })
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const switchMode = (m: 'login' | 'register') => {
    setMode(m)
    setError(null)
    setShowPassword(false)
    setShowRegPassword(false)
  }

  const handleLogin = async (e: FormEvent) => {
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

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (reg.password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (reg.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    try {
      const user = await postRegister({
        ...reg,
        correo: reg.correo.trim(),
        patente_asociada: reg.patente_asociada || undefined,
        telefono: reg.telefono || undefined,
      })
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

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#00288e] rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-lg">
            P
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ParkSmart</h1>
          <p className="text-xs text-gray-500 font-medium">Sede Maipú</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-[#00288e] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-[#00288e] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* ── LOGIN ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
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
                  className="w-full px-4 py-3 pr-11 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00288e] focus:border-transparent transition-all shadow-xs placeholder-gray-400"
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
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        )}

        {/* ── REGISTER ── */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">RUT *</label>
                <input
                  required
                  value={reg.rut}
                  onChange={e => setReg(r => ({ ...r, rut: e.target.value }))}
                  placeholder="12.345.678-9"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00288e] focus:border-transparent transition-all shadow-xs placeholder-gray-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">Patente</label>
                <input
                  value={reg.patente_asociada}
                  onChange={e => setReg(r => ({ ...r, patente_asociada: e.target.value.toUpperCase() }))}
                  placeholder="ABCD-12"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00288e] focus:border-transparent transition-all shadow-xs placeholder-gray-400 uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">Nombre completo *</label>
              <input
                required
                value={reg.nombre}
                onChange={e => setReg(r => ({ ...r, nombre: e.target.value }))}
                placeholder="Juan Pérez Silva"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00288e] focus:border-transparent transition-all shadow-xs placeholder-gray-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">Correo electrónico *</label>
              <input
                required
                type="email"
                autoComplete="email"
                value={reg.correo}
                onChange={e => setReg(r => ({ ...r, correo: e.target.value }))}
                placeholder="usuario@duocuc.cl"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00288e] focus:border-transparent transition-all shadow-xs placeholder-gray-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">Contraseña *</label>
              <div className="relative">
                <input
                  required
                  type={showRegPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={reg.password}
                  onChange={e => setReg(r => ({ ...r, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-2.5 pr-11 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00288e] focus:border-transparent transition-all shadow-xs placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">Confirmar contraseña *</label>
              <input
                required
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00288e] focus:border-transparent transition-all shadow-xs placeholder-gray-400"
              />
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
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>

            <p className="text-center text-[10px] text-gray-400">
              Las cuentas nuevas se registran como <b>Conductor</b>.
            </p>
          </form>
        )}

        <p className="text-center text-[10px] text-gray-400">
          DuocUC Sede Maipú · Sistema de Gestión de Estacionamientos
        </p>
      </div>
    </div>
  )
}
