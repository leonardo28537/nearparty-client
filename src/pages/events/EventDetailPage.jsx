import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, Users, MessageCircle, CheckCircle2, Clock, Loader } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useEventsStore } from '@/stores/eventsStore'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_MAP = {
  pending:  { label: 'Solicitud enviada', className: 'badge-muted' },
  accepted: { label: 'Aceptado',          className: 'badge-green' },
  rejected: { label: 'No aceptado',       className: 'badge-blaze' },
}

export const EventDetailPage = () => {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { activeEvent, fetchById, applyToEvent, loading } = useEventsStore()

  const [applying, setApplying]         = useState(false)
  const [myApplication, setMyApplication] = useState(null)

  useEffect(() => {
    fetchById(id).then((ev) => {
      if (ev) {
        const mine = ev.applications?.find((a) => a.user_id === user?.id)
        setMyApplication(mine || null)
      }
    })
  }, [id])

  const handleApply = async () => {
    setApplying(true)
    const result = await applyToEvent(id)
    if (result.ok) {
      setMyApplication(result.application)
      toast.success('¡Solicitud enviada al organizador!')
    } else {
      toast.error(result.error || 'Error al enviar solicitud')
    }
    setApplying(false)
  }

  if (loading || !activeEvent) return (
    <div className="h-screen flex items-center justify-center">
      <Loader size={20} className="text-spark animate-spin" />
    </div>
  )

  const event   = activeEvent
  const date    = new Date(event.starts_at)
  const spots   = event.max_guests - (event.guest_count || 0)
  const isHost  = event.host_id === user?.id
  const isFull  = spots <= 0

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-up">
        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="btn-ghost !px-2 !py-2 mb-6 text-ink-500 hover:text-ink-200">
          <ArrowLeft size={16} />
          <span className="text-sm">Volver</span>
        </button>

        {/* Header */}
        <div className="card grain-overlay p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge-spark">{event.category || 'Evento'}</span>
            {isFull && <span className="badge-blaze">Completo</span>}
          </div>

          <h1 className="font-display font-bold text-3xl text-ink-100 mb-2">
            {event.title}
          </h1>
          <p className="text-ink-400 leading-relaxed mb-6">{event.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Calendar, label: format(date, "d MMM · HH:mm", { locale: es }) },
              { icon: MapPin,   label: event.address || 'Ubicación privada' },
              { icon: Users,    label: `${event.guest_count || 0} / ${event.max_guests}` },
            ].map(({ icon: Icon, label }) => (
              <div key={label}
                className="flex items-center gap-2.5 bg-ink-900/60 rounded-xl px-3 py-2.5">
                <Icon size={14} className="text-ink-600 flex-shrink-0" />
                <span className="text-sm text-ink-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Host */}
        <div className="card p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-ink-700 border border-[var(--border-2)]
                          flex items-center justify-center font-display font-bold text-ink-300">
            {event.host_name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="text-xs text-ink-500">Organizado por</div>
            <div className="font-display font-semibold text-ink-100">{event.host_name}</div>
          </div>
          {isHost && <span className="badge-spark">Tú</span>}
        </div>

        {/* Guests list (accepted) */}
        {event.applications?.some((a) => a.status === 'accepted') && (
          <div className="card p-4 mb-4">
            <h3 className="font-display font-semibold text-sm text-ink-300 mb-3 uppercase tracking-wider">
              Confirmados
            </h3>
            <div className="flex flex-wrap gap-2">
              {event.applications
                .filter((a) => a.status === 'accepted')
                .map((a) => (
                  <div key={a.id}
                    className="flex items-center gap-1.5 bg-ink-900/60 px-2.5 py-1.5 rounded-full">
                    <div className="w-5 h-5 rounded-full bg-emerald-900/50 border border-emerald-500/30
                                    flex items-center justify-center text-[10px] font-bold text-emerald-400">
                      {a.user_name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs text-ink-300">{a.user_name}</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {isHost ? (
            <Link to={`/dashboard/events/${id}`} className="btn-primary w-full">
              Gestionar evento
            </Link>
          ) : myApplication ? (
            <div className={clsx('flex items-center gap-3 p-4 rounded-xl border',
              myApplication.status === 'accepted'
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-ink-800/60 border-[var(--border)]'
            )}>
              <CheckCircle2 size={18}
                className={myApplication.status === 'accepted' ? 'text-emerald-400' : 'text-ink-500'} />
              <div>
                <div className="text-sm font-display font-semibold text-ink-200">
                  {STATUS_MAP[myApplication.status]?.label || 'Pendiente'}
                </div>
                <div className="text-xs text-ink-500">
                  {myApplication.status === 'pending' && 'El organizador revisará tu solicitud'}
                  {myApplication.status === 'accepted' && '¡Estás en la lista!'}
                  {myApplication.status === 'rejected' && 'No fuiste seleccionado esta vez'}
                </div>
              </div>
              <span className={clsx('ml-auto', STATUS_MAP[myApplication.status]?.className)}>
                {STATUS_MAP[myApplication.status]?.label}
              </span>
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying || isFull}
              className="btn-primary w-full"
            >
              {applying ? (
                <><span className="w-4 h-4 border-2 border-ink-900/30 border-t-ink-900 rounded-full animate-spin" /> Enviando…</>
              ) : isFull ? 'Sin lugares disponibles' : 'Solicitar unirme'}
            </button>
          )}

          {/* Chat — only for accepted guests or host */}
          {(isHost || myApplication?.status === 'accepted') && (
            <Link to={`/chat/${id}`} className="btn-secondary w-full gap-2">
              <MessageCircle size={15} />
              Chat del evento
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
