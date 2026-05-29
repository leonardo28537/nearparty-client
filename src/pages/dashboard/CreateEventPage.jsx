import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Loader, Calendar, Users, FileText, Tag, Navigation } from 'lucide-react'
import mapboxgl from 'mapbox-gl'
import { useEventsStore }  from '@/stores/eventsStore'
import { useGeolocation }  from '@/hooks/useGeolocation'
import toast from 'react-hot-toast'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

const CATEGORIES = [
  { value: 'party',   label: '🎉 Fiesta'    },
  { value: 'social',  label: '☕ Social'    },
  { value: 'meetup',  label: '🤝 Meetup'   },
  { value: 'concert', label: '🎵 Concierto' },
  { value: 'sport',   label: '⚽ Deporte'   },
  { value: 'other',   label: '✨ Otro'      },
]

export const CreateEventPage = () => {
  const navigate = useNavigate()
  const { createEvent } = useEventsStore()
  const { coords, loading: geoLoading } = useGeolocation()

  const mapRef       = useRef(null)
  const markerRef    = useRef(null)
  const containerRef = useRef(null)
  const mapInitialized = useRef(false)

  const [form, setForm] = useState({
    title: '', description: '', category: 'party',
    starts_at: '', max_guests: 10,
    address: '', latitude: null, longitude: null, private: false,
  })
  const [saving, setSaving] = useState(false)

  // Fecha minima = ahora mismo
  const minDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked
             : e.target.type === 'number'  ? +e.target.value
             : e.target.value
    setForm((p) => ({ ...p, [k]: v }))
  }

  // ── Inicializa el mapa UNA sola vez cuando llegan las coords GPS ──
  useEffect(() => {
    if (!coords || mapInitialized.current) return
    mapInitialized.current = true

    // Guarda las coords GPS en el formulario inmediatamente
    setForm((p) => ({ ...p, latitude: coords.lat, longitude: coords.lng }))

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style:     'mapbox://styles/mapbox/dark-v11',
      center:    [coords.lng, coords.lat],
      zoom:      15,
    })

    // Marcador draggable en tu ubicación GPS real
    const el = document.createElement('div')
    el.style.cssText = `
      width:28px;height:28px;border-radius:50%;
      background:#ffcc4d;border:3px solid #201e17;
      box-shadow:0 0 0 4px rgba(255,204,77,0.3);
      cursor:grab;
    `

    markerRef.current = new mapboxgl.Marker({ element: el, draggable: true })
      .setLngLat([coords.lng, coords.lat])
      .addTo(mapRef.current)

    // Actualiza coords al arrastrar el marcador
    markerRef.current.on('dragend', () => {
      const { lat, lng } = markerRef.current.getLngLat()
      setForm((p) => ({ ...p, latitude: lat, longitude: lng }))
    })

    // Actualiza coords al hacer clic en el mapa
    mapRef.current.on('click', (e) => {
      markerRef.current?.setLngLat([e.lngLat.lng, e.lngLat.lat])
      setForm((p) => ({ ...p, latitude: e.lngLat.lat, longitude: e.lngLat.lng }))
    })
  }, [coords])

  const resetToMyLocation = () => {
    if (!coords || !markerRef.current || !mapRef.current) return
    markerRef.current.setLngLat([coords.lng, coords.lat])
    mapRef.current.flyTo({ center: [coords.lng, coords.lat], zoom: 15 })
    setForm((p) => ({ ...p, latitude: coords.lat, longitude: coords.lng }))
    toast.success('Pin vuelto a tu ubicación')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.latitude || !form.longitude) {
      return toast.error('Selecciona una ubicación en el mapa')
    }
    if (!form.starts_at) {
      return toast.error('Indica la fecha y hora del evento')
    }
    if (!form.title.trim()) {
      return toast.error('El título es obligatorio')
    }

    setSaving(true)
    const result = await createEvent(form)
    if (result.ok) {
      toast.success('¡Evento creado!')
      navigate(`/events/${result.event.id}`)
    } else {
      toast.error(result.error || 'Error al crear el evento')
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-up">
        <button onClick={() => navigate(-1)}
          className="btn-ghost !px-2 !py-2 mb-6 text-ink-500 hover:text-ink-200">
          <ArrowLeft size={16} />
          <span className="text-sm">Volver</span>
        </button>

        <div className="mb-8">
          <p className="text-xs font-display font-semibold uppercase tracking-[0.2em] text-spark mb-1">
            Organizar
          </p>
          <h1 className="font-display font-bold text-3xl text-ink-100">Nuevo evento</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Título */}
          <div>
            <label className="label flex items-center gap-2">
              <FileText size={11} /> Título del evento
            </label>
            <input className="input" placeholder="Ej: Fiesta en la azotea 🎉"
              value={form.title} onChange={set('title')} required />
          </div>

          {/* Descripción */}
          <div>
            <label className="label">Descripción</label>
            <textarea className="input resize-none h-24"
              placeholder="Cuéntales a los invitados de qué va el evento…"
              value={form.description} onChange={set('description')} />
          </div>

          {/* Categoría */}
          <div>
            <label className="label flex items-center gap-2">
              <Tag size={11} /> Categoría
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c.value} type="button"
                  onClick={() => setForm((p) => ({ ...p, category: c.value }))}
                  className={`px-3 py-2 rounded-xl text-sm font-body border transition-all duration-200
                    ${form.category === c.value
                      ? 'bg-spark/10 border-spark/40 text-spark'
                      : 'bg-ink-800/60 border-[var(--border)] text-ink-400 hover:border-[var(--border-2)]'
                    }`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha + invitados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-2">
                <Calendar size={11} /> Fecha y hora
              </label>
              <input className="input" type="datetime-local"
                min={minDateTime}
                value={form.starts_at} onChange={set('starts_at')} required />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <Users size={11} /> Máximo invitados
              </label>
              <input className="input" type="number" min={2} max={500}
                value={form.max_guests} onChange={set('max_guests')} required />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="label flex items-center gap-2">
              <MapPin size={11} /> Dirección (opcional)
            </label>
            <input className="input" placeholder="Calle, número, ciudad…"
              value={form.address} onChange={set('address')} />
          </div>

          {/* Mapa */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label !mb-0 flex items-center gap-2">
                <MapPin size={11} /> Ubicación en el mapa
              </label>
              <button type="button" onClick={resetToMyLocation}
                className="btn-ghost !px-2 !py-1 text-xs gap-1.5 text-ink-500">
                <Navigation size={11} /> Mi ubicación
              </button>
            </div>

            {geoLoading ? (
              <div className="w-full h-56 rounded-xl border border-[var(--border)]
                              flex items-center justify-center bg-ink-800/40">
                <div className="flex items-center gap-2 text-ink-500 text-sm">
                  <Loader size={16} className="animate-spin text-spark" />
                  Obteniendo ubicación GPS…
                </div>
              </div>
            ) : (
              <div ref={containerRef}
                className="w-full h-56 rounded-xl overflow-hidden border border-[var(--border)]" />
            )}

            {form.latitude && (
              <p className="text-xs text-ink-600 mt-1.5 flex items-center gap-1">
                <MapPin size={10} />
                {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                <span className="text-emerald-500 ml-1">✓ Ubicación guardada</span>
              </p>
            )}
          </div>

          {/* Privado */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input type="checkbox" className="sr-only"
                checked={form.private} onChange={set('private')} />
              <div className={`w-10 h-5 rounded-full transition-colors duration-200
                ${form.private ? 'bg-spark' : 'bg-ink-700'}`} />
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white
                transition-transform duration-200 ${form.private ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm text-ink-300">
              Evento privado
              <span className="text-ink-600 ml-1 text-xs">(la ubicación exacta queda oculta)</span>
            </span>
          </label>

          <button type="submit" disabled={saving || !form.latitude} className="btn-primary w-full mt-2">
            {saving
              ? <><Loader size={14} className="animate-spin" /> Creando…</>
              : !form.latitude
              ? 'Esperando ubicación GPS…'
              : 'Crear evento'
            }
          </button>
        </form>
      </div>
    </div>
  )
}
