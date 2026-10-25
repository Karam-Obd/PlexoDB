import { useRef } from 'react'
import { useCanvasStore } from '../../store/canvas-store'

type TUseDraggableOptions = {
  onDrag: (dx: number, dy: number, e: React.PointerEvent<HTMLElement>) => void
  onDragStart?: (e: React.PointerEvent<HTMLElement>) => void
  onDragEnd?: (e: React.PointerEvent<HTMLElement>) => void
  scaleAware?: boolean
  stopPropagation?: boolean
  filter?: (e: React.PointerEvent<HTMLElement>) => boolean
  allowedButtons?: number[]
}

function useDraggable({
  onDrag,
  onDragStart,
  onDragEnd,
  scaleAware = false,
  stopPropagation = false,
  filter,
  allowedButtons = [0],
}: TUseDraggableOptions) {
  const isDraggingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (!allowedButtons.includes(e.button)) return
    if (filter && !filter(e)) return

    if (stopPropagation) {
      e.stopPropagation()
    }

    isDraggingRef.current = true
    lastPosRef.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
    onDragStart?.(e)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!isDraggingRef.current) return

    const rawDx = e.clientX - lastPosRef.current.x
    const rawDy = e.clientY - lastPosRef.current.y
    lastPosRef.current = { x: e.clientX, y: e.clientY }

    const scale = scaleAware ? useCanvasStore.getState().viewport.scale : 1
    const dx = rawDx / scale
    const dy = rawDy / scale

    onDrag(dx, dy, e)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // Ignore if pointer capture was already released
      }
      onDragEnd?.(e)
    }
  }

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
  }
}

export { useDraggable }
export type { TUseDraggableOptions }
