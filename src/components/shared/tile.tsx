import { AccentEnum } from '../../core/enums/accent'
import { SizeEnum } from '../../core/enums/size'
import type { TTileProps } from '../../core/meta/t-component'

function Tile({ children, accent = AccentEnum.PRIMARY, size = SizeEnum.MD }: TTileProps) {
  return <span className={`tile tile-${accent} tile-${size}`}>{children}</span>
}

export { Tile }
