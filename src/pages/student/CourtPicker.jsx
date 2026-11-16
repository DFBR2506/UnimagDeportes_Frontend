import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Clock, MapPinned, Users } from 'lucide-react'
import GlowHover from '@/components/smoothui/glow-hover-card'
import Badge from '@/components/smoothui/badge'
import Empty from '@/components/smoothui/empty'
import Skeleton from '@/components/smoothui/skeleton'
import PageHeader from '@/components/app/PageHeader'
import CourtArt, { courtKind } from '@/components/app/CourtArt'
import useSpaceImage from '@/lib/useSpaceImage'
import { EASE } from '@/lib/anim'
import { formatHour, todayISO } from '@/data/domain'
import { useApp } from '@/store'

function CourtCard({ space, freeToday, disciplineNames, onOpen, ref }) {
  const image = useSpaceImage(space.id, 'PREVIEW')
  return (
    <button
      ref={ref}
      className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-xs transition-shadow duration-500 hover:shadow-xl hover:shadow-sidebar/10 focus-ring"
      onClick={() => onOpen(space.id)}
      type="button"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <div className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]">
          {image ? (
            <img alt="" className="h-full w-full object-cover" draggable={false} src={image} />
          ) : (
            <CourtArt kind={courtKind(space)} />
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-sidebar/80 to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {disciplineNames.map((d) => (
            <span key={d} className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-sidebar shadow-sm">
              {d}
            </span>
          ))}
        </div>
        <p className="absolute bottom-3 left-4 font-display text-lg font-semibold text-white drop-shadow">
          {space.name}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            {formatHour(space.open)} – {formatHour(space.close)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-4" />
            Aforo {space.aforo}
          </span>
        </div>
        {space.requirements && <p className="text-xs text-muted-foreground">{space.requirements}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          {freeToday == null ? (
            <Skeleton className="h-5 w-32 rounded-full" />
          ) : (
            <Badge variant={freeToday > 0 ? 'success' : 'secondary'}>
              {freeToday > 0 ? `${freeToday} franjas libres hoy` : 'Sin franjas hoy'}
            </Badge>
          )}
          <span className="flex items-center gap-1 text-sm font-medium text-accent-ink">
            Ver horario
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </button>
  )
}

export default function CourtPicker() {
  const navigate = useNavigate()
  const { spaces, spacesLoaded, refreshSpaces, fetchAvailability, disciplineById } = useApp()
  const [freeToday, setFreeToday] = useState({}) // spaceId → franjas reservables hoy

  // GET /spaces solo trae espacios activos (RN-09); se refresca al entrar.
  useEffect(() => {
    refreshSpaces().catch(() => {})
  }, [refreshSpaces])

  const ids = spaces.map((s) => s.id).join(',')
  useEffect(() => {
    if (!ids) return
    const controller = new AbortController()
    const today = todayISO()
    for (const id of ids.split(',')) {
      fetchAvailability(id, today, undefined, controller.signal)
        .then((slots) =>
          setFreeToday((prev) => ({
            ...prev,
            [id]: slots.filter((s) => s.estado === 'libre' && s.bookable).length,
          }))
        )
        .catch(() => {})
    }
    return () => controller.abort()
    // fetchAvailability cambia con las reservas propias; basta con recalcular por espacios
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids])

  const items = spaces.map((space) => ({
    id: space.id,
    element: (
      <CourtCard
        disciplineNames={space.disciplines.map((d) => disciplineById(d)?.name ?? d)}
        freeToday={freeToday[space.id]}
        onOpen={(id) => navigate(`/app/disponibilidad/${id}`)}
        space={space}
      />
    ),
  }))

  return (
    <div className="space-y-8">
      <PageHeader
        title="Disponibilidad"
        subtitle="Elige una cancha para ver su recorrido 360° y el calendario de franjas."
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
      >
        {!spacesLoaded ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        ) : spaces.length === 0 ? (
          <Empty
            className="rounded-2xl border border-border bg-card py-14"
            description="Cuando el área de deportes habilite espacios, aparecerán aquí."
            icon={<MapPinned className="size-6" />}
            title="No hay espacios disponibles"
          />
        ) : (
          <GlowHover
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
            glowIntensity={0.12}
            items={items}
            maskSize={360}
          />
        )}
      </motion.div>
    </div>
  )
}
