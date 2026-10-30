import { AccentEnum } from '../../core/enums/accent'
import { SizeEnum } from '../../core/enums/size'
import type { TBadgeProps } from '../../core/meta/t-component'

function Badge({ children, accent = AccentEnum.MUTED, size = SizeEnum.MD, className, title }: TBadgeProps) {
  return (
    <span className={`badge badge-${accent} badge-${size}${className ? ` ${className}` : ''}`} title={title}>
      {children}
    </span>
  )
}

export { Badge }
