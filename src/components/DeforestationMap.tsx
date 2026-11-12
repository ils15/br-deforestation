import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import type { Feature, Geometry, GeoJsonObject } from 'geojson'
import type { LatLngBoundsExpression, Layer, PathOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'

import MapLegend from './MapLegend'
import { escapeHtml } from '../lib/mapHelpers'

const DEFOR_COLORS = ['#fee0d2', '#fc9272', '#de2d26', '#a50f15', '#67000d']

export interface DeforestationMapProps {
  data: Record<string, number>
  year: number
  biome: string
  onStateClick?: (state: string, km2: number) => void
}

interface UfProperties {
  nome: string
  sigla: string
}

function colorFor(value: number, min: number, max: number): string {
  if (max <= min) return DEFOR_COLORS[DEFOR_COLORS.length - 1]
  const t = (value - min) / (max - min)
  const idx = Math.min(
    DEFOR_COLORS.length - 1,
    Math.max(0, Math.floor(t * (DEFOR_COLORS.length - 1))),
  )
  return DEFOR_COLORS[idx]
}

function ResizeInvalidator() {
  const map = useMap()
  useEffect(() => {
    const invalidate = () => {
      try { map.invalidateSize() } catch { /* ignore */ }
    }
    invalidate()
    let ro: ResizeObserver | null = null
    try {
      const container = typeof map.getContainer === 'function' ? map.getContainer() : null
      if (typeof ResizeObserver !== 'undefined' && container) {
        ro = new ResizeObserver(() => invalidate())
        ro.observe(container)
      }
    } catch { /* ignore */ }
    const onResize = () => invalidate()
    if (typeof window !== 'undefined') window.addEventListener('resize', onResize)
    return () => {
      ro?.disconnect()
      if (typeof window !== 'undefined') window.removeEventListener('resize', onResize)
    }
  }, [map])
  return null
}

export default function DeforestationMap({
  data,
  year,
  biome,
  onStateClick,
}: DeforestationMapProps) {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null)

  useEffect(() => {
    let cancelled = false
    if (typeof fetch === 'undefined') return () => { cancelled = true }
    fetch(`${import.meta.env.BASE_URL}geo/br-uf.geojson`)
      .then((res) => res.json())
      .then((json: unknown) => {
        if (!cancelled) setGeoData(json as GeoJsonObject)
      })
      .catch(() => {
        if (!cancelled) setGeoData(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const values = useMemo(() => Object.values(data), [data])
  const min = values.length ? Math.min(...values) : 0
  const maxRaw = values.length ? Math.max(...values) : 0
  const max = maxRaw === 0 ? 1 : maxRaw

  const styleFn = useMemo(
    () =>
      (feature: Feature<Geometry, UfProperties> | undefined): PathOptions => {
        const nome = feature?.properties?.nome ?? ''
        const value = Object.prototype.hasOwnProperty.call(data, nome)
          ? data[nome]
          : 0
        return {
          fillColor: colorFor(value, min, max),
          weight: 1,
          color: '#1f2937',
          fillOpacity: 0.75,
        }
      },
    [data, min, max],
  )

  const onEachFeature = useMemo(
    () =>
      (feature: Feature<Geometry, UfProperties>, layer: Layer): void => {
        const nome = feature.properties?.nome ?? ''
        const sigla = feature.properties?.sigla ?? ''
        const value = Object.prototype.hasOwnProperty.call(data, nome)
          ? data[nome]
          : 0
        const tooltip = `${escapeHtml(nome)} (${escapeHtml(sigla)}) — ${value.toLocaleString('pt-BR')} km²`
        const withTooltip = layer as Layer & {
          bindTooltip?: (content: string | HTMLElement, options?: unknown) => void
        }
        if (typeof withTooltip.bindTooltip === 'function') {
          withTooltip.bindTooltip(tooltip, { sticky: true })
        }
        const pathEl = (layer as Layer & { getElement?: () => HTMLElement | null }).getElement?.()
          ?? (layer as { _path?: HTMLElement })._path
        const targets: Array<HTMLElement | Layer> = []
        if (pathEl) targets.push(pathEl)
        // Fallback for mocks/tests that treat the layer itself as the path.
        targets.push(layer)
        for (const target of targets) {
          if (target && typeof target === 'object') {
            try { (target as { tabIndex?: number }).tabIndex = 0 } catch { /* ignore */ }
            if (typeof (target as { setAttribute?: (a: string, b: string) => void }).setAttribute === 'function') {
              (target as { setAttribute: (a: string, b: string) => void }).setAttribute('role', 'button')
            }
          }
        }
        const clickable = layer as Layer & {
          on?: (event: string, handler: (e?: unknown) => void) => void
        }
        if (typeof clickable.on === 'function' && onStateClick) {
          const handler = () => onStateClick(nome, value)
          clickable.on('click', handler)
          clickable.on('keydown', (e: unknown) => {
            const key = (e as { originalEvent?: KeyboardEvent; key?: string })?.originalEvent?.key
              ?? (e as { key?: string })?.key
            if (key === 'Enter' || key === ' ') handler()
          })
        }
      },
    [data, onStateClick],
  )

  const bounds: LatLngBoundsExpression = [
    [-34, -74],
    [6, -34],
  ]

  return (
    <div className="deforestation-map-wrap">
      <div className="deforestation-map-meta">
        <span className="deforestation-map-title">
          {biome} — {year}
        </span>
      </div>
      <MapContainer
        center={[-14, -52]}
        zoom={4}
        style={{ height: '420px', width: '100%' }}
        bounds={bounds}
        scrollWheelZoom={false}
        aria-label="Mapa de desmatamento por estado"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoData !== null && (
          <GeoJSON data={geoData} style={styleFn} onEachFeature={onEachFeature} />
        )}
        <ResizeInvalidator />
      </MapContainer>
      <MapLegend min={min} max={maxRaw === 0 ? 1 : maxRaw} title={`${biome} ${year}`} />
    </div>
  )
}



