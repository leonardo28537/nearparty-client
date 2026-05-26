import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

export const LoginPage = () => {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login, loading } = useAuthStore()
  const from = location.state?.from?.pathname || '/map'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form.email, form.password)
    if (result.ok) {
      navigate(from, { replace: true })
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen grain-overlay flex">
      {/* Left — decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-ink-900
                      border-r border-[var(--border)] p-12 relative overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full
                        bg-spark/8 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full
                        bg-blaze/6 blur-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <span className="w-9 h-9 rounded-xl bg-spark flex items-center justify-center">
            <Zap size={18} className="text-ink-900" strokeWidth={2.5} />
          </span>
          <span className="font-display font-bold text-xl text-ink-100 tracking-tight">
            Near<span className="text-spark">Party</span>
          </span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 stagger">
          <p className="text-xs font-display font-semibold uppercase tracking-[0.2em]
                        text-spark mb-4">
            Conecta. Explora. Vive.
          </p>
          <h1 className="font-display font-bold text-5xl leading-tight text-ink-100 mb-6">
            Las mejores
            <br />
            <span className="text-spark">fiestas</span>
            <br />
            están cerca.
          </h1>
          <p className="text-ink-400 text-base leading-relaxed max-w-sm">
            Encuentra eventos sociales a tu alrededor, conoce gente nueva
            y vive experiencias únicas en tu ciudad.
          </p>
        </div>

        {/* Stats row */}
        <div className="relative z-10 flex gap-8">
          {[
            { n: '2.4K', label: 'eventos activos' },
            { n: '18K', label: 'usuarios' },
            { n: '94%', label: 'satisfacción' },
          ].map(({ n, label }) => (
            <div key={label}>
              <div className="font-display font-bold text-2xl text-spark">{n}</div>
              <div className="text-xs text-ink-500 uppercase tracking-wider mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <span className="w-8 h-8 rounded-lg bg-spark flex items-center justify-center">
              <Zap size={15} className="text-ink-900" strokeWidth={2.5} />
            </span>
            <span className="font-display font-bold text-lg text-ink-100">
              Near<span className="text-spark">Party</span>
            </span>
          </div>

          <h2 className="font-display font-bold text-3xl text-ink-100 mb-1">
            Bienvenido de nuevo
          </h2>
          <p className="text-ink-400 text-sm mb-8">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-spark hover:underline font-medium">
              Regístrate gratis
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Correo electrónico</label>
              <input
                className="input"
                type="email"
                placeholder="tú@ejemplo.com"
                value={form.email}
                onChange={set('email')}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  className="input pr-11"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-ink-500 hover:text-ink-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-ink-900/30 border-t-ink-900
                                   rounded-full animate-spin" />
                  Entrando…
                </span>
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-ink-600 mt-8">
            Al continuar aceptas nuestros{' '}
            <a href="#" className="text-ink-500 hover:text-ink-300">Términos</a>
            {' '}y{' '}
            <a href="#" className="text-ink-500 hover:text-ink-300">Privacidad</a>
          </p>
        </div>
      </div>
    </div>
  )
}
