import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SlidersHorizontal, Plus, MapPin, RefreshCw, Loader } from 'lucide-react'
import mapboxgl from 'mapbox-gl'
import { useEventsStore } from '@/stores/eventsStore'
import { useGeolocation } from '@/hooks/useGeolocation'
import { EventCard } from '@/components/ui/EventCard'
import { RadiusSlider } from '@/components/ui/RadiusSlider'
import clsx from 'clsx'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.placeholder'

const DARK_STYLE = 'mapbox://styles/mapbox/dark-v11'

export const MapPage = () => {
  const mapContainer = useRef(null)
  const mapRef       = useRef(null)
  const markersRef   = useRef([])
  const navigate     = useNavigate()

  const { coords, loading: geoLoading, error: geoError } = useGeolocation()
  const { nearbyEvents, fetchNearby, loading, radius, setRadius } = useEventsStore()

  const [showPanel,  setShowPanel]  = useState(false)
  const [showRadius, setShowRadius] = useState(false)
  const [selected,   setSelected]   = useState(null)

  // ── Init map ─────────────────────────────────────
  useEffect(() => {
    if (!coords || mapRef.current) return

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style:     DARK_STYLE,
      center:    [coords.lng, coords.lat],
      zoom:      13,
      pitch:     30,
    })

    // User dot
    new mapboxgl.Marker({ color: '#ffcc4d', scale: 0.9 })
      .setLngLat([coords.lng, coords.lat])
      .addTo(mapRef.current)

    // Radius circle (will be updated)
    mapRef.current.on('load', () => addRadiusCircle(coords, radius))
  }, [coords])

  // ── Fetch on location ready ───────────────────────
  useEffect(() => {
    if (coords) fetchNearby(coords.lat, coords.lng)
  }, [coords, radius])

  // ── Update markers when events change ────────────
  useEffect(() => {
    if (!mapRef.current || !nearbyEvents.length) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    nearbyEvents.forEach((event) => {
      const el = document.createElement('div')
      el.className = 'event-marker'
      el.innerHTML = `
        <div style="
          background:#201e17;border:1.5px solid rgba(255,204,77,0.4);
          border-radius:10px;padding:5px 10px;cursor:pointer;
          font-family:Syne,sans-serif;font-size:12px;font-weight:600;
          color:#e8e6de;white-space:nowrap;
          box-shadow:0 4px 16px rgba(0,0,0,0.5),0 0 0 3px rgba(255,204,77,0.08);
          transition:transform 0.15s;
        ">
          ${event.title.length > 20 ? event.title.slice(0, 20) + '…' : event.title}
        </div>
      `
      el.addEventListener('click', () => setSelected(event))
      el.style.cssText = 'transform-origin:bottom center'

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([event.longitude, event.latitude])
        .addTo(mapRef.current)

      markersRef.current.push(marker)
    })
  }, [nearbyEvents])

  const addRadiusCircle = useCallback((c, r) => {
    const map = mapRef.current
    if (!map) return

    const id = 'radius-fill'
    if (map.getLayer(id))  map.removeLayer(id)
    if (map.getLayer(id + '-stroke')) map.removeLayer(id + '-stroke')
    if (map.getSource(id)) map.removeSource(id)

    // Build GeoJSON circle
    const points = 64
    const coords_arr = []
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * 2 * Math.PI
      const dx    = (r / 111320) * Math.cos(angle) / Math.cos((c.lat * Math.PI) / 180)
      const dy    = (r / 111320) * Math.sin(angle)
      coords_arr.push([c.lng + dx, c.lat + dy])
    }

    map.addSource(id, {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords_arr] } },
    })
    map.addLayer({ id, type: 'fill', source: id,
      paint: { 'fill-color': '#ffcc4d', 'fill-opacity': 0.04 } })
    map.addLayer({ id: id + '-stroke', type: 'line', source: id,
      paint: { 'line-color': '#ffcc4d', 'line-opacity': 0.25, 'line-width': 1.5, 'line-dasharray': [4, 3] } })
  }, [])

  const handleRadiusChange = (val) => {
    setRadius(val)
    if (coords) addRadiusCircle(coords, val)
  }

  const flyToEvent = (event) => {
    mapRef.current?.flyTo({
      center: [event.longitude, event.latitude],
      zoom: 15, speed: 1.2,
    })
  }

  if (geoLoading) return (
    <div className="h-screen flex items-center justify-center bg-ink-900 gap-3">
      <Loader size={18} className="text-spark animate-spin" />
      <span className="text-ink-400 text-sm font-body">Obteniendo ubicación…</span>
    </div>
  )

  if (geoError) return (
    <div className="h-screen flex flex-col items-center justify-center bg-ink-900 gap-4 px-8 text-center">
      <MapPin size={32} className="text-ink-600" />
      <p className="text-ink-300 font-display font-semibold">Acceso a ubicación denegado</p>
      <p className="text-ink-500 text-sm">NearParty necesita tu ubicación para mostrarte eventos cercanos.</p>
      <button onClick={() => window.location.reload()} className="btn-secondary mt-2">
        <RefreshCw size={14} /> Reintentar
      </button>
    </div>
  )

  return (
    <div className="h-screen flex flex-col bg-ink-900 overflow-hidden">
      {/* Map fills everything */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Top-left controls */}
      <div className="absolute top-20 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setShowRadius((p) => !p)}
          className={clsx('btn-secondary !px-3 !py-2.5 gap-2',
            showRadius && 'border-spark/40 text-spark')}
        >
          <SlidersHorizontal size={14} />
          <span className="text-xs">{(radius / 1000).toFixed(1)} km</span>
        </button>

        {showRadius && (
          <div className="card p-4 w-52 animate-fade-in">
            <RadiusSlider value={radius} onChange={handleRadiusChange} />
          </div>
        )}
      </div>

      {/* Top-right: create event */}
      <button
        onClick={() => navigate('/dashboard/new')}
        className="absolute top-20 right-4 z-10 btn-primary !px-3 !py-2.5 gap-2 shadow-lg"
      >
        <Plus size={14} />
        <span className="text-xs">Crear evento</span>
      </button>

      {/* Bottom: event list panel */}
      <div className="absolute bottom-0 inset-x-0 z-10">
        {/* Pull bar */}
        <button
          onClick={() => setShowPanel((p) => !p)}
          className="w-full flex items-center justify-center py-3 gap-2
                     text-ink-500 hover:text-ink-300 transition-colors"
        >
          <div className="w-8 h-1 rounded-full bg-ink-600" />
        </button>

        <div className={clsx(
          'transition-all duration-500 ease-out overflow-hidden',
          showPanel ? 'max-h-[55vh]' : 'max-h-0'
        )}>
          <div className="bg-ink-900/95 backdrop-blur-md border-t border-[var(--border)] px-4 pb-6">
            <div className="flex items-center justify-between py-4">
              <h3 className="font-display font-semibold text-ink-100">
                {loading ? 'Buscando…' : `${nearbyEvents.length} eventos cercanos`}
              </h3>
              <button onClick={() => fetchNearby(coords.lat, coords.lng)}
                      className="btn-ghost !px-2 !py-1.5 text-xs gap-1.5">
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                Actualizar
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 stagger">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton min-w-[240px] h-32 flex-shrink-0" />
                ))
              ) : nearbyEvents.length === 0 ? (
                <p className="text-ink-500 text-sm py-4">
                  No hay eventos en este radio. ¡Crea el primero!
                </p>
              ) : (
                nearbyEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    compact
                    onClick={() => { flyToEvent(event); setSelected(event) }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event detail sheet */}
      {selected && (
        <div className="absolute inset-0 z-20 flex items-end pointer-events-none">
          <div className="pointer-events-auto w-full max-w-md mx-auto mb-6 px-4 animate-fade-up">
            <EventCard
              event={selected}
              onClose={() => setSelected(null)}
              onView={() => navigate(`/events/${selected.id}`)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
