import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Calendar, Users, CheckCircle2, XCircle, Clock, ChevronRight, Loader } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useEventsStore } from '@/stores/eventsStore'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export const DashboardPage = () => {
  const navigate   = useNavigate()
  const { user }   = useAuthStore()
  const { updateApplicationStatus } = useEventsStore()

  const [myEvents, setMyEvents]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [active, setActive]       = useState(null) // selected event for details

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/events/mine')
        setMyEvents(data.events || [])
        if (data.events?.length) setActive(data.events[0].id)
      } catch (err) {
        toast.error('Error cargando eventos')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleStatus = async (eventId, appId, status) => {
    const result = await updateApplicationStatus(eventId, appId, status)
    if (result.ok) {
      setMyEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId
            ? {
                ...ev,
                applications: ev.applications.map((a) =>
                  a.id === appId ? { ...a, status } : a
                ),
              }
            : ev
        )
      )
      toast.success(status === 'accepted' ? 'Invitado aceptado' : 'Solicitud rechazada')
    }
  }

  const activeEvent = myEvents.find((e) => e.id === active)
  const pendingApps = activeEvent?.applications?.filter((a) => a.status === 'pending') || []
  const acceptedApps = activeEvent?.applications?.filter((a) => a.status === 'accepted') || []

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader size={20} className="text-spark animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <p className="text-xs font-display font-semibold uppercase tracking-[0.2em] text-spark mb-1">
              Panel
            </p>
            <h1 className="font-display font-bold text-3xl text-ink-100">
              Mis eventos
            </h1>
          </div>
          <button onClick={() => navigate('/dashboard/new')} className="btn-primary">
            <Plus size={15} />
            Nuevo evento
          </button>
        </div>

        {myEvents.length === 0 ? (
          <div className="card grain-overlay p-12 text-center animate-fade-up">
            <Calendar size={40} className="text-ink-700 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-lg text-ink-300 mb-2">
              Aún no has organizado eventos
            </h3>
            <p className="text-ink-500 text-sm mb-6">
              Crea tu primer evento y conecta con personas cercanas.
            </p>
            <button onClick={() => navigate('/dashboard/new')} className="btn-primary mx-auto">
              <Plus size={15} /> Crear evento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Event list sidebar */}
            <div className="lg:col-span-1 space-y-2">
              <h2 className="font-display font-semibold text-xs uppercase tracking-wider
                             text-ink-500 px-1 mb-3">
                Tus eventos ({myEvents.length})
              </h2>
              {myEvents.map((ev) => {
                const pending = ev.applications?.filter((a) => a.status === 'pending').length || 0
                return (
                  <button
                    key={ev.id}
                    onClick={() => setActive(ev.id)}
                    className={clsx(
                      'w-full text-left p-4 rounded-xl border transition-all duration-200',
                      active === ev.id
                        ? 'bg-ink-700/80 border-spark/30 shadow-[0_0_0_1px_rgba(255,204,77,0.15)]'
                        : 'bg-ink-800/40 border-[var(--border)] hover:bg-ink-800 hover:border-[var(--border-2)]'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-display font-semibold text-sm text-ink-100 line-clamp-1">
                        {ev.title}
                      </span>
                      <ChevronRight size={12} className="text-ink-600 flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-ink-500">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {formatDistanceToNow(new Date(ev.starts_at), { addSuffix: true, locale: es })}
                      </span>
                      {pending > 0 && (
                        <span className="badge-spark !text-[10px] !px-1.5 !py-0.5">
                          {pending} pendiente{pending > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Event detail */}
            {activeEvent && (
              <div className="lg:col-span-2 space-y-4">
                {/* Event info */}
                <div className="card grain-overlay p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="font-display font-bold text-xl text-ink-100">
                      {activeEvent.title}
                    </h2>
                    <Link
                      to={`/events/${activeEvent.id}`}
                      className="btn-ghost !px-2.5 !py-1.5 text-xs gap-1"
                    >
                      Ver público
                    </Link>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-0">
                    {[
                      { label: 'Confirmados', value: acceptedApps.length, color: 'text-emerald-400' },
                      { label: 'Pendientes',  value: pendingApps.length,  color: 'text-spark' },
                      { label: 'Capacidad',   value: `${acceptedApps.length}/${activeEvent.max_guests}`, color: 'text-ink-300' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-ink-900/60 rounded-xl p-3 text-center">
                        <div className={clsx('font-display font-bold text-2xl', color)}>{value}</div>
                        <div className="text-xs text-ink-500 mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending applications */}
                {pendingApps.length > 0 && (
                  <div className="card p-5">
                    <h3 className="font-display font-semibold text-sm uppercase tracking-wider
                                   text-ink-400 mb-3">
                      Solicitudes pendientes
                    </h3>
                    <div className="space-y-2">
                      {pendingApps.map((app) => (
                        <div key={app.id}
                          className="flex items-center gap-3 p-3 bg-ink-900/40
                                     rounded-xl border border-[var(--border)]">
                          <div className="w-8 h-8 rounded-full bg-ink-700 border border-[var(--border-2)]
                                          flex items-center justify-center text-xs font-bold text-ink-300">
                            {app.user_name?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-ink-200">{app.user_name}</div>
                            {app.message && (
                              <p className="text-xs text-ink-500 truncate">{app.message}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleStatus(activeEvent.id, app.id, 'rejected')}
                              className="w-8 h-8 rounded-lg bg-blaze/10 border border-blaze/20
                                         flex items-center justify-center text-blaze
                                         hover:bg-blaze/20 transition-colors"
                            >
                              <XCircle size={14} />
                            </button>
                            <button
                              onClick={() => handleStatus(activeEvent.id, app.id, 'accepted')}
                              className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20
                                         flex items-center justify-center text-emerald-400
                                         hover:bg-emerald-500/20 transition-colors"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accepted guests */}
                {acceptedApps.length > 0 && (
                  <div className="card p-5">
                    <h3 className="font-display font-semibold text-sm uppercase tracking-wider
                                   text-ink-400 mb-3">
                      Lista de invitados ({acceptedApps.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {acceptedApps.map((app) => (
                        <div key={app.id}
                          className="flex items-center gap-1.5 bg-emerald-500/5 border
                                     border-emerald-500/15 px-3 py-1.5 rounded-full">
                          <div className="w-4 h-4 rounded-full bg-emerald-900/50
                                          flex items-center justify-center text-[9px] font-bold text-emerald-400">
                            {app.user_name?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-xs text-ink-300">{app.user_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
