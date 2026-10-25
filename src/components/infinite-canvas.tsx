import { useEffect, useRef, type ReactNode } from 'react'
import { useCanvasStore } from '../store/canvas-store'
import { useDraggable } from '../core/hooks/use-draggable'

type TInfiniteCanvasProps = {
  children?: ReactNode
}

function InfiniteCanvas({ children }: TInfiniteCanvasProps) {
  const panX = useCanvasStore(s => s.viewport.panX)
  const panY = useCanvasStore(s => s.viewport.panY)
  const scale = useCanvasStore(s => s.viewport.scale)
  const pan = useCanvasStore(s => s.pan)
  const zoom = useCanvasStore(s => s.zoom)
  const gridSize = 24 * scale
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = -e.deltaY * 0.001
      zoom(delta, { clientX: e.clientX, clientY: e.clientY })
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [zoom])

  const dragHandlers = useDraggable({
    allowedButtons: [0, 1],
    filter: e => {
      const isCard = (e.target as HTMLElement).closest('[data-canvas-node="true"]')
      return !(isCard && e.button === 0)
    },
    onDrag: (dx, dy) => {
      pan(dx, dy)
    }
  })

  return (
    <div
      ref={containerRef}
      {...dragHandlers}
      className="canvas"
      style={{
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${panX}px ${panY}px`
      }}
    >
      <div
        className="canvas-content"
        style={{
          transform: `translate3d(${panX}px, ${panY}px, 0) scale(${scale})`
        }}
      >
        <div className="canvas-children">{children}</div>
      </div>
    </div>
  )
}

export { InfiniteCanvas }
