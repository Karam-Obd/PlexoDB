import icons from '../../icons.json'
import type { TIconProps } from '../../core/meta/t-component'

function Icon({ name, className }: TIconProps) {
  const icon = icons?.[name]

  if (!icon) return null

  return (
    <svg width={icon.width} height={icon.height} viewBox={icon.viewBox} className={className}>
      <path d={icon.path} />
    </svg>
  )
}

export { Icon }
