import Court360 from '@/components/app/Court360'
import { courtKind } from '@/components/app/CourtArt'
import useSpacePanorama from '@/lib/useSpacePanorama'

export default function SpacePanorama({ space, className, version = 0 }) {
  const panorama = useSpacePanorama(space?.id, version)
  return (
    <Court360
      className={className}
      error={panorama.error}
      imageUrl={panorama.url}
      kind={courtKind(space)}
      name={space?.name}
      onRetry={panorama.retry}
      status={panorama.status}
    />
  )
}
