import type { PointerEvent } from 'react'

type TUseDraggableOptions = {
  onDrag: (dx: number, dy: number, e: PointerEvent<HTMLElement>) => void
  onDragStart?: (e: PointerEvent<HTMLElement>) => void
  onDragEnd?: (e: PointerEvent<HTMLElement>) => void
  scaleAware?: boolean
  stopPropagation?: boolean
  filter?: (e: PointerEvent<HTMLElement>) => boolean
  allowedButtons?: number[]
}

export type { TUseDraggableOptions }

