import { AccentEnum } from '../../core/enums/accent'

type TBadgeProps = {
  children?: React.ReactNode
  accent?: AccentEnum
  className?: string
  title?: string
}

function Badge({ children, accent, className, title }: TBadgeProps) {
  return (
    <span className={`badge badge-${accent}${className ? ` ${className}` : ''}`} title={title}>
      {children}
    </span>
  )
}

export { Badge }
