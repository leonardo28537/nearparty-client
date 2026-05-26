import { MapPin, Users, Calendar, X, ArrowRight, Clock } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import clsx from 'clsx'

const CATEGORY_COLORS = {
  party:    { dot: 'bg-spark', badge: 'badge-spark',  label: 'Fiesta'    },
  social:   { dot: 'bg-emerald-400', badge: 'badge-green', label: 'Social' },
  meetup:   { dot: 'bg-blue-400', badge: 'badge-muted', label: 'Meetup'  },
  concert:  { dot: 'bg-blaze', badge: 'badge-blaze', label: 'Concierto' },
  default:  { dot: 'bg-ink-400', badge: 'badge-muted', label: 'Evento'  },
}

export const EventCard = ({ event, compact, onClick, onClose, onView }) => {
  const cat   = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.default
  const date  = new Date(event.starts_at)
  const spots = event.max_guests - (event.guest_count || 0)

  if (compact) return (
    <button
      onClick={onClick}
      className="card-hover min-w-[240px] max-w-[260px] flex-shrink-0 p-4 text-left
                 group cursor-pointer"
    >
      {/* Category dot + title */}
      <div className="flex items-start gap-2 mb-3">
        <span className={clsx('w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-pulse-dot', cat.dot)} />
        <div>
          <h4 className="font-display font-semibold text-sm text-ink-100 leading-snug
                         group-hover:text-spark transition-colors line-clamp-1">
            {event.title}
          </h4>
          <p className="text-xs text-ink-500 mt-0.5 line-clamp-1">
            {event.address || 'Ubicación privada'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-ink-500">
          <Clock size={10} />
          {formatDistanceToNow(date, { addSuffix: true, locale: es })}
        </span>
        <span className={clsx('text-xs', spots > 0 ? 'text-emerald-400' : 'text-blaze')}>
          {spots > 0 ? `${spots} lugares` : 'Completo'}
        </span>
      </div>
    </button>
  )

  // Full card (detail sheet)
  return (
    <div className="card grain-overlay p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={clsx('w-2.5 h-2.5 rounded-full animate-pulse-dot', cat.dot)} />
          <span className={cat.badge}>{cat.label}</span>
        </div>
        <button onClick={onClose} className="btn-ghost !px-2 !py-2 text-ink-600">
          <X size={14} />
        </button>
      </div>

      <h3 className="font-display font-bold text-xl text-ink-100 mb-1">{event.title}</h3>
      <p className="text-ink-400 text-sm mb-4 line-clamp-2">{event.description}</p>

      <div className="flex flex-col gap-2 mb-5">
        <div className="flex items-center gap-2 text-sm text-ink-400">
          <Calendar size={13} className="text-ink-600 flex-shrink-0" />
          {format(date, "d 'de' MMMM · HH:mm", { locale: es })}
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-400">
          <MapPin size={13} className="text-ink-600 flex-shrink-0" />
          {event.address || 'Ubicación privada'}
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-400">
          <Users size={13} className="text-ink-600 flex-shrink-0" />
          {event.guest_count || 0} / {event.max_guests} asistentes
          {spots > 0
            ? <span className="text-emerald-400 text-xs ml-1">· {spots} disponibles</span>
            : <span className="text-blaze text-xs ml-1">· Completo</span>
          }
        </div>
      </div>

      {/* Host */}
      <div className="flex items-center gap-2 p-3 bg-ink-900/60 rounded-xl mb-4">
        <div className="w-7 h-7 rounded-full bg-ink-700 border border-[var(--border)]
                        flex items-center justify-center text-xs font-display font-bold text-ink-300">
          {event.host_name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div className="text-xs text-ink-500">Organizado por</div>
          <div className="text-sm font-medium text-ink-200">{event.host_name}</div>
        </div>
      </div>

      <button onClick={onView} className="btn-primary w-full group">
        Ver evento
        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  )
}
