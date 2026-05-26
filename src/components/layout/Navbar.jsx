import { Link, NavLink, useNavigate } from 'react-router-dom'
import { MapPin, Calendar, MessageCircle, User, LogOut, Zap } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import clsx from 'clsx'

const NAV = [
  { to: '/map',       icon: MapPin,         label: 'Explorar'  },
  { to: '/dashboard', icon: Calendar,       label: 'Mis eventos' },
  { to: '/chat',      icon: MessageCircle,  label: 'Chat'      },
  { to: '/profile',   icon: User,           label: 'Perfil'    },
]

export const Navbar = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 flex items-center px-6
                       bg-ink-900/80 backdrop-blur-md border-b border-[var(--border)]">
      {/* Logo */}
      <Link to="/map" className="flex items-center gap-2 mr-8 select-none">
        <span className="w-7 h-7 rounded-lg bg-spark flex items-center justify-center">
          <Zap size={14} className="text-ink-900" strokeWidth={2.5} />
        </span>
        <span className="font-display font-bold text-base text-ink-100 tracking-tight">
          Near<span className="text-spark">Party</span>
        </span>
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-1 flex-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-body transition-all duration-200',
                isActive
                  ? 'bg-ink-700 text-ink-100'
                  : 'text-ink-400 hover:text-ink-200 hover:bg-ink-800'
              )
            }
          >
            <Icon size={15} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-ink-700 border border-[var(--border-2)]
                            overflow-hidden flex items-center justify-center">
              {user.avatar_url
                ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                : <span className="text-xs font-display font-bold text-ink-300">
                    {user.name?.[0]?.toUpperCase()}
                  </span>
              }
            </div>
            <span className="text-sm text-ink-300 font-body hidden lg:block">{user.name}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="btn-ghost !px-2 !py-2 text-ink-500 hover:text-blaze"
          title="Cerrar sesión"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  )
}
