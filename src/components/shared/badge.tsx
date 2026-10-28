import { AccentEnum } from '../../core/enums/accent'
import { SizeEnum } from '../../core/enums/size'

type TBadgeProps = {
  children?: React.ReactNode
  accent?: AccentEnum
  size?: SizeEnum
  className?: string
  title?: string
}

function Badge({ children, accent = AccentEnum.MUTED, size = SizeEnum.MD, className, title }: TBadgeProps) {
  return (
    <span className={`badge badge-${accent} badge-${size}${className ? ` ${className}` : ''}`} title={title}>
      {children}
    </span>
  )
}

export { Badge }
