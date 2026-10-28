import icons from '../../icons'

type TIconProps = {
  name: keyof typeof icons
}

function Icon({ name }: TIconProps) {
  const icon = icons?.[name]

  if (!icon) return null

  return (
    <svg width={icon.width} height={icon.height} viewBox={icon.viewBox}>
      <path d={icon.path} />
    </svg>
  )
}

export { Icon }
