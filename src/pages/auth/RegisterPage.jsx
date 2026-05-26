import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, ArrowRight, MapPin } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// ── Definido FUERA del componente — no se re-crea en cada render ──
const Field = ({ id, label, type = 'text', placeholder, value, onChange, error, suffix }) => (
  <div>
    <label htmlFor={id} className="label">{label}</label>
    <div className="relative">
      <input
        id={id}
        name={id}
        className={clsx(
          'input',
          suffix && 'pr-11',
          error && 'border-blaze/50 focus:border-blaze/70 focus:shadow-[0_0_0_3px_rgba(255,96,68,0.1)]'
        )}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={id}
      />
      {suffix}
    </div>
    {error && (
      <p className="text-xs text-blaze mt-1.5">{error}</p>
    )}
  </div>
)

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { register, loading } = useAuthStore()

  const [form,     setForm]     = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [errors,   setErrors]   = useState({})

  const handleChange = (k) => (e) => {
    setForm((p)   => ({ ...p, [k]: e.target.value }))
    setErrors((p) => ({ ...p, [k]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())                  e.name     = 'El nombre es obligatorio'
    if (!/\S+@\S+\.\S+/.test(form.email))   e.email    = 'Email inválido'
    if (form.password.length < 8)           e.password = 'Mínimo 8 caracteres'
    if (form.password !== form.confirm)     e.confirm  = 'Las contraseñas no coinciden'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const result = await register({
      name:     form.name,
      email:    form.email,
      password: form.password,
    })

    if (result.ok) {
      toast.success('¡Bienvenido a NearParty!')
      navigate('/map')
    } else {
      toast.error(result.error)
    }
  }

  const eyeButton = (
    <button
      type="button"
      onClick={() => setShowPass((p) => !p)}
      className="absolute right-3 top-1/2 -translate-y-1/2
                 text-ink-500 hover:text-ink-300 transition-colors"
    >
      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  )

  return (
    <div className="min-h-screen grain-overlay flex items-center justify-center p-6">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full
                      bg-spark/5 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 rounded-full
                      bg-blaze/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        {/* Logo */}
        <Link to="/login" className="flex items-center gap-2 mb-10">
          <span className="w-8 h-8 rounded-lg bg-spark flex items-center justify-center">
            <Zap size={15} className="text-ink-900" strokeWidth={2.5} />
          </span>
          <span className="font-display font-bold text-lg text-ink-100">
            Near<span className="text-spark">Party</span>
          </span>
        </Link>

        <div className="card p-8 grain-overlay">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-2xl text-ink-100 mb-1">
                Crea tu cuenta
              </h2>
              <p className="text-ink-400 text-sm">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-spark hover:underline font-medium">
                  Inicia sesión
                </Link>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-ink-700 border border-[var(--border)]
                            flex items-center justify-center">
              <MapPin size={18} className="text-spark" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              id="name"
              label="Nombre"
              placeholder="Tu nombre"
              value={form.name}
              onChange={handleChange('name')}
              error={errors.name}
            />
            <Field
              id="email"
              label="Correo electrónico"
              type="email"
              placeholder="tú@ejemplo.com"
              value={form.email}
              onChange={handleChange('email')}
              error={errors.email}
            />
            <Field
              id="password"
              label="Contraseña"
              type={showPass ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={handleChange('password')}
              error={errors.password}
              suffix={eyeButton}
            />
            <Field
              id="confirm"
              label="Confirmar contraseña"
              type={showPass ? 'text' : 'password'}
              placeholder="Repite tu contraseña"
              value={form.confirm}
              onChange={handleChange('confirm')}
              error={errors.confirm}
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-ink-900/30 border-t-ink-900
                                   rounded-full animate-spin" />
                  Creando cuenta…
                </span>
              ) : (
                <>
                  Crear cuenta
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-600 mt-6">
          Al registrarte aceptas nuestros{' '}
          <a href="#" className="text-ink-500 hover:text-ink-300">Términos de servicio</a>
          {' '}y{' '}
          <a href="#" className="text-ink-500 hover:text-ink-300">Política de privacidad</a>
        </p>
      </div>
    </div>
  )
}
